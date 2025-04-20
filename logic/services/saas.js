export function saasReport(req, res) {
    const result = calculateSaasReport(req.body);
    res.body = result;
    return result;
}

export function simulateSaas(req, res) {
    const {
        pricePerUser,
        variableCostPerUser,
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
