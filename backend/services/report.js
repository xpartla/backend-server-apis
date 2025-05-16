export function spendingReport(req, res) {
    const { scope, expenses } = req.body;

    if (!["weekly", "monthly", "quarterly", "yearly"].includes(scope)) {
        return res.status(400).json({ error: "Invalid scope" });
    }

    const frequencyMultipliers = {
        daily: { weekly: 7, monthly: 30, quarterly: 91, yearly: 365 },
        weekly: { weekly: 1, monthly: 4.3, quarterly: 13, yearly: 52 },
        monthly: { weekly: 1 / 4.3, monthly: 1, quarterly: 3, yearly: 12 },
        yearly: { weekly: 1 / 52, monthly: 1 / 12, quarterly: 1 / 4, yearly: 1 }
    };

    const report = [];
    let total = 0;

    for (const {item, quantity, cost, frequency} of expenses){
        const multiplier = frequencyMultipliers[frequency]?.[scope];
        if(!multiplier){
            continue;
        }
        const itemTotal = quantity * cost * multiplier;
        total += itemTotal;
        report.push({
            item,
            cost: parseFloat(itemTotal.toFixed(2))
        });
    }
    report.sort((a,b) => b.cost - a.cost);

    res.body = {
        scope,
        report,
        total: parseFloat(total.toFixed(2))
    };
}
