function dispatch(path, payload) {
    return route(path, payload);
}

globalThis.dispatch = dispatch;