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

// logic/challenges/freelancerChallenge.js
function freelancerChallenge1(req, res) {
  const {
    fixedCosts = 0,
    projectRate = 0
  } = req.body;
  const breakEvenProjects = projectRate > 0 ? Math.ceil(fixedCosts / projectRate) : 0;
  const passed = breakEvenProjects <= 5;
  res.body = {
    challengeId: 1,
    passed,
    message: passed ? `You only need ${breakEvenProjects} projects to break even.` : `You need ${breakEvenProjects} projects to break even. Try adjusting your project rate or fixed costs.`,
    result: { breakEvenProjects }
  };
}
function freelancerChallenge2(req, res) {
  const {
    fixedCosts = 0,
    profitGoal = 1e3,
    projectRate = 0,
    laborHoursPerProject = 0
  } = req.body;
  const netProfitPerProject = projectRate;
  const projectsNeeded = netProfitPerProject > 0 ? Math.ceil((fixedCosts + profitGoal) / netProfitPerProject) : 0;
  const totalHours = projectsNeeded * laborHoursPerProject;
  const passed = totalHours <= 50 && profitGoal >= 1e3;
  res.body = {
    challengeId: 2,
    passed,
    message: passed ? `You\u2019ll reach your ${profitGoal}\u20AC goal in ${totalHours} hours.` : `It\u2019ll take ${totalHours} hours. Try a higher rate or fewer hours per project.`,
    result: {
      projectsNeeded,
      totalHours
    }
  };
}
function freelancerChallenge3(req, res) {
  const {
    fixedCosts = 0,
    profitGoal = 0,
    laborHoursPerProject = 0
  } = req.body;
  const totalIncome = fixedCosts + profitGoal;
  const hourlyRate = laborHoursPerProject > 0 ? +(totalIncome / laborHoursPerProject).toFixed(2) : 0;
  const passed = hourlyRate <= 30;
  res.body = {
    challengeId: 3,
    passed,
    message: passed ? `Your hourly rate is ${hourlyRate}\u20AC, which is sustainable.` : `Hourly rate is ${hourlyRate}\u20AC. Consider reducing costs or increasing hours.`,
    result: { hourlyRate }
  };
}

// logic/challenges/creatorChallenges.js
function digitalCreatorChallenge1(req, res) {
  const {
    fixedCosts = 0,
    productPrice = 0,
    platformFeePercent = 0
  } = req.body;
  const conversionRate = 1;
  const netProfitPerSale = +(productPrice * (1 - platformFeePercent / 100)).toFixed(2);
  const breakEvenSales = netProfitPerSale > 0 ? Math.ceil(fixedCosts / netProfitPerSale) : 0;
  const visitorsNeeded = conversionRate > 0 ? Math.ceil(breakEvenSales / (conversionRate / 100)) : 0;
  const passed = visitorsNeeded <= 5e3;
  res.body = {
    challengeId: 1,
    passed,
    message: passed ? `Great, you only need ${visitorsNeeded} visitors at 1% conversion to break even.` : `You need ${visitorsNeeded} visitors to break even. Try raising your price or lowering costs.`,
    result: {
      visitorsNeeded,
      breakEvenSales,
      netProfitPerSale
    }
  };
}
function digitalCreatorChallenge2(req, res) {
  const {
    fixedCosts = 0,
    productPrice = 0,
    platformFeePercent = 0,
    conversionRate = 0
  } = req.body;
  const profitGoal = 1e3;
  const netProfitPerSale = +(productPrice * (1 - platformFeePercent / 100)).toFixed(2);
  const salesForProfitGoal = netProfitPerSale > 0 ? Math.ceil((fixedCosts + profitGoal) / netProfitPerSale) : 0;
  const visitorsNeeded = conversionRate > 0 ? Math.ceil(salesForProfitGoal / (conversionRate / 100)) : 0;
  const passed = visitorsNeeded <= 1e4;
  res.body = {
    challengeId: 2,
    passed,
    message: passed ? `Awesome, you can hit ${profitGoal}\u20AC profit with just ${visitorsNeeded} visitors.` : `You\u2019d need ${visitorsNeeded} visitors. Try increasing conversion rate or adjusting pricing.`,
    result: {
      salesForProfitGoal,
      visitorsNeeded,
      netProfitPerSale
    }
  };
}
function digitalCreatorChallenge3(req, res) {
  const {
    fixedCosts = 0,
    productPrice = 0,
    platformFeePercent = 0
  } = req.body;
  const netProfitPerSale = +(productPrice * (1 - platformFeePercent / 100)).toFixed(2);
  const breakEvenSales = netProfitPerSale > 0 ? Math.ceil(fixedCosts / netProfitPerSale) : 0;
  const platformCutPerSale = productPrice * (platformFeePercent / 100);
  const totalPlatformFees = +(breakEvenSales * platformCutPerSale).toFixed(2);
  const passed = totalPlatformFees <= 200;
  res.body = {
    challengeId: 3,
    passed,
    message: passed ? `Great job, platform fees at break-even are just ${totalPlatformFees}\u20AC.` : `Platform takes ${totalPlatformFees}\u20AC. Try lowering fees or increasing your product price.`,
    result: {
      breakEvenSales,
      totalPlatformFees,
      platformCutPerSale
    }
  };
}

// logic/challenges/saasChallenges.js
function saasChallenge1(req, res) {
  const {
    fixedCosts,
    pricePerUser,
    variableCostPerUser,
    churnRate
  } = req.body;
  const profitPerUser = pricePerUser - variableCostPerUser;
  let breakEvenUsers;
  if (churnRate && churnRate > 0) {
    const customerLifetimeMonths = 1 / (churnRate / 100);
    const cltv = profitPerUser * customerLifetimeMonths;
    breakEvenUsers = Math.ceil(fixedCosts / cltv);
  } else {
    breakEvenUsers = Math.ceil(fixedCosts / profitPerUser);
  }
  const passed = breakEvenUsers <= 200;
  res.body = {
    challengeId: 1,
    passed,
    message: passed ? `You can break even with ${breakEvenUsers} users.` : `You need ${breakEvenUsers} users to break even. Try adjusting your pricing or reducing churn.`,
    result: { breakEvenUsers }
  };
}
function saasChallenge2(req, res) {
  const {
    fixedCosts,
    profitGoal = 5e3,
    pricePerUser,
    variableCostPerUser,
    churnRate
  } = req.body;
  const profitPerUser = pricePerUser - variableCostPerUser;
  let usersForProfitGoal;
  if (churnRate && churnRate > 0) {
    const customerLifetimeMonths = 1 / (churnRate / 100);
    const cltv = profitPerUser * customerLifetimeMonths;
    usersForProfitGoal = Math.ceil((fixedCosts + profitGoal) / cltv);
  } else {
    usersForProfitGoal = Math.ceil((fixedCosts + profitGoal) / profitPerUser);
  }
  const totalRevenue = usersForProfitGoal * pricePerUser;
  const passed = usersForProfitGoal <= 500 && totalRevenue >= fixedCosts + profitGoal;
  res.body = {
    challengeId: 2,
    passed,
    message: passed ? `Good job, you can reach your goal of ${profitGoal}\u20AC with ${usersForProfitGoal} users.` : `It will take ${usersForProfitGoal} users. Consider adjusting your pricing or reducing churn.`,
    result: {
      usersForProfitGoal,
      totalRevenue
    }
  };
}
function saasChallenge3(req, res) {
  const {
    pricePerUser,
    variableCostPerUser,
    churnRate
  } = req.body;
  const profitPerUser = pricePerUser - variableCostPerUser;
  let customerLifetimeMonths = null;
  let cltv = null;
  if (churnRate && churnRate > 0) {
    customerLifetimeMonths = 1 / (churnRate / 100);
    cltv = profitPerUser * customerLifetimeMonths;
  }
  const passed = cltv >= 100;
  res.body = {
    challengeId: 3,
    passed,
    message: passed ? `Your CLTV is ${cltv}\u20AC, which is greater than 100\u20AC. Great work!` : `Your CLTV is ${cltv}\u20AC. Try increasing your price or reducing churn.`,
    result: { cltv }
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
    variableCostPerUser,
    priceReductionModifier = 10,
    variableCostModifier = 10
  } = req.body;
  const validPriceReduction = Math.min(Math.max(priceReductionModifier, 1), 99);
  const validVariableCostIncrease = Math.min(Math.max(variableCostModifier, 1), 99);
  const original = calculateSaasReport(req.body);
  const priceReduced = calculateSaasReport({
    ...req.body,
    pricePerUser: pricePerUser * (1 - validPriceReduction / 100)
  });
  const variableCostIncreased = calculateSaasReport({
    ...req.body,
    variableCostPerUser: variableCostPerUser * (1 + validVariableCostIncrease / 100)
  });
  res.body = {
    original,
    priceReduced: {
      modifierApplied: `${validPriceReduction}% reduction`,
      report: priceReduced
    },
    variableCostIncreased: {
      modifierApplied: `${validVariableCostIncrease}% increase`,
      report: variableCostIncreased
    }
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
  "POST /challenge/freelancer-1": freelancerChallenge1,
  "POST /challenge/freelancer-2": freelancerChallenge2,
  "POST /challenge/freelancer-3": freelancerChallenge3,
  "POST /challenge/digital-creator-1": digitalCreatorChallenge1,
  "POST /challenge/digital-creator-2": digitalCreatorChallenge2,
  "POST /challenge/digital-creator-3": digitalCreatorChallenge3,
  "POST /challenge/saas-1": saasChallenge1,
  "POST /challenge/saas-2": saasChallenge2,
  "POST /challenge/saas-3": saasChallenge3,
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
