import {spendingReport} from './services/report'

const routes = {
    'POST /report': spendingReport
};

export function dispatch(req, res){
    const routeKey = `${req.method} ${req.path}`;
    const handler = routes[routeKey];

    if (handler) {
        handler(req, res);
    }
    else {
        res.status = 404;
        res.body = {error: `No handler for ${routeKey}`};
    }
}