# Mortgage-Ability.com - AI Agent Guide

Welcome! This document provides essential architectural context and coding guidelines for the "Mortgage-Ability.com" project. If you are modifying, adding features to, or refactoring this project, please follow the conventions detailed below.

## Project Goal
Mortgage-Ability.com is a high-fidelity, high-performance static Single Page Application (SPA) designed to let users calculate base mortgage costs, model re-amortization recasts, and simulate accelerated payoff strategies (such as extra monthly payments or multi-month scheduled lump-sum prepayments).

## Project Structure
The project is built entirely on a vanilla frontend stack without heavy frameworks, compiled dynamically by Vite:
- **`index.html`**: Structured semantic markup containing all forms, input controls, metric widgets, Chart.js container, modal dialogs, and tabular elements.
- **`style.css`**: Design system and stylesheets. We use **Vanilla CSS** with CSS custom properties (`:root` tokens) and dark/light mode glassmorphism themes (`[data-theme="light"]`). **Do not introduce Tailwind CSS, Sass, or other CSS frameworks.**
- **`app.js`**: Core JavaScript file containing application state, financial math engine, Chart.js multi-perspective rendering pipeline, custom canvas plugins, event handlers, pagination, and data export routines.
- **`app.test.js`**: Vitest test suite executing 70+ unit and DOM integration tests.

---

## Architectural & Coding Guidelines

### 1. State Management & Real-Time Sync
- The UI features dual-sync input controls: range sliders and text inputs are bound together. Changing one must instantly update the other, recalculate schedules, and refresh the UI.
- All calculated schedules, recast options, multi-month scheduled payments, and active chart views are stored in the global application state (`currentSchedule`, `activeChartView`, `scheduledOneTimePayments`).
- Dual state persistence: Scenarios are serialized into `localStorage` (`mortgagability_scenarios` and `mortgagability_current_state`).

### 2. Styling & Design Tokens
- Premium Dark Space Themes (Midnight Slate), fallback for high-contrast Light Theme.
- Always use established design tokens in `style.css` (e.g., `--primary`, `--success`, `--danger`, `--warning`, `--panel-bg`, `--font-display`, `--space-1` to `--space-12`).
- Preserve modern premium layout, colors, metrics, typography and interactions (e.g., hover scaling on slider thumbs, button focus-visible outlines, pill container toggles).
- Top Navbar Header contains `.header-branding` on the left and `.top-navbar-right` on the right (holding the `.scenario-toolbar` and `.navbar-utility-actions` for theme toggling and help/glossary).

### 3. Financial Mathematics & Strategy Engine

- **Base Monthly Payment Formula**:
  $$M = P \times \frac{i(1 + i)^n}{(1 + i)^n - 1}$$
- **Closing Costs & Upfront Cash**:
  - Estimated closing costs: $\text{Closing Costs} = \text{Home Price} \times \frac{\text{Rate}}{100}$
  - Total Upfront Cash: $\text{Down Payment} + \text{Closing Costs}$
- **Property Tax, Insurance, and PMI**:
  - Monthly Property Tax & Home Insurance computed as percentage values of purchase price.
  - PMI is automatically calculated and added to PITI when Loan-to-Value (LTV) exceeds 80% ($P > 0.80 \times \text{Home Price}$). PMI drops off automatically once LTV reaches 80%.
- **Loan Recast Engine**:
  - When enabled (`enableRecast`), a lump-sum payment is applied at a specified month ($m_{\text{recast}}$).
  - The remaining principal is reduced by the recast amount, and monthly P&I is re-amortized over the remaining term. Both pre-recast and post-recast payments are calculated and displayed in PITI and Net Cash Flow panels.
- **Multi-Month Scheduled Lump Sum Extra Payments**:
  - Maintained as an array of objects `[{ id, month, amount }, ...]`.
  - Loop logic checks month index $m$ against all scheduled lump sums to apply extra principal reductions.

### 4. Chart.js Multi-Perspective Visualization Engine
- Modularized into four data perspectives (`activeChartView`):
  1. **Balance View**: Accelerated Principal Balance (solid emerald curve with gradient fill) vs. Standard Balance (dashed indigo curve).
  2. **Interest View**: Cumulative Interest Paid over time.
  3. **Monthly View**: Stacked monthly payment breakdown (Principal, Interest, Escrow/PMI).
  4. **Annual View**: Stacked yearly principal vs. interest totals.
- **Zoom Presets**: Supports quick-select zoom levels (`5Y`, `10Y`, `15Y`, `Full Term`).
- **Collision-Free Milestone Flag Plugin (`milestoneFlagsPlugin`)**: Draws visual flag badges on the canvas for major financial milestones (PMI Drop, ARM Reset, Recast, Payoff) using recursive vertical offset calculation to prevent badge overlaps.

### 5. Financial Glossary & Info Icons
- All info icons (`.info-icon`) use `data-term="<term-id>"` attributes.
- Clicking an info icon opens the Help & Financial Glossary modal (`#modal-help`), filters to the relevant category, scrolls to the term card, and highlights it with a pulse animation (`term-pulse`).
- All financial terms must be defined in `GLOSSARY_TERMS` inside `app.js`.

### 6. Table Rendering & Pagination
- The amortization table toggles between **Annual** (grouped yearly summaries) and **Monthly** (detailed monthly schedules).
- Pagination displays 12 months (1 year) per page by default. Always update pagination buttons (`Prev` / `Next`) and state labels.

---

## Verification Protocol
Before wrapping up tasks, verify the application:
1. Execute unit and integration tests: `npm run test` and confirm all tests pass.
2. Verify local dev server: `npm run dev`.
3. Test loan calculations:
   - For a `$450,000` price, `$90,000` down (20%), `3.0%` closing costs -> Closing costs = **`$13,500.00`**, Upfront cash = **`$103,500.00`**.
   - Tax rate `0.9%`, insurance rate `0.5%` -> Monthly tax = **`$337.50`**, Monthly insurance = **`$187.50`**. Standard Monthly PITI = **`$2,800.44`**.
4. Test Recast option:
   - Enable Recast, set Recast Amount `$50,000` at Month `60` -> verify pre-recast payment (`$3,496.17`) and post-recast payment (`$3,111.45`) in PITI and Cash Flow cards.
5. Test Glossary modal:
   - Click "Help & Glossary" or any info icon -> verify modal opens with smooth scrolling and term highlight.
