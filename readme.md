# Mortgage-Abilty.com — Premium Mortgage & Payoff Calculator

Mortgage-Abilty.com is an interactive, premium single-page application (SPA) designed to help homebuyers and homeowners visualize, optimize, and accelerate their mortgage amortization with institutional-grade financial precision.

## Features

- **Dynamic Loan Parameters**: Enter Home Price, Down Payment (dollar amount or percentage), Estimated Closing Costs (amount or rate), Interest Rate, and Loan Term with synchronized sliders and number inputs.
- **Taxes & Insurance (PITI)**: Input Property Tax Rate and Home Insurance Rate as percentage values of the home purchase price, with automatic Private Mortgage Insurance (PMI) calculation when LTV exceeds 80%.
- **PITI Metric Card & Visual Views**: Toggle between text readouts and an interactive Donut Chart breakdown showing Principal & Interest (P&I), Property Tax, Home Insurance, and PMI.
- **Loan Recast Strategy Engine**: Model a mortgage re-amortization at a specific time point following a large lump-sum principal payment, tracking pre-recast and post-recast monthly PITI and net cash flow.
- **Multi-Month Scheduled Lump-Sum Extra Payments**: Manage and schedule multiple non-contiguous lump-sum extra payments at specific future loan months via a dedicated interactive modal.
- **Upfront Cash Tracker**: Instantly tracks the Total Upfront Cash Required (Down Payment + Closing Costs) inside the Loan Info badge.
- **Monthly Budget & Affordability Indicators**: Enter Take-Home Salary and Monthly Expenses to evaluate Net Discretionary Cash Flow and Debt-to-Income (DTI) ratio with visual warning signals and a circular SVG gauge ring.
- **Redesigned Amortization & Payoff Visualizer**:
  - **4 Perspective Data Views**: Switch seamlessly between **Balance** (Remaining Principal), **Interest** (Cumulative Interest), **Monthly** (Stacked Payment Breakdown), and **Annual** (Yearly Amortization Breakdown).
  - **Time Horizon Zoom Presets**: Instantly scale the time horizon between **5Y**, **10Y**, **15Y**, and **Full Term**.
  - **Collision-Free Milestone Flags**: Visual canvas flags for key financial events (🚩 PMI Drop-Off, ⚡ ARM Interest Reset, 🔄 Mortgage Recast, and 🏁 Accelerated Payoff) with automated vertical stacking to prevent visual overlap.
- **Target Term Payoff Calculator**: Instantly compute the target monthly PITI payment and extra monthly payment needed to pay off a target principal in a specific timeframe (e.g., 15 years instead of 30), and apply it back to main parameters with 1 click.
- **Detailed Amortization Table & CSV Export**: Group schedule by Year or Month (with 12-month pagination) and export data directly to a spreadsheet-compatible CSV file.
- **Interactive Help & Financial Glossary**: Built-in plain-English financial glossary with search filtering, category tabs, and deep-link info icons.
- **Dark & Light Mode Glassmorphism Theme**: Fully styled with custom CSS properties, high-contrast dark space glassmorphism theme, light mode toggle, and responsive layouts.

## Tech Stack

- **Core**: HTML5, Vanilla JavaScript (ES6 modules)
- **Styling**: Vanilla CSS3 (incorporating glassmorphism, responsive flex/grid layouts, CSS variables, custom range inputs, and smooth transitions)
- **Visualization**: Chart.js (via CDN) with custom canvas-level milestone flag plugin
- **Icons**: FontAwesome 6 (via CDN)
- **Dev Server & Test Runner**: Vite & Vitest (using JSDOM simulation)

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

### 3. Standard Monthly PITI & PMI
$$\text{Standard Monthly PITI} = M + \text{Monthly Property Tax} + \text{Monthly Home Insurance} + \text{Monthly PMI (if LTV > 80\%)}$$

### 4. Loan Recast Re-Amortization
Following a lump-sum payment $L$ at month $m_{\text{recast}}$, the new remaining principal is $P_{\text{new}} = P_{\text{rem}} - L$.
The post-recast monthly P&I payment is recalculated over the remaining term $n_{\text{rem}} = n - m_{\text{recast}}$:
$$M_{\text{recast}} = P_{\text{new}} \times \frac{i(1 + i)^{n_{\text{rem}}}}{(1 + i)^{n_{\text{rem}}} - 1}$$

### 5. Extra Monthly Payment for Target Payoff Term
$$M_{\text{target P and I}} = P_{\text{rem}} \times \frac{i(1 + i)^{n_{\text{target}}}}{(1 + i)^{n_{\text{target}}} - 1}$$
$$\text{Extra Monthly Required} = \max(0, M_{\text{target P and I}} - M)$$
$$\text{Target Total Monthly PITI} = M_{\text{target P and I}} + \text{Monthly Property Tax} + \text{Monthly Home Insurance}$$

### 6. Closing Costs & Upfront Cash
$$\text{Closing Costs} = \text{Home Price} \times \frac{\text{Closing Costs Rate}}{100}$$
$$\text{Total Upfront Cash} = \text{Down Payment} + \text{Closing Costs}$$

### 7. Monthly Budget & Cash Flow (Using PITI)
$$\text{Net Monthly Cash Flow} = \text{Take-Home Salary} - \text{Monthly Expenses} - \text{Accelerated Monthly PITI}$$
$$\text{DTI Ratio} = \frac{\text{Accelerated Monthly PITI} + \text{Monthly Expenses}}{\text{Take-Home Salary}} \times 100$$

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- npm (installed automatically with Node.js)

### Installation

1. Navigate to the project directory:
   ```bash
   cd /home/sharath/code/mortgagability
   ```
2. Install the dev dependencies (Vite & Vitest):
   ```bash
   npm install
   ```

### Running Locally

To start the local Vite development server:
```bash
npm run dev
```
The server will start on `http://localhost:3000/` or `http://localhost:3001/`.

### Building for Production

To compile and bundle static assets for deployment:
```bash
npm run build
```
This generates a production-ready `dist/` directory that can be served by any static host.

### Running Tests

To execute the full automated test suite (financial math unit tests, DOM UI integration tests, and chart view state tests):
```bash
npm run test
```
This runs the Vitest test runner using JSDOM simulation.
