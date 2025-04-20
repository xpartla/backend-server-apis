use tiny_http::{Server, Method};
use crate::utils::{create_bad_request_response, create_json_response, create_not_found_response};
use crate::js_engine::{process_post_with_js, process_get_with_js};

pub fn run() {
    let server = Server::http("0.0.0.0:8000").unwrap();
    println!("Running on http://0.0.0.0:8000");

    for mut request in server.incoming_requests() {
        let method = request.method().clone();
        let path = request.url().to_string();

        let mut body = String::new();
        if let Err(_) = request.as_reader().read_to_string(&mut body) {
            request.respond(create_bad_request_response()).unwrap();
            continue;
        }

        let response = match method {
            Method::Post => {
                let js_result = process_post_with_js(&path, &body);
                create_json_response(js_result)
            }
            Method::Get => {
                let js_result = process_get_with_js(&path, &body);
                create_json_response(js_result)
            }
            _ => create_not_found_response(),
        };

        request.respond(response).unwrap();
    }
}
