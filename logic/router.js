import {freelancerReport} from './services/freelancer'
import {freelancerHourly} from "./services/freelancer";
import {freelancerChallenge1, freelancerChallenge2, freelancerChallenge3} from "./challenges/freelancerChallenge";
import {digitalCreatorReport} from "./services/digital_creator";
import {saasReport} from "./services/saas";
import {simulateSaas} from "./services/saas";
import {getStatus} from './services/status.js'

const routes = {
    'POST /report/freelancer': freelancerReport,
    'POST /report/freelancer/hourly-rate': freelancerHourly,
    'POST /challenge/freelancer-1': freelancerChallenge1,
    'POST /challenge/freelancer-2': freelancerChallenge2,
    'POST /challenge/freelancer-3': freelancerChallenge3,
    'POST /report/digital-creator' : digitalCreatorReport,
    'POST /report/saas' : saasReport,
    'POST /report/saas-simulation': simulateSaas,
    'GET /status': getStatus,
};

export function dispatch(req, res) {
    let routeKey = `${req.method} ${req.path}`;
    let handler = routes[routeKey];

    if (!handler && req.path.startsWith('/challenge/freelancer/')) {
        req.params = { id: req.path.split('/').pop() };
        routeKey = `${req.method} /challenge/freelancer/:id`;
            handler = routes[routeKey];
    }

    if (handler) {
        handler(req, res);
    } else {
        res.status = 404;
        res.body = {error: `No handler for ${routeKey}`};
    }
}