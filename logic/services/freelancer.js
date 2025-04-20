export function freelancerReport(req, res) {
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

export function freelancerHourly(req, res) {
    const {
        fixedCosts,
        profitGoal = 0,
        laborHoursPerProject = 0,
    } = req.body;

    const totalTargetIncome = fixedCosts + profitGoal;
    const hourlyRateNeeded = laborHoursPerProject > 0 ? +(totalTargetIncome / laborHoursPerProject).toFixed(2):0;

    res.body = {
        laborHoursPerProject,
        hourlyRateNeeded,
        totalTargetIncome
    }
}