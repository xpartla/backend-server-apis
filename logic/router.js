function route(path, payload) {
    switch (path) {
        case "/report/freelancer":
            return handleFreelancer(payload);
        case "/report/freelancer/hourly-rate":
            return freelancer.hourly(payload);
        case "/report/digital-creator":
            return digitalCreator(payload);
        case "/report/saas":
            return saas(payload);
        case "/report/saas/simulation":
            return saas.simulation(payload);
        default:
            return { error: "Unknown path" };
    }
}

globalThis.route = route;