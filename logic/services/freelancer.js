function handleFreelancer({ fixedCosts, projectRate, profitGoal = 0 }) {
    const breakEvenProjects = Math.ceil(fixedCosts / projectRate);
    const projectsForProfitGoal = Math.ceil((fixedCosts + profitGoal) / projectRate);
    const netProfitPerProject = projectRate - (fixedCosts / breakEvenProjects);
    const revenueAtBreakEven = breakEvenProjects * projectRate;
    const revenueWithProfitGoal = projectsForProfitGoal * projectRate;

    return {
        breakEvenProjects,
        projectsForProfitGoal,
        netProfitPerProject,
        revenueAtBreakEven,
        revenueWithProfitGoal
    };
}

globalThis.handleFreelancer = handleFreelancer;