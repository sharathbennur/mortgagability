# UI & Layout Improvement Roadmap — Mortgage-Ability.com

This document outlines proposed UI, UX, and layout enhancements for **Mortgage-Ability.com** to elevate visual fidelity, feature depth, and user engagement.

---

## 1. KPI Cards & Visual Metrics

- **Circular Debt-to-Income (DTI) Gauge**:
  - Replace static text in the Net Cash Flow card with a color-coded circular SVG gauge ring.
  - **Thresholds**: Green (`< 28%` ideal), Yellow (`28%–36%` manageable), Red (`> 36%` high risk).
- **Interactive Payment Breakdown Donut Chart**:
  - Add a tab/toggle on the **Standard Monthly PITI** card to switch between text metrics and a visual Donut Chart.
  - **Segments**: Principal & Interest (P&I), Property Tax, Home Insurance, and PMI (if applicable).
- **Interactive Savings Breakdown Chips**:
  - Display micro-pill chips on the **Total Interest Saved** card detailing savings from extra monthly payments vs. one-time lump sums.

---

## 2. Charting & Visualization Enhancements

- **Time Horizon Zoom Presets**:
  - Add quick-select buttons above the Amortization Chart (`5Y`, `10Y`, `15Y`, `Full Term`) allowing users to zoom into the early loan years where interest compounding is highest.
- **Payoff Milestone Event Flags**:
  - Annotate Chart.js curves with visual flag icons for major financial milestones:
    - 🚩 **PMI Drop-Off** (when loan-to-value drops below 80%)
    - ⚡ **ARM Interest Reset Date** (for 5/1, 7/1, 10/1 ARMs)
    - 🏁 **Accelerated Payoff Completion Date**
- **Side-by-Side Scenario Overlay**:
  - Add a "Compare Scenarios" mode allowing users to graph two saved scenarios simultaneously (e.g. 30-Year Fixed vs. 5/1 ARM strategy).

---

## 3. Scenario Management & Payoff Strategy Presets

- **1-Click Popular Payoff Strategies**:
  - Introduce a "Quick Strategies" bar with preset action buttons:
    - 🚀 **Bi-Weekly Payment Equivalent** (simulates 1 extra monthly payment/year)
    - 🛡️ **ARM Interest Rate Reset Buffer** (prepares extra payments for potential ARM rate increases)
    - 🪙 **Round-Up Monthly Payment** (rounds monthly PITI up to the nearest $100 or $500)
- **Scenario Duplication & JSON Import/Export**:
  - Add a **Duplicate Scenario** button for creating strategy variations without re-entering parameters.
  - Add an **Export/Import JSON** utility to backup or transfer saved scenarios across browsers/devices.

---

## 4. Layout & Ergonomics

- **Collapsible Accordion Input Panels**:
  - Group left-sidebar input controls into collapsible sections (*Loan Parameters*, *ARM Settings*, *Monthly Budget*, *Payoff Accelerator*, *Target Term Calculator*).
  - Show quick summary badges when collapsed (e.g. `30-Yr Fixed @ 6.5%`).
- **Mobile Floating Summary Bar**:
  - Add a sticky bottom bar on mobile viewports showing `Monthly PITI: $3,111` and `Payoff: 25 Yrs` so key metrics stay visible while scrolling through inputs on small screens.

---

## 5. Customization & PDF Export

- **Theme Accent Palette Selector**:
  - Provide a palette toggle in the navbar to switch between dark glassmorphism themes (*Indigo Aurora*, *Emerald Wealth*, *Cyber Amber*, *Midnight Slate*).
- **Professional PDF / Print Summary**:
  - Add a **Print / Export PDF** button that formats a clean 1-page financial summary report suitable for offline review or sharing with financial advisors.
