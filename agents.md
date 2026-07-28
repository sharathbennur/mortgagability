# Mortgage-Abilty.com - AI Agent Guide

Welcome! This document provides essential architectural context and coding guidelines for the "Mortgage-Abilty.com" project. If you are modifying, adding features to, or refactoring this project, please follow the conventions detailed below.

## Project Goal
Mortgage-Abilty.com is a high-fidelity, high-performance static Single Page Application (SPA) designed to let users calculate base mortgage costs and simulate accelerated payoff strategies (such as adding extra monthly or one-time payments).

## Project Structure
The project is built entirely on a vanilla frontend stack without heavy frameworks, compiled dynamically by Vite:
- **`index.html`**: Structured semantic markup containing all forms, input controls, metric widgets, Chart.js container, and tabular elements.
- **`style.css`**: Design system and stylesheets. We use **Vanilla CSS** with CSS custom properties. **Do not introduce Tailwind CSS, Sass, or other CSS frameworks.**
- **`app.js`**: Core JavaScript file containing state, math logic, event listeners, Chart.js rendering, pagination, and file exports.

---

## Architectural & Coding Guidelines

### 1. State Management & Real-Time Sync
- The UI features dual-sync input controls: range sliders and text inputs are bound together. Changing one must instantly update the other, recalculate schedules, and refresh the UI.
- All schedules and calculated aggregates are saved in the global `currentSchedule` state object.
- Avoid calling DOM selectors repeatedly in calculations. Select elements once at the top of the file or cache them.

### 2. Styling & Design Tokens
- We use a premium Dark Space Theme with glassmorphism panels.
- If you add components, use the established design tokens in `style.css` (e.g., `--primary`, `--success`, `--panel-bg`, `--font-display`).
- Preserve modern micro-interactions (e.g., hover scaling on slider thumbs, button transitions).
- Avoid inline styles. Define classes in `style.css` and toggle them via JS.
- Toggle container `.chart-toggle-buttons` and `.view-toggle` use pill-shaped styles to display selections cleanly with high visibility contrast.

### 3. Financial Mathematics Engine

- **Base Payment Formula**:
  $$M = P \times \frac{i(1 + i)^n}{(1 + i)^n - 1}$$
- **Closing Costs & Upfront Cash**:
  - Estimated closing costs are dynamically calculated from the purchase price:
    $$\text{Closing Costs} = \text{Home Price} \times \frac{\text{Closing Costs Rate}}{100}$$
  - Total Upfront Cash required is the sum of down payment and closing costs:
    $$\text{Total Upfront Cash} = \text{Down Payment} + \text{Closing Costs}$$
- **Property Tax & Home Insurance**:
  - Computed as annualized percentages of the home purchase price:
    $$\text{Monthly Property Tax} = \frac{\text{Home Purchase Price} \times \frac{\text{Property Tax Rate}}{100}}{12}$$
    $$\text{Monthly Home Insurance} = \frac{\text{Home Purchase Price} \times \frac{\text{Home Insurance Rate}}{100}}{12}$$
  - Combined into standard payment readouts:
    $$\text{Standard Monthly PITI} = M_{\text{P&I}} + \text{Monthly Property Tax} + \text{Monthly Home Insurance}$$
- **Monthly Budget & Cash Flow (Using PITI)**:
  - Net monthly discretionary cash flow is computed as:
    $$\text{Net Cash Flow} = \text{Take-Home Salary} - \text{Expenses} - (\text{Accelerated P&I Payment} + \text{Monthly Property Tax} + \text{Monthly Home Insurance})$$
  - DTI Ratio is defined as:
    $$\text{DTI} = \frac{(\text{Accelerated P&I Payment} + \text{Monthly Property Tax} + \text{Monthly Home Insurance}) + \text{Expenses}}{\text{Take-Home Salary}} \times 100$$
  - Alert States: Toggle the CSS class of the card between `.success` and `.danger` depending on whether `Net Cash Flow` is positive or negative.
- **Extra Payments**:
  - Accelerated amortization loops should run month-by-month.
  - At each month $m$, subtract the standard P&I payment minus interest from the remaining principal, then subtract the extra monthly payment and one-time payment (if $m$ matches the targeted one-time payment month).
  - Capping: Ensure payments do not exceed the remaining principal + monthly interest. Ending balances must never go below zero.
- **Divide by Zero**: Always handle the edge case where the interest rate is 0%. In this case, monthly payment is simply $P / n$.

### 4. Chart.js Controller
- The graph shows standard vs accelerated amortization curves and interest paid curves simultaneously.
- Four curves are rendered together:
  1. **Accelerated Principal Balance** (Solid Emerald)
  2. **Standard Principal Balance** (Dashed Indigo)
  3. **Accelerated Cumulative Interest** (Solid Amber)
  4. **Standard Cumulative Interest** (Dashed Rose)
- Ticks on the x-axis represent calendar dates (`MMM YYYY`), starting from next calendar month from current time.
- Always check if a previous Chart.js instance exists (`chartInstance`) and `.destroy()` it before drawing a new one to prevent canvas overlap glitches.

### 5. Table Rendering & Pagination
- The amortization table is toggleable between **Annual** (aggregated by years) and **Monthly** (detailed views).
- Because monthly views can exceed 360 rows, **pagination must be used**. Show 12 months (1 year) per page by default.
- Always update pagination buttons (`Prev` / `Next`) and disable them when boundaries are reached.

### 6. Privacy, Data Storage, & Terms Update Protocol
- **Local-First & Zero Telemetry Standard**: Mortgagability strictly operates as a privacy-focused, local-first client application. All user financial inputs, budget details, scenario names, and notes reside exclusively in the user's browser `localStorage` (`mortgagability_scenarios` and `mortgagability_current_state`).
- **No Data Shared with Site Creators**: Currently, **zero** user data is collected, logged, or shared with the site's creators or any third parties.
- **Mandatory Terms Update Requirement**: If future work or integrations introduce any form of network transmission, cloud sync, backend API persistence, telemetry/analytics scripts, or third-party data sharing, **AI agents and developers MUST update the Terms & Privacy Disclaimer in `index.html` and `app.js` prior to release** to accurately reflect the exact data collected, stored, or shared.

---

## Verification Protocol
Before wrapping up your tasks, verify the application:
1. Run the automated unit and integration tests: `npm run test` and make sure all tests pass.
2. Run Vite on port 3000: `npm run dev`.
3. Check that the loan amount is dynamically calculated as `Home Price - Down Payment`.
3. Verify closing costs and upfront cash:
   - For a `$450,000` home price with `$90,000` down payment (20%) and `3.0%` closing costs, the estimated closing costs must be exactly **`$13,500.00`** and the total upfront cash must be exactly **`$103,500.00`**.
4. Verify property taxes and home insurance calculations:
   - For a `$450,000` home with a `0.9%` tax rate and `0.5%` home insurance rate, the monthly tax must be **`$337.50`** and monthly insurance must be **`$187.50`**.
   - Standard Monthly PITI card must show **`$2,800.44`** (with breakdown showing P&I: `$2,275.44`, Tax: `$337.50`, Ins: `$187.50`).
5. Verify budget and net cash flow math:
   - For a take-home salary of `$8,000`, expenses of `$3,000`, standard monthly PITI of `$2,800.44`, and extra monthly payment of `$200`, the net cash flow must be exactly **`$1,999.56`** and the DTI ratio must be exactly **`75.0%`**.
   - Raising monthly expenses to `$5,000` must trigger a red danger state, change Net Cash Flow to **`-$1,000.44`**, and DTI to **`100.0%`**.
6. Verify payoff chart curves and tooltips:
   - Make sure all four curves are displayed cleanly with high contrast. Hovering over a point should show a combined tooltip containing all four values for that calendar month.
7. Confirm that clicking **Apply Extra Payment to Parameters** in the Target Term Calculator correctly updates the main Extra Monthly Payment form field and recalculates everything.
