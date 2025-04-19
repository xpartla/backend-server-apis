// logic/services/freelancer.js
function freelancerReport(req, res) {
  console.log("freelancerReport called");
  const { fixedCosts, projectRate, profitGoal = 0 } = req.body;
  console.log("Received data:", req.body);
  const breakEvenProjects = Math.ceil(fixedCosts / projectRate);
  const projectsForProfitGoal = Math.ceil((fixedCosts + profitGoal) / projectRate);
  const netProfitPerProject = projectRate - fixedCosts / breakEvenProjects;
  const revenueAtBreakEven = breakEvenProjects * projectRate;
  const revenueWithProfitGoal = projectsForProfitGoal * projectRate;
  res.body = {
    breakEvenProjects,
    projectsForProfitGoal,
    netProfitPerProject,
    revenueAtBreakEven,
    revenueWithProfitGoal
  };
  console.log("Response body:", res.body);
}

// logic/services/status.js
function getStatus(req, res) {
  console.log("getStatus called");
  console.log("Query params:", req.query);
  const name = req.query.name || "anonymous";
  res.body = {
    status: "ok",
    hello: `Hi ${name}`
  };
}

// logic/router.js
var routes = {
  "POST /report/freelancer": freelancerReport,
  "GET /status": getStatus
};
function dispatch(req, res) {
  const routeKey = `${req.method} ${req.path}`;
  const handler = routes[routeKey];
  if (handler) {
    handler(req, res);
  } else {
    res.status = 404;
    res.body = { error: `No handler for ${routeKey}` };
  }
}

// logic/index.js
globalThis.dispatch = dispatch;
