# Break-Even Report API

This is a simple API that creates break-even reports with some added features.

---

## Endpoints

### POST `/report/freelancer`

Calculates how many projects you have to complete to break even and reach a profit goal.

**Input Parameters:**

- `fixedCosts` (number) – Monthly fixed costs *(required)*
- `projectRate` (number) – How much you earn per project *(required)*
- `profitGoal` (number) – Target net profit *(optional)*

**Result interpretation:**

- `breakEvenProjects` – Number of projects required to cover fixed costs
- `projectsForProfitGoal` – Number of projects required to achieve the profit goal
- `netProfitPerProject` – Profit earned from one project
- `revenueAtBreakEven` – Total income when break-even is reached
- `revenueWithProfitGoal` – Total income when profit goal is reached
---

### POST `/report/freelancer/hourly-rate`

Calculates the hourly rate needed to hit profit goals based on available work hours.

**Input Parameters:**

- `fixedCosts` (number) – Monthly fixed costs *(required)*
- `laborHoursPerProject` (number) – Number of hours you can work *(required)*
- `profitGoal` (number) – Desired profit *(optional)*
-
**Result interpretation:**

- `laborHoursPerProject` - Number of hours you expect to work on a project
- `hourlyRateNeeded` - Required hourly rate to cover all costs and profit goals
- `totalTargetIncome` - Sum of fixed costs and profit goal

---

### POST `/report/digital-creator`

Calculates how many sales and visitors are needed to break even and hit profit goals.

**Input Parameters:**

- `fixedCosts` (number) – Monthly fixed costs *(required)*
- `productPrice` (number) – Selling price of the digital product *(required)*
- `platformFeePercent` (number) – Platform cut (%) *(required)*
- `conversionRate` (number) – Percentage of visitors that become customers (%) *(required)*
- `profitGoal` (number) – Desired profit *(optional)*

**Result interpretation:**

- `breakEvenSales` -	Number of sales needed to cover all fixed costs
- `salesForProfitGoal` - Sales required to reach the desired profit
- `netProfitPerSale	` - Profit after platform fees are deducted
- `totalRevenueAtBreakEven` - Total revenue generated at break-even point
- `totalRevenueWithProfitGoal` -	Revenue generated when the profit goal is reached
- `visitorsForBreakEven` -	Estimated number of visitors needed to generate break-even sales
- `visitorsForProfitGoal` -	Visitors needed to generate enough sales to hit the profit goal

---

### POST `/report/saas`

Calculates how many subscribers are needed to cover fixed costs and reach profit.

**Input Parameters:**

- `fixedCosts` (number) – Monthly fixed costs *(required)*
- `monthlySubscriptionPrice` (number) – Subscription price per month *(required)*
- `churnRatePercent` (number) – Customers who cancel per month (%) *(optional)*
- `profitGoal` (number) – Target desired profit *(optional)*


**Result interpretation:**

- `breakEvenUsers` - Number of users needed to cover fixed and variable costs
- `usersForProfitGoal` - 	Number of users needed to meet the desired profit goal
- `profitPerUser	` - Net profit from a single user per month
- `churnRate` - Monthly churn rate (%)
- `customerLifetimeMonths` -	Expected number of months a customer stays
- `customerLifetimeValue` -	Total profit expected from a single user over their lifetime
- `totalRevenueAtBreakEven` -	Total revenue generated at break-even point
- `totalRevenueWithProfitGoal` -	Total revenue generated when the profit goal is reached

---

### POST `/report/saas/simulation`

Returns variations of the SaaS break-even calculation with simulated changes in pricing and costs

**Input Parameters stay the same as in report/saas**
Also expected modifiers
- `priceReductionModifier` - value in %, reducing subscription price in simulation
- `variableCostModifier` - value in %, increasing variable costs in simulation
If not provided, both default to 10% in the simulation

**Response interpretation:**

- `original` - standard calculation
- `priceReduced` - Simulation where the price is reduced by the value of the modifier
- `variableCostIncreased` - Simulation where the variable cost is increased by the value of the modifier

---

# Challenges
Below is a set of challenges (excercises) for each business model. Try to complete them all! \
Each challenge expects a `POST` request with a specific JSON payload. The request then returns whether you **passed** of **failed**.

---

## Freelancer
The following challenges are centered around the freelancer endpoint, providing you with a better understanding of how pricing, costs and labor affect your business goals.

---

### POST `/challenge/freelancer-1`

#### Challenge 1: **Break even in 5 projects**

**Goal:** Choose a `projectRate` and `fixedCosts` so you can break even within **5 projects or fewer**.

#### Inputs (JSON)
```json
{
    "fixedCosts": 1000,
    "projectRate": 150
}
```

---

### POST `/challenge/freelancer-2`

#### Challenge 2: **Earn over 1000€** in profit under 50 hours

**Goal:** Reach at least `1000€` profit (on top of covering your costs) while working less than 50 hours in total.

#### Inputs (JSON)
```json
{
    "fixedCosts": 1000,
    "projectRate": 150,
    "profitGoal": 1000,
    "laborHoursPerProject": 5
}
```

---

### POST `/challenge/freelancer-3`

#### Challenge 3: **Keep your hourly rate below 30€**

**Goal:** Choose your `fixedCosts`, `profitGoal`, `laborHoursPerProject` so that your effective hourly rate stays below 30€.

#### Inputs (JSON)
```json
{
  "fixedCosts": 600,
  "profitGoal": 900,
  "laborHoursPerProject": 50
}
```

---

## Digital Creator

These challenges are centered around you being a digital content creator, helping you understand how pricing, platform fees, and visitor conversion relate to your ability to generate profit online. 

---

### POST `/challenge/digital-creator-1`

#### Challenge 1: **Break even in with a 1% conversion rate**

**Goal:** Set your `productPrice` and `fixedCosts`, so that you can break even with a 1% conversion rate and less than 5000 visitors.

#### Inputs (JSON)
```json
{
    "fixedCosts": 1000,
    "productPrice": 25,
    "platformFeePercent": 10
}
```

---

### POST `/challenge/digital-creator-2`

#### Challenge 2: **Earn 1000€ profit with less than 10 000 visitors**

**Goal:** Reach at least 1000€ in profit while staying under 10 000 total visitors, based on your `conversionRate`, `productPrice` and `platformFeePercent`.

#### Inputs (JSON)
```json
{
    "fixedCosts": 800,
    "productPrice": 40,
    "platformFeePercent": 30,
    "conversionRate": 2.5
}
```

---

### POST `/challenge/digital-creator-3`

#### Challenge 3: **Keep platform fees below 200€ at break-even.**

**Goal:** Adjust your `productPrice`, `fixedCosts`, and `platformFeePercent`, so that the total platform fees paid by the time you break even are under 200€.

#### Inputs (JSON)
```json
{
    "fixedCosts": 900,
    "productPrice": 30,
    "platformFeePercent": 15
}
```

## SaaS 

The next three challenges are centered around the economics of running a Software as a Service (SaaS) business. They will help you understand how user pricing, churn rate or customer lifetime values (CLTV) impact your abilities to achieve profit.

---

### POST `/challenge/saas-1`

#### Challenge 1: **Break even with less than 200 users**

**Goal:** Set your `fixedCosts`, `pricePerUser`, and `variableCostPerUser` to break even with less than 200 users.

#### Inputs (JSON)
```json
{
    "fixedCosts": 1500, 
    "pricePerUser": 50,
    "variableCostPerUser": 10,
    "churnRate": 5
}
```

---

### POST `/challenge/saas-2`

#### Challenge 2: **Earn 5000€ profit while maintaining less than 500 users**

**Goal:** Reach at least 5000€ in profit with less than 500 users. ***Hint:** Keep your churn under control.*

#### Inputs (JSON)
```json
{
  "fixedCosts": 1000,
  "pricePerUser": 50,
  "variableCostPerUser": 10, 
  "churnRate": 5
}
```

---

### POST `/challenge/saas-3`

#### Challenge 3: **Achieve a customer lifetime value (CLTV) above 100€ per user.**

**Goal:** Adjust your `pricePerUser`, `variableCostPerUser`, and `churnRate` to achieve CLTV greater than 100€.

#### Inputs (JSON)
```json
{
  "pricePerUser": 50,
  "variableCostPerUser": 10,
  "churnRate": 5
}
```

---