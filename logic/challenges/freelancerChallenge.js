export function freelancerChallenge1(req, res) {
    const {
        fixedCosts = 0,
        projectRate = 0
    } = req.body;

    const breakEvenProjects = projectRate > 0 ? Math.ceil(fixedCosts / projectRate) : 0;
    const passed = breakEvenProjects <= 5;

    res.body = {
        challengeId: 1,
        passed,
        message: passed
            ? `You only need ${breakEvenProjects} projects to break even.`
            : `You need ${breakEvenProjects} projects to break even. Try adjusting your project rate or fixed costs.`,
        result: { breakEvenProjects }
    };
}

export function freelancerChallenge2(req, res) {
    const {
        fixedCosts = 0,
        profitGoal = 1000,
        projectRate = 0,
        laborHoursPerProject = 0
    } = req.body;

    const netProfitPerProject = projectRate;
    const projectsNeeded = netProfitPerProject > 0 ? Math.ceil((fixedCosts + profitGoal) / netProfitPerProject) : 0;
    const totalHours = projectsNeeded * laborHoursPerProject;
    const passed = totalHours <= 50 && profitGoal >= 1000;

    res.body = {
        challengeId: 2,
        passed,
        message: passed
            ? `You’ll reach your ${profitGoal}€ goal in ${totalHours} hours.`
            : `It’ll take ${totalHours} hours. Try a higher rate or fewer hours per project.`,
        result: {
            projectsNeeded,
            totalHours
        }
    };
}

export function freelancerChallenge3(req, res) {
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
        message: passed
            ? `Your hourly rate is ${hourlyRate}€, which is sustainable.`
            : `Hourly rate is ${hourlyRate}€. Consider reducing costs or increasing hours.`,
        result: { hourlyRate }
    };
}
