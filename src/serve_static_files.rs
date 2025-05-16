use std::fs::File;
use std::path::Path;
use tiny_http::{Response, Header};

pub(crate) fn serve_static_file(path: &str) -> Option<Response<File>> {
    let decoded_path = percent_encoding::percent_decode_str(path)
        .decode_utf8()
        .unwrap_or_else(|_| path.into());
    let mut file_path = format!("dist/public{}", decoded_path);
    if file_path == "dist/public" || file_path.ends_with('/') {
        file_path.push_str("index.html");
    }
    
    let path = Path::new(&file_path);
    if path.exists() && path.is_file() {
        let content_type = match path.extension().and_then(|ext| ext.to_str()) {
            Some("html") => "text/html",
            Some("css") => "text/css",
            Some("js") => "application/javascript",
            Some("png") => "image/png",
            Some("jpg") | Some("jepg") => "image/jpeg",
            Some("svg") => "image/svg+xml",
            _ => "application/octet-stream",
        };
        
        let file = File::open(path).ok()?;
        Some(Response::from_file(file)
            .with_header(Header::from_bytes("Content-Type", content_type).unwrap())
            .with_header(Header::from_bytes("Access-Control-Allow-Origin", "*").unwrap())
        )
    }
    else{
        None
    }
}