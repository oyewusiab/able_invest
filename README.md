# ABLE INVEST - Loan, Investment & Savings Management Platform

**ABLE INVEST** is a full-featured financial operations platform designed for institutions managing diverse loan, investment, and savings schemes (both standard interest-bearing products and ethical/halal 0% zero-interest products).

---

## 🌟 Architecture Overview

- **Company Platform (Full Web Administration Suite)**:
  - **Executive Operations Dashboard**: Real-time solvency reserve, active loan capital disbursed, savings liabilities, and queued underwriting alerts.
  - **Credit Underwriting & Loan Desk**: Automated credit risk scoring, debt-to-income analysis, guarantor & collateral validation, and 1-click loan approval and disbursement (generating multi-month amortization schedules).
  - **Investment Portfolio Management Desk**: High-yield note and ethical fund oversight, maturity countdowns, and accrued coupon/dividend tracking.
  - **Savings Schemes Administration**: Oversee customer goal pots, strict fixed locks, and flexible thrift accounts.
  - **General Ledger & Double-Entry Accounting Desk**: Immutable audit trail with `balance_before` and `balance_after` verification, cashier reconciliation, and CSV audit export.
  - **Financial Scheme Configurator**: Create and tune loan, investment, and savings schemes with configurable interest rates (flat monthly, reducing balance, annual fixed) or ethical 0% zero-interest rules.
  - **User Registry & Compliance (KYC)**: Identity validation (BVN/NIN), verified settlement bank accounts, and role permissions.

- **Customer Platform (PWA Model for Mobile & Desktop)**:
  - **Net Asset Portfolio**: Track total savings balance, active investment yields, and outstanding loan obligations.
  - **Target & Lock Savings**: Create goal pots (e.g., rent, business capital), lock funds for discipline, and perform instant deposits/withdrawals.
  - **Investment Marketplace**: Subscribe to high-yield notes or ethical profit-sharing schemes, simulate projected returns, and print official certificates of investment.
  - **Loan Portal & Live Amortization Simulator**: Apply for business or emergency soft loans with instant payment schedule generation and installment repayments.
  - **Double-Entry Financial Statements**: Download and print verified vouchers and accounting receipts.
  - **PWA Ready**: Offline caching via Service Worker (`sw.js`) and installable on Android/iOS/Desktop.

---

## 🗄️ Database & Google Apps Script API

- **Connected Google Sheet**: [Google Sheets Database](https://docs.google.com/spreadsheets/d/1TqpTwKWFM7yMsmvOe51yLBDoZaCXA6CDz-DppvYkKNE)
- **Google Apps Script Web App**: [Google Apps Script Endpoint](https://script.google.com/macros/s/AKfycbyJ6ftYZqzRhAtYJotjHeQP2EPXNsCloyPM6BAJL217wXwcmEWpVUgKxDxmMTT38k6L/exec)
- **Deployment Documentation**: Complete setup instructions and backend code are in [`appscript.md`](./appscript.md).

---

## 🚀 Local Development & Build

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build for production (outputs to dist/)
npm run build
```

---

## 🌐 Deploying to Vercel

1. Push this repository to GitHub: `https://github.com/oyewusiab/able_invest`.
2. Connect your GitHub repository in your [Vercel Dashboard](https://vercel.com).
3. The included `vercel.json` already contains SPA routing rewrites and security headers.
4. Framework preset: **Vite**.
5. Build command: `npm run build`.
6. Output directory: `dist`.
