export function saasChallenge1(req, res) {
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
        message: passed
            ? `You can break even with ${breakEvenUsers} users.`
            : `You need ${breakEvenUsers} users to break even. Try adjusting your pricing or reducing churn.`,
        result: { breakEvenUsers }
    };
}


export function saasChallenge2(req, res) {
    const {
        fixedCosts,
        profitGoal = 5000,
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
    const passed = usersForProfitGoal <= 500 && totalRevenue >= (fixedCosts + profitGoal);

    res.body = {
        challengeId: 2,
        passed,
        message: passed
            ? `Good job, you can reach your goal of ${profitGoal}€ with ${usersForProfitGoal} users.`
            : `It will take ${usersForProfitGoal} users. Consider adjusting your pricing or reducing churn.`,
        result: {
            usersForProfitGoal,
            totalRevenue
        }
    };
}


export function saasChallenge3(req, res) {
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
        message: passed
            ? `Your CLTV is ${cltv}€, which is greater than 100€. Great work!`
            : `Your CLTV is ${cltv}€. Try increasing your price or reducing churn.`,
        result: { cltv }
    };
}
