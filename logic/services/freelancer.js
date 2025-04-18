export function freelancerReport(req, res) {
    const { fixedCosts, projectRate, profitGoal = 0 } = req.body;

    const breakEvenProjects = Math.ceil(fixedCosts / projectRate);
    const projectsForProfitGoal = Math.ceil((fixedCosts + profitGoal) / projectRate);
    const netProfitPerProject = projectRate - (fixedCosts / breakEvenProjects);
    const revenueAtBreakEven = breakEvenProjects * projectRate;
    const revenueWithProfitGoal = projectsForProfitGoal * projectRate;

    res.body = {
        breakEvenProjects,
        projectsForProfitGoal,
        netProfitPerProject,
        revenueAtBreakEven,
        revenueWithProfitGoal,
    };
}
