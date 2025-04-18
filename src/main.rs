use tiny_http::{Server, Method, Response, Header};
use std::io::Cursor;
use rquickjs::{Runtime, Context, Value, Function};
use serde_json::{json, Value as JsonValue};

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
            let js_result = process_post_with_js(&path, &body);
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
    let rt = Runtime::new().unwrap();
    let ctx = Context::full(&rt).unwrap();

    ctx.with(|ctx| {

        let result: Result<(), _> = ctx.eval_file("./logic/bundle.js");
        if let Err(err) = result {
            use rquickjs::Error;
            match &err {
                Error::Exception => {},
                _ => {
                    eprintln!("QuickJS failed: {}", err);
                    return json!({
                        "error": "Failed to load bundle.js",
                        "details": format!("{}", err)
                    }).to_string();
                }
            }
        }

        let body: JsonValue = serde_json::from_str(payload_json).unwrap_or_else(|_| json!({}));

        let req_json: JsonValue = json!({
            "method": "POST",
            "path": path,
            "body": body
        });

        let res_json: JsonValue = json!({
            "status": 200,
            "body": {}
        });

        let req_json_str = serde_json::to_string(&req_json).unwrap();
        let req: Value = ctx.eval(format!("({})", req_json_str)).unwrap();

        let res_json_str = serde_json::to_string(&res_json).unwrap();
        let res: Value = ctx.eval(format!("({})", res_json_str)).unwrap();

        let dispatch: Function = ctx.globals().get("dispatch").unwrap();
        let result = dispatch.call::<(Value, Value), ()>((req.clone(), res.clone()));
        match result {
            Ok(_) => println!("JavaScript call succeeded"),
            Err(err) => eprintln!("JavaScript call failed: {:?}", err),
        }

        // Debugging: Check the res type and serialize it
        let res_check: String = ctx.eval("typeof res").unwrap();
        eprintln!("res type: {}", res_check);
        
        let res_check: String = ctx.eval("JSON.stringify(res)").unwrap_or_else(|_| String::from("{}"));
        eprintln!("Serialized res: {}", res_check);

        let res_str: String = match ctx.eval("JSON.stringify(res)") {
            Ok(result) => result,
            Err(err) => {
                eprintln!("QuickJS evaluation failed: {}", err);
                return json!({
                    "error": "Failed to serialize response",
                    "details": format!("{}", err)
                }).to_string();
            }
        };

        let res_final: serde_json::Value = serde_json::from_str(&res_str).unwrap();
        res_final["body"].to_string()
    })
}


// fn process_get_with_js(path: &str, payload: &str) -> String {
//
// }