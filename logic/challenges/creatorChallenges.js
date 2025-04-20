export function digitalCreatorChallenge1(req, res) {
    const {
        fixedCosts = 0,
        productPrice = 0,
        platformFeePercent = 0
    } = req.body;

    const conversionRate = 1;
    const netProfitPerSale = +(productPrice * (1 - platformFeePercent / 100)).toFixed(2);
    const breakEvenSales = netProfitPerSale > 0 ? Math.ceil(fixedCosts / netProfitPerSale) : 0;
    const visitorsNeeded = conversionRate > 0 ? Math.ceil(breakEvenSales / (conversionRate / 100)) : 0;

    const passed = visitorsNeeded <= 5000;

    res.body = {
        challengeId: 1,
        passed,
        message: passed
            ? `Great, you only need ${visitorsNeeded} visitors at 1% conversion to break even.`
            : `You need ${visitorsNeeded} visitors to break even. Try raising your price or lowering costs.`,
        result: {
            visitorsNeeded,
            breakEvenSales,
            netProfitPerSale
        }
    };
}

export function digitalCreatorChallenge2(req, res) {
    const {
        fixedCosts = 0,
        productPrice = 0,
        platformFeePercent = 0,
        conversionRate = 0
    } = req.body;

    const profitGoal = 1000;
    const netProfitPerSale = +(productPrice * (1 - platformFeePercent / 100)).toFixed(2);
    const salesForProfitGoal = netProfitPerSale > 0 ? Math.ceil((fixedCosts + profitGoal) / netProfitPerSale) : 0;
    const visitorsNeeded = conversionRate > 0 ? Math.ceil(salesForProfitGoal / (conversionRate / 100)) : 0;

    const passed = visitorsNeeded <= 10000;

    res.body = {
        challengeId: 2,
        passed,
        message: passed
            ? `Awesome, you can hit ${profitGoal}€ profit with just ${visitorsNeeded} visitors.`
            : `You’d need ${visitorsNeeded} visitors. Try increasing conversion rate or adjusting pricing.`,
        result: {
            salesForProfitGoal,
            visitorsNeeded,
            netProfitPerSale
        }
    };
}

export function digitalCreatorChallenge3(req, res) {
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
        message: passed
            ? `Great job, platform fees at break-even are just ${totalPlatformFees}€.`
            : `Platform takes ${totalPlatformFees}€. Try lowering fees or increasing your product price.`,
        result: {
            breakEvenSales,
            totalPlatformFees,
            platformCutPerSale
        }
    };
}
