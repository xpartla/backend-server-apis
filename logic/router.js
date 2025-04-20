import {freelancerReport} from './services/freelancer'
import {freelancerHourly} from "./services/freelancer";
import {freelancerChallenge1, freelancerChallenge2, freelancerChallenge3} from "./challenges/freelancerChallenge";
import {digitalCreatorChallenge1, digitalCreatorChallenge2, digitalCreatorChallenge3} from "./challenges/creatorChallenges";
import {saasChallenge1, saasChallenge2, saasChallenge3} from "./challenges/saasChallenges";
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
    'POST /challenge/digital-creator-1' : digitalCreatorChallenge1,
    'POST /challenge/digital-creator-2' : digitalCreatorChallenge2,
    'POST /challenge/digital-creator-3' : digitalCreatorChallenge3,
    'POST /challenge/saas-1': saasChallenge1,
    'POST /challenge/saas-2': saasChallenge2,
    'POST /challenge/saas-3': saasChallenge3,
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