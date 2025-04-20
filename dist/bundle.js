// logic/services/freelancer.js
function freelancerReport(req, res) {
  console.log("freelancerReport called");
  const {
    fixedCosts,
    projectRate,
    profitGoal = 0
  } = req.body;
  const netProfitPerProject = projectRate;
  const breakEvenProjects = netProfitPerProject > 0 ? Math.ceil(fixedCosts / netProfitPerProject) : 0;
  const projectsForProfitGoal = netProfitPerProject > 0 ? Math.ceil((fixedCosts + profitGoal) / netProfitPerProject) : 0;
  res.body = {
    breakEvenProjects,
    projectsForProfitGoal,
    netProfitPerProject,
    revenueAtBreakEven: breakEvenProjects * projectRate,
    revenueWithProfitGoal: projectsForProfitGoal * projectRate
  };
}
function freelancerHourly(req, res) {
  const {
    fixedCosts,
    profitGoal = 0,
    laborHoursPerProject = 0
  } = req.body;
  const totalTargetIncome = fixedCosts + profitGoal;
  const hourlyRateNeeded = laborHoursPerProject > 0 ? +(totalTargetIncome / laborHoursPerProject).toFixed(2) : 0;
  res.body = {
    laborHoursPerProject,
    hourlyRateNeeded,
    totalTargetIncome
  };
}

// logic/services/digital_creator.js
function digitalCreatorReport(req, res) {
  const {
    fixedCosts,
    productPrice,
    platformFeePercent,
    conversionRate,
    profitGoal = 0
  } = req.body;
  const netProfitPerSale = +(productPrice * (1 - platformFeePercent / 100)).toFixed(2);
  const breakEvenSales = netProfitPerSale > 0 ? Math.ceil(fixedCosts / netProfitPerSale) : 0;
  const salesForProfitGoal = netProfitPerSale > 0 ? Math.ceil((fixedCosts + profitGoal) / netProfitPerSale) : 0;
  const visitorsForBreakEven = conversionRate > 0 ? Math.ceil(breakEvenSales / (conversionRate / 100)) : 0;
  const visitorsForProfitGoal = conversionRate > 0 ? Math.ceil(salesForProfitGoal / (conversionRate / 100)) : 0;
  res.body = {
    breakEvenSales,
    salesForProfitGoal,
    netProfitPerSale,
    totalRevenueAtBreakEven: breakEvenSales * productPrice,
    totalRevenueWithProfitGoal: salesForProfitGoal * productPrice,
    visitorsForBreakEven,
    visitorsForProfitGoal
  };
}

// logic/services/saas.js
function saasReport(req, res) {
  const result = calculateSaasReport(req.body);
  res.body = result;
  return result;
}
function simulateSaas(req, res) {
  const {
    pricePerUser,
    variableCostPerUser
  } = req.body;
  const original = calculateSaasReport(req.body);
  const priceMinus10 = calculateSaasReport({
    ...req.body,
    pricePerUser: pricePerUser * 0.9
  });
  const variableCostPlus10 = calculateSaasReport({
    ...req.body,
    variableCostPerUser: variableCostPerUser * 1.1
  });
  res.body = {
    original,
    priceMinus10,
    variableCostPlus10
  };
  return res.body;
}
function calculateSaasReport({ fixedCosts, pricePerUser, variableCostPerUser, churnRate, profitGoal = 0 }) {
  const profitPerUser = pricePerUser - variableCostPerUser;
  let breakEvenUsers;
  let usersForProfitGoal;
  let customerLifetimeMonths = null;
  let cltv = null;
  if (churnRate && churnRate > 0) {
    customerLifetimeMonths = 1 / (churnRate / 100);
    cltv = profitPerUser * customerLifetimeMonths;
    breakEvenUsers = Math.ceil(fixedCosts / cltv);
    usersForProfitGoal = Math.ceil((fixedCosts + profitGoal) / cltv);
  } else {
    breakEvenUsers = Math.ceil(fixedCosts / profitPerUser);
    usersForProfitGoal = Math.ceil((fixedCosts + profitGoal) / profitPerUser);
  }
  return {
    breakEvenUsers,
    usersForProfitGoal,
    profitPerUser,
    churnRate: churnRate ?? null,
    customerLifetimeMonths,
    customerLifetimeValue: cltv,
    totalRevenueAtBreakEven: breakEvenUsers * pricePerUser,
    totalRevenueWithProfitGoal: usersForProfitGoal * pricePerUser
  };
}

// logic/services/status.js
function getStatus(req, res) {
  console.log("getStatus called");
  console.log("Query params:", req.query);
  const name = req.query.name || "anonymous";
  res.body = {
    status: "ok2",
    hello: `Hi ${name}`
  };
}

// logic/router.js
var routes = {
  "POST /report/freelancer": freelancerReport,
  "POST /report/freelancer/hourly-rate": freelancerHourly,
  "POST /report/digital-creator": digitalCreatorReport,
  "POST /report/saas": saasReport,
  "POST /report/saas-simulation": simulateSaas,
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
