export function digitalCreatorReport(req, res) {
    const {
        fixedCosts,
        productPrice,
        platformFeePercent,
        conversionRate,
        profitGoal = 0
    } = req.body;

    const netProfitPerSale = +(productPrice * (1-platformFeePercent / 100)).toFixed(2);
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