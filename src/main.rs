mod server;
mod js_engine;
mod watcher;
mod utils;
mod serve_static_files;

fn main() {
    if let Err(e) = watcher::start_js_watcher() {
        eprintln!("Watcher error: {:?}", e);
    }
    server::run();
}