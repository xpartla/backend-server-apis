use std::collections::HashMap;
use tiny_http::{Server, Method, Response, Header};
use boa_engine::{Context, Source, property::Attribute, object::ObjectInitializer, native_function::NativeFunction, JsValue, JsString, JsError};
use std::{fs, thread};
use std::io::Cursor;
use std::path::Path;
use boa_engine::object::FunctionObjectBuilder;
use url::Url;
use notify::{RecursiveMode, Result as NotifyResult, Watcher, EventKind, Event, PollWatcher, Config};
use std::process::Command;
use std::sync::mpsc::channel;
use std::time::{Duration, Instant};

const JSFILE: &str = "./dist/bundle.js";

fn main() {
    start_js_watcher().expect("Failed to start JS watcher");

    let server = Server::http("0.0.0.0:8000").unwrap();
    println!("Running on http://0.0.0.0:8000");

    for mut request in server.incoming_requests() {
        if request.method() == &Method::Post {
            let path = request.url().to_string();

            let mut body = String::new();
            if let Err(_) = request.as_reader().read_to_string(&mut body) {
                let res = create_bad_request_response();
                request.respond(res).unwrap();
                continue;
            }

            let js_result = process_post_with_js(&path, &body);
            let res = create_json_response(js_result);
            request.respond(res).unwrap();
        } else if request.method() == &Method::Get {
            let path = request.url().to_string();

            let mut body = String::new();
            if let Err(_) = request.as_reader().read_to_string(&mut body) {
                let res = create_bad_request_response();
                request.respond(res).unwrap();
                continue;
            }
            let js_result = process_get_with_js(&path, &body);
            let res = create_json_response(js_result);
            request.respond(res).unwrap();
        } else {
            let res = create_not_found_response();
            request.respond(res).unwrap();
        }
    }
}

fn create_bad_request_response() -> Response<Cursor<Vec<u8>>> {
    Response::from_string("{\"error\": \"Bad Request\"}")
        .with_status_code(400)
        .with_header(Header {
            field: "Content-Type".parse().unwrap(),
            value: "application/json".parse().unwrap(),
        })
}

fn create_not_found_response() -> Response<Cursor<Vec<u8>>> {
    Response::from_string("{\"error\": \"Not Found\"}")
        .with_status_code(404)
        .with_header(Header {
            field: "Content-Type".parse().unwrap(),
            value: "application/json".parse().unwrap(),
        })
}

fn create_json_response(js_result: String) -> Response<Cursor<Vec<u8>>> {
    Response::from_string(js_result)
        .with_header(Header {
            field: "Content-Type".parse().unwrap(),
            value: "application/json".parse().unwrap()
        })
}

fn process_post_with_js(path: &str, payload_json: &str) -> String {
    let mut context = Context::default();
    inject_console(&mut context);
    let file = JSFILE;
    let js_code = fs::read_to_string(file).unwrap_or_else(|_| {
        panic!("Unable to read JS file: {}", file);
    });

    context
        .eval(Source::from_bytes(js_code.as_bytes()))
        .expect(&format!("JS eval failed for {}", file));

    let js_call = format_js_for_post(path, payload_json);

    match_js_string(&mut context, js_call)
}

fn process_get_with_js(path: &str, payload_json: &str) -> String {
    let mut context = Context::default();
    inject_console(&mut context);
    let file = JSFILE;
    let js_code = fs::read_to_string(file).unwrap_or_else(|_| {
        panic!("Unable to read JS file: {}", file);
    });

    context
        .eval(Source::from_bytes(js_code.as_bytes()))
        .expect(&format!("JS eval failed for {}", file));

    let js_call = format_js_for_get(path, payload_json);

    match_js_string(&mut context, js_call)
}

fn parse_query_params(url: &str) -> String {
    if let Ok(full_url) = Url::parse(&format!("http://localhost{}", url)) {
        let query_map: HashMap<_, _> = full_url.query_pairs().into_owned().collect();
        serde_json::to_string(&query_map).unwrap_or("{}".to_string())
    } else {
        "{}".to_string()
    }
}


fn format_js_for_post(path: &str, payload_json: &str) -> String {
    let body_value: serde_json::Value = serde_json::from_str(payload_json).unwrap_or_else(|_| serde_json::json!({}));
    let body_js = body_value.to_string();

    format!(
        r#"
        (function() {{
            let req = {{
                method: "POST",
                path: "{path}",
                body: {body}
            }};
            let res = {{}};
            dispatch(req, res);
            return JSON.stringify(res);
        }})()
    "#,
        path = path,
        body = body_js
    )
}

fn format_js_for_get(path: &str, payload_json: &str) -> String {
    let query_json = parse_query_params(path);
    let query_value: serde_json::Value = serde_json::from_str(&query_json).unwrap_or_else(|_| serde_json::json!({}));
    let body_value: serde_json::Value = serde_json::from_str(payload_json).unwrap_or_else(|_| serde_json::json!({}));

    let query_js = query_value.to_string();
    let body_js = body_value.to_string();
    let clean_path = path.split('?').next().unwrap_or(path);

    format!(
        r#"
        (function() {{
            let req = {{
                method: "GET",
                path: "{path}",
                body: {body},
                query: {query}
            }};
            let res = {{}};
            dispatch(req, res);
            return JSON.stringify(res);
        }})()
    "#,
        path = clean_path,
        body = body_js,
        query = query_js
    )
}

fn match_js_string(context: &mut Context, js_call: String) -> String {
    match context.eval(Source::from_bytes(js_call.as_bytes())) {
        Ok(val) => match val.to_string(context) {
            Ok(js_str) => js_str.to_std_string().unwrap_or_else(|_| "{\"error\": \"Invalid JS string\"}".to_string()),
            Err(_) => "{\"error\": \"No output\"}".to_string(),
        },
        Err(err) => format!("{{\"error\": \"JS Error: {}\"}}", err.to_string()),
    }
}

fn create_msg(args: &[JsValue], context: &mut Context) -> Result<String, JsError> {
    let msg = args
        .iter()
        .map(|val| val.to_string(context))
        .collect::<Result<Vec<_>, _>>()?
        .into_iter()
        .map(|s| s.to_std_string().unwrap_or_default())
        .collect::<Vec<_>>()
        .join(" ");

    Ok(msg)
}

fn inject_console(context: &mut Context) {
    let log_fn = unsafe {
        NativeFunction::from_closure(|_this, args, context| {
            let msg = create_msg(args, context)?;
            println!("[console.log] {}", msg);
            Ok(JsValue::undefined())
        })
    };

    let error_fn = unsafe {
        NativeFunction::from_closure(|_this, args, context| {
            let msg = create_msg(args, context)?;
            eprintln!("[console.error] {}", msg);
            Ok(JsValue::undefined())
        })
    };

    let realm = context.realm();

    let log_fn_obj = FunctionObjectBuilder::new(realm, log_fn)
        .name("log")
        .length(1)
        .build();

    let error_fn_obj = FunctionObjectBuilder::new(realm, error_fn)
        .name("error")
        .length(1)
        .build();

    let console = ObjectInitializer::new(context)
        .property(JsString::from("log"), log_fn_obj, Attribute::all())
        .property(JsString::from("error"), error_fn_obj, Attribute::all())
        .build();

    context
        .register_global_property(JsString::from("console"), console, Attribute::all())
        .unwrap();
}

pub fn start_js_watcher() -> NotifyResult<thread::JoinHandle<()>> {
    let (tx, rx) = channel::<Event>();

    let handle = thread::spawn(move || {
        let mut watcher = PollWatcher::new(
            move |res: Result<Event, notify::Error>| {
                if let Ok(event) = res {
                    let _ = tx.send(event);
                }
            },
            Config::default().with_poll_interval(Duration::from_secs(1)),
        ).expect("Failed to initialize watcher");

        watcher
            .watch(Path::new("./logic"), RecursiveMode::Recursive)
            .expect("Failed to start watching ./logic");

        println!("Watching ./logic for changes...");

        let debounce_duration = Duration::from_millis(500);
        let mut last_event = Instant::now() - debounce_duration;

        while let Ok(event) = rx.recv() {
            if matches!(event.kind, EventKind::Modify(_) | EventKind::Create(_) | EventKind::Remove(_)) {
                let now = Instant::now();
                if now.duration_since(last_event) >= debounce_duration {
                    last_event = now;
                    println!("Change detected. Bundling JS...");

                    let output = Command::new("./esbuild.exe")
                        .arg("logic/index.js")
                        .arg("--bundle")
                        .arg("--platform=neutral")
                        .arg("--format=esm")
                        .arg("--outfile=dist/bundle.js")
                        .output();

                    match output {
                        Ok(result) if result.status.success() => {
                            println!("JS bundling complete");
                        }
                        Ok(result) => {
                            eprintln!("JS bundling failed:");
                            eprintln!("{}", String::from_utf8_lossy(&result.stderr));
                        }
                        Err(e) => {
                            eprintln!("Failed to execute esbuild: {}", e);
                        }
                    }
                }
            }
        }
    });

    Ok(handle)
}