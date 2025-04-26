export function saasReport(req, res) {
    const result = calculateSaasReport(req.body);
    res.body = result;
    return result;
}

export function simulateSaas(req, res) {
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
