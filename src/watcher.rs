use notify::{RecursiveMode, Watcher, PollWatcher, EventKind, Event, Result as NotifyResult, Config};
use std::{path::Path, sync::mpsc::channel, time::{Duration, Instant}, process::Command, thread};

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