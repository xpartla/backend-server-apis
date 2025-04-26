use boa_engine::{Context, JsValue, JsString, Source, property::Attribute, native_function::NativeFunction, object::{ObjectInitializer, FunctionObjectBuilder}, JsError};
use std::fs;
use crate::utils::parse_query_params;

const JSFILE: &str = "./dist/bundle.js";

pub fn process_post_with_js(path: &str, payload_json: &str) -> String {
    let mut context = Context::default();
    inject_console(&mut context);

    let js_code = fs::read_to_string(JSFILE)
        .unwrap_or_else(|_| panic!("Unable to read JS file: {}", JSFILE));

    context.eval(Source::from_bytes(js_code.as_bytes()))
        .expect("JS eval failed");

    let js_call = format_js_for_request("POST", path, payload_json);
    eval_js_string(&mut context, js_call)
}

pub fn process_get_with_js(path: &str, payload_json: &str) -> String {
    let mut context = Context::default();
    inject_console(&mut context);

    let js_code = fs::read_to_string(JSFILE)
        .unwrap_or_else(|_| panic!("Unable to read JS file: {}", JSFILE));

    context.eval(Source::from_bytes(js_code.as_bytes()))
        .expect("JS eval failed");

    let js_call = format_js_for_request("GET", path, payload_json);
    eval_js_string(&mut context, js_call)
}

fn eval_js_string(context: &mut Context, js_call: String) -> String {
    match context.eval(Source::from_bytes(js_call.as_bytes())) {
        Ok(val) => match val.to_string(context) {
            Ok(js_str) => js_str.to_std_string().unwrap_or_else(|_| "{\"error\": \"Invalid JS string\"}".to_string()),
            Err(_) => "{\"error\": \"No output\"}".to_string(),
        },
        Err(err) => format!("{{\"error\": \"JS Error: {}\"}}", err.to_string()),
    }
}

fn format_js_for_request(method: &str, path: &str, payload_json: &str) -> String {
    let body_js = serde_json::from_str::<serde_json::Value>(payload_json)
        .unwrap_or_default()
        .to_string();

    let query_json = parse_query_params(path);
    let query_js = serde_json::from_str::<serde_json::Value>(&query_json)
        .unwrap_or_default()
        .to_string();

    let clean_path = path.split('?').next().unwrap_or(path);

    format!(r#"
        (function() {{
            let req = {{ method: "{method}", path: "{path}", body: {body}, query: {query} }};
            let res = {{}};
            dispatch(req, res);
            return JSON.stringify(res);
        }})()
    "#, method = method, path = clean_path, body = body_js, query = query_js)
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
