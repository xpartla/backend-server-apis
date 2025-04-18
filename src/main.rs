use tiny_http::{Server, Method, Response, Header};
use boa_engine::{Context, JsResult, Source};
use std::fs;
use std::io::Cursor;

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
        } else if(request.method() == &Method::Get) {
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
    let res = Response::from_string("{\"error\": \"Bad Request\"}")
        .with_status_code(400)
        .with_header(Header {
            field: "Content-Type".parse().unwrap(),
            value: "application/json".parse().unwrap(),
        });
    return res;
}

fn create_not_found_response() -> Response<Cursor<Vec<u8>>> {
    let res = Response::from_string("{\"error\": \"Not Found\"}")
        .with_status_code(404)
        .with_header(Header {
            field: "Content-Type".parse().unwrap(),
            value: "application/json".parse().unwrap(),
        });
    return res;
}

fn create_json_response(js_result: String) -> Response<Cursor<Vec<u8>>> {
    let res = Response::from_string(js_result)
        .with_header(Header {
            field: "Content-Type".parse().unwrap(),
            value: "application/json".parse().unwrap()
        });
    return res;
}

fn process_post_with_js(path: &str, payload_json: &str) -> String {
    let mut context = Context::default();

    let files = vec!["./logic/services/freelancer.js", "./logic/router.js", "./logic/index.js"];
    for file in files {
        let js_code = fs::read_to_string(file).unwrap_or_else(|_| {
            panic!("Unable to read JS file: {}", file);
        });

        context
            .eval(Source::from_bytes(js_code.as_bytes()))
            .expect(&format!("JS eval failed for {}", file));
    }

    let js_call = format!(
        "JSON.stringify(dispatch(`{}`, JSON.parse(`{}`)))",
        path,
        payload_json.replace('`', "\\`")
    );

    match context.eval(Source::from_bytes(js_call.as_bytes())) {
        Ok(val) => match val.to_string(&mut context) {
            Ok(js_str) => js_str.to_std_string().unwrap_or_else(|_| "{\"error\": \"Invalid JS string\"}".to_string()),
            Err(_) => "{\"error\": \"No output\"}".to_string(),
        },
        Err(err) => {
            let err_msg = format!(
                "{{\"error\": \"JS Error: {}\"}}",
                err.to_string()
            );
            err_msg
        }
    }
}

fn process_get_with_js(path: &str, payload: &str) -> String {
    
}
