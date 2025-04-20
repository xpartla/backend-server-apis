import {freelancerReport} from './services/freelancer.js'
import {freelancerHourly} from "./services/freelancer.js";
import {digitalCreatorReport} from "./services/digital_creator";
import {saasReport} from "./services/saas";
import {simulateSaas} from "./services/saas";
import {getStatus} from './services/status.js'

const routes = {
    'POST /report/freelancer': freelancerReport,
    'POST /report/freelancer/hourly-rate': freelancerHourly,
    'POST /report/digital-creator' : digitalCreatorReport,
    'POST /report/saas' : saasReport,
    'POST /report/saas-simulation': simulateSaas,
    'GET /status': getStatus,
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