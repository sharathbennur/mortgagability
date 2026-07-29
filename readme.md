# Mortgage-Abilty.com — Premium Mortgage & Payoff Calculator

Mortgage-Abilty.com is an interactive, premium single-page application (SPA) designed to help homebuyers and homeowners visualize, optimize, and accelerate their mortgage amortization.

## Features

- **Dynamic Loan Parameters**: Enter Home Price, Down Payment (dollar amount or percentage), Estimated Closing Costs (amount or rate), Interest Rate, and Loan Term with synchronized sliders and number inputs.
- **Taxes & Insurance (PITI)**: Input Property Tax Rate and Home Insurance Rate as percentage values of the home purchase price.
- **PITI Metric Card**: Shows the Standard Monthly PITI payment with a clear visual breakdown of P&I (Principal and Interest), Property Tax, and Home Insurance. Also tracks the accelerated monthly payment with extra payments included.
- **Upfront Cash Tracker**: Instantly tracks the Total Upfront Cash Required (Down Payment + Closing Costs) inside the Loan Info badge.
- **Monthly Budget Analysis**: Enter Take-Home Salary and Monthly Expenses to track net discretionary income and evaluate affordability.
- **Affordability Indicators**: Real-time Net Cash Flow card and Debt-to-Income (DTI) ratio tracking, showing visual warning signals (danger/red states) if cash flow turns negative.
- **Amortization Accelerator**: Input extra monthly payments and one-time payments at a specific month to see how they impact your payoff schedule and total interest.
- **Interactive Visualizations**: Real-time line chart comparing standard vs. accelerated principal balances and cumulative interest paid over time simultaneously as 4 curves with a calendar-aligned x-axis starting from the next calendar month.
- **Target Term Calculator**: Instantly determine the exact target total monthly PITI payment and extra monthly payment required to pay off a target principal amount in a specific timeframe (e.g., 15 years instead of 30), and apply it back to the main parameters with a single click.
- **Detailed Amortization Table**: View the schedule grouped by Year (annual summaries) or Month (detailed schedule with pagination).
- **Data Export**: Export the calculated amortization schedule to a CSV file for analysis in Excel or other spreadsheet tools.

## Tech Stack

- **Core**: HTML5, Vanilla JavaScript (ES6 modules)
- **Styling**: Vanilla CSS3 (incorporating glassmorphism, responsive grids, CSS variables, custom range inputs, and smooth transitions)
- **Libraries**: Chart.js (via CDN)
- **Icons**: FontAwesome 6 (via CDN)
- **Dev Server**: Vite (for superfast hot reloading and local hosting)

## Mathematical Formulas

### 1. Monthly Mortgage Payment (P&I Only)
$$M = P \times \frac{i(1 + i)^n}{(1 + i)^n - 1}$$
Where:
- $M$ = Monthly P&I payment
- $P$ = Loan principal (Home Price $-$ Down Payment)
- $i$ = Monthly interest rate (Annual Rate $/ 12 / 100$)
- $n$ = Total number of months (Term Years $\times 12$)

### 2. Property Tax & Home Insurance (Monthly)
$$\text{Monthly Property Tax} = \frac{\text{Home Purchase Price} \times \frac{\text{Property Tax Rate}}{100}}{12}$$
$$\text{Monthly Home Insurance} = \frac{\text{Home Purchase Price} \times \frac{\text{Home Insurance Rate}}{100}}{12}$$

### 3. Standard Monthly PITI
$$\text{Standard Monthly PITI} = M + \text{Monthly Property Tax} + \text{Monthly Home Insurance}$$

### 4. Extra Monthly Payment for Target Payoff Term
$$M_{\text{target P and I}} = P_{\text{rem}} \times \frac{i(1 + i)^{n_{\text{target}}}}{(1 + i)^{n_{\text{target}}} - 1}$$
$$\text{Extra Monthly Required} = \max(0, M_{\text{target P and I}} - M)$$
$$\text{Target Total Monthly PITI} = M_{\text{target P and I}} + \text{Monthly Property Tax} + \text{Monthly Home Insurance}$$
Where:
- $P_{\text{rem}}$ = Remaining principal to pay off
- $n_{\text{target}}$ = Target term in months

### 5. Closing Costs & Upfront Cash
$$\text{Closing Costs} = \text{Home Price} \times \frac{\text{Closing Costs Rate}}{100}$$
$$\text{Total Upfront Cash} = \text{Down Payment} + \text{Closing Costs}$$

### 6. Monthly Budget & Cash Flow (Using PITI)
$$\text{Net Monthly Cash Flow} = \text{Take-Home Salary} - \text{Monthly Expenses} - (\text{Accelerated P and I Payment} + \text{Monthly Property Tax} + \text{Monthly Home Insurance})$$
$$\text{DTI Ratio} = \frac{(\text{Accelerated P and I Payment} + \text{Monthly Property Tax} + \text{Monthly Home Insurance}) + \text{Monthly Expenses}}{\text{Take-Home Salary}} \times 100$$

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- npm (installed automatically with Node.js)

### Installation

1. Navigate to the project directory:
   ```bash
   cd /home/sharath/code/mortgagability
   ```
2. Install the dev dependencies (Vite):
   ```bash
   npm install
   ```

### Running Locally

To start the local Vite development server:
```bash
npm run dev
```
The server will start, typically on `http://localhost:3000/`.

### Building for Production

To compile and bundle static assets for deployment:
```bash
npm run build
```
This generates a production-ready `dist/` directory that can be served by any static host.

### Running Tests

To execute the test suite (comprising financial math unit tests and DOM UI integration tests):
```bash
npm run test
```
This runs the Vitest test runner using JSDOM simulation.
