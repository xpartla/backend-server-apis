use tiny_http::{Server, Method, Response, Header};
use boa_engine::{Context, Source, property::Attribute, object::ObjectInitializer, native_function::NativeFunction, JsValue, JsString, JsError};
use std::fs;
use std::io::Cursor;
use boa_engine::object::FunctionObjectBuilder;

const JSFILE: &str = "./logic/bundle.js";

fn main() {
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

fn format_js_for_post(path :&str, payload_json :&str) -> String {
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
        body = payload_json
    )
}

fn format_js_for_get(path :&str, payload_json :&str) -> String {
    format!(
        r#"
        (function() {{
            let req = {{
                method: "GET",
                path: "{path}",
                body: {body}
            }};
            let res = {{}};
            dispatch(req, res);
            return JSON.stringify(res);
        }})()
    "#,
        path = path,
        body = payload_json
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