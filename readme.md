# 🦀 Krab-JS – A Minimal Rust http server + JS Runtime

## Overview

Krab-JS server is a lightweight, self-contained HTTP server and Javascript Runtime built in Rust. It allows you to write Express.js-like backends without needing to install Node.js or even npm. Everything runs in one portalbe `.exe` file - perfect for code assignments, demos and backend lessons.

---

## Key features

- Single `.exe` file - no Node.js, no dependencies, *no problems*
- Fast HTTP server using `tiny_http`
- Custom JavaScript runtime using [`boa`](https://github.com/boa-dev/boa)
- 'Hot reload' - Live JS file watching and automatic bundling with `esbuild`
- Implementation of console.log and error.log
- Minimal Express-like backend framework written in JS
- Designed for easy API demos and beginner-friendly backend tasks

---

## HTTP methods

- **GET** -> parsing query params from URL calls, accepts JSON body, calls `dispatch(req, res)` in JS
- **POST** -> parsing JSON body and calls `dispatch(req, res)` in JS
- **others** -> not implemented yet (returns 404 atm.)

---

## Future plans

- Add support for query params for POST requests
- Add support for the rest of HTTP methods
- Add support for middleware (enable hooks)
- File uploading
- Multi-threading

---

## Project Structure

```bash
.
├── logic/             # JavaScript backend code (entry = logic/index.js)
├── dist/              # Auto-bundled JS output (bundle.js)
├── esbuild.exe        # Local esbuild binary for bundling
├── src/
│   ├── main.rs        # App entry point
│   ├── server.rs      # HTTP request handler
│   ├── js_engine.rs   # JS runtime loader (Boa)
│   ├── watcher.rs     # JS file watcher + esbuild bundler
│   └── utils.rs       # Common helpers (responses, query parsing, etc.)
```

---

## JavaScript API examples

#### Router

```javascript
import {getStatus} from './services/status.js'

const routes = {
    'GET /status': getStatus
    //...
};

export function dispatch(req, res) {
    const routeKey = `${req.method} ${req.path}`;
    const handler = routes[routeKey];

    if (handler) {
        handler(req, res);
    } else {
        res.status = 404;
        res.body = {error: `No handler for ${routeKey}`};
    }
}
```

#### Endpoint Function

```javascript
export function getStatus(req, res) {
    const {
        name,
        address    
    } = req.body;
    //...
    res.body = {
        address: `Your address is ${address}` ,
        name: `Hi ${name}`
    };
}
```

---
