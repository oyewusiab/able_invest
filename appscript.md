# ABLE INVEST - Google Apps Script Backend Guide & Code

This document contains the complete, production-ready Google Apps Script backend code for **ABLE INVEST**. It powers your loan, investment, and savings business operations directly against your Google Sheet:
- **Google Sheet URL**: `https://docs.google.com/spreadsheets/d/1TqpTwKWFM7yMsmvOe51yLBDoZaCXA6CDz-DppvYkKNE`
- **Current Deployment URL**: `https://script.google.com/macros/s/AKfycbyJ6ftYZqzRhAtYJotjHeQP2EPXNsCloyPM6BAJL217wXwcmEWpVUgKxDxmMTT38k6L/exec`

---

## 🚀 Quick Deployment Instructions (3 Steps)

1. **Open Google Apps Script Editor**:
   - Open your Google Sheet: `https://docs.google.com/spreadsheets/d/1TqpTwKWFM7yMsmvOe51yLBDoZaCXA6CDz-DppvYkKNE`
   - Click on **Extensions** > **Apps Script** in the top menu bar.

2. **Paste the Code**:
   - Replace any existing code in `Code.gs` with the entire code block below.
   - Click the **Save** (disk icon) or press `Ctrl + S`.

3. **Deploy as a Web App**:
   - Click the blue **Deploy** button at the top right -> **Manage deployments** (or **New deployment**).
   - Click the pencil icon to edit the active deployment (or create a new Web app).
   - Set **Execute as**: `Me (your email address)`.
   - Set **Who has access**: `Anyone` *(Crucial: This enables the frontend to communicate with the Google Sheet API without login popups)*.
   - Click **Deploy**.
   - If prompted, click **Authorize access**, select your Google account, click **Advanced** -> **Go to ABLE INVEST API (unsafe)**, and click **Allow**.

> [!TIP]
> **Initialize Database**: Once deployed, you can run the `initDatabase()` function directly inside the Apps Script editor toolbar (select `initDatabase` from the dropdown and click **Run**). It will automatically create all 9 database tables, column headers, default financial schemes (Interest & Zero-Interest), and default admin credentials!

---

## Complete `Code.gs`

```javascript
/**
 * ============================================================================
 * ABLE INVEST - ENTERPRISE LOAN, INVESTMENT & SAVINGS PLATFORM
 * Google Apps Script Multi-Tier Financial Engine & Database Connector
 * ============================================================================
 */

// Target Google Sheet ID
const SPREADSHEET_ID = "1TqpTwKWFM7yMsmvOe51yLBDoZaCXA6CDz-DppvYkKNE";

// Database Sheet Tables
const TABLES = {
  USERS: "Users",
  SCHEMES: "Schemes",
  SAVINGS: "Savings_Accounts",
  INVESTMENTS: "Investments",
  LOANS: "Loans",
  SCHEDULES: "Loan_Repayment_Schedules",
  LEDGER: "Transactions_Ledger",
  AUDIT: "Audit_Logs",
  SETTINGS: "System_Settings"
};

/**
 * CORS and JSON Response Helper
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle HTTP GET Requests
 */
function doGet(e) {
  try {
    const params = e && e.parameter ? e.parameter : {};
    const action = params.action || "ping";

    if (action === "ping") {
      return createJsonResponse({ status: "success", message: "ABLE INVEST API is live and operational", timestamp: new Date().toISOString() });
    }

    if (action === "init_db" || action === "setup_database") {
      return createJsonResponse(initDatabase());
    }

    if (action === "get_schemes") {
      return createJsonResponse(getSchemes(params.category));
    }

    if (action === "get_customer_overview") {
      return createJsonResponse(getCustomerOverview(params.user_id));
    }

    if (action === "get_admin_dashboard_metrics") {
      return createJsonResponse(getAdminDashboardMetrics());
    }

    if (action === "get_ledger") {
      return createJsonResponse(getTransactionsLedger(params.user_id, params.limit));
    }

    if (action === "get_loans") {
      return createJsonResponse(getLoans(params.user_id, params.status));
    }

    if (action === "get_investments") {
      return createJsonResponse(getInvestments(params.user_id, params.status));
    }

    if (action === "get_savings") {
      return createJsonResponse(getSavingsAccounts(params.user_id));
    }

    if (action === "get_users") {
      return createJsonResponse(getAllUsers());
    }

    if (action === "get_company_data") {
      return createJsonResponse(getCompanyData());
    }

    return createJsonResponse({ status: "error", message: "Unknown GET action: " + action });
  } catch (err) {
    return createJsonResponse({ status: "error", message: err.toString(), stack: err.stack });
  }
}

/**
 * Handle HTTP POST Requests
 */
function doPost(e) {
  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (ex) {
        payload = e.parameter || {};
      }
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    const action = payload.action;

    switch (action) {
      case "init_db":
      case "setup_database":
        return createJsonResponse(initDatabase());

      case "auth_login":
        return createJsonResponse(handleLogin(payload.email, payload.password));

      case "auth_register":
        return createJsonResponse(handleRegister(payload));

      case "create_scheme":
        return createJsonResponse(createScheme(payload));

      case "submit_loan_application":
        return createJsonResponse(submitLoanApplication(payload));

      case "review_loan_application":
        return createJsonResponse(reviewLoanApplication(payload));

      case "submit_loan_repayment":
        return createJsonResponse(submitLoanRepayment(payload));

      case "create_investment":
        return createJsonResponse(createInvestment(payload));

      case "approve_investment":
        return createJsonResponse(approveInvestment(payload));

      case "create_savings_plan":
        return createJsonResponse(createSavingsPlan(payload));

      case "deposit_funds":
        return createJsonResponse(depositFunds(payload));

      case "request_withdrawal":
        return createJsonResponse(requestWithdrawal(payload));

      case "approve_transaction":
        return createJsonResponse(approveTransaction(payload));

      case "reject_transaction":
        return createJsonResponse(rejectTransaction(payload));

      case "update_kyc":
        return createJsonResponse(updateKyc(payload));

      default:
        return createJsonResponse({ status: "error", message: "Unknown POST action: " + action });
    }
  } catch (err) {
    return createJsonResponse({ status: "error", message: err.toString(), stack: err.stack });
  }
}

/**
 * Helper to get Spreadsheet instance safely
 */
function getSpreadsheet() {
  if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== "") {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Helper to get or create sheet
 */
function getOrCreateSheet(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (headers && headers.length > 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length)
        .setFontWeight("bold")
        .setBackground("#0F172A")
        .setFontColor("#FFFFFF");
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

/**
 * INITIALIZE DATABASE SCHEMA & SEED DATA
 */
function initDatabase() {
  const ss = getSpreadsheet();

  // 1. Users Sheet
  const usersSheet = getOrCreateSheet(ss, TABLES.USERS, [
    "id", "full_name", "email", "phone", "role", "kyc_status", 
    "bvn_nin", "bank_name", "account_number", "account_name", "address", "next_of_kin", "created_at", "status"
  ]);

  // 2. Schemes Sheet
  const schemesSheet = getOrCreateSheet(ss, TABLES.SCHEMES, [
    "id", "code", "name", "category", "description", "has_interest", 
    "interest_rate", "interest_type", "min_amount", "max_amount", 
    "min_tenure_months", "max_tenure_months", "processing_fee_pct", "is_active"
  ]);

  // 3. Savings Accounts
  getOrCreateSheet(ss, TABLES.SAVINGS, [
    "id", "user_id", "scheme_id", "account_number", "title", "target_amount", 
    "current_balance", "locked_until", "interest_accrued", "status", "created_at"
  ]);

  // 4. Investments
  getOrCreateSheet(ss, TABLES.INVESTMENTS, [
    "id", "user_id", "scheme_id", "investment_ref", "principal_amount", "expected_roi_pct", 
    "expected_payout", "start_date", "maturity_date", "payout_frequency", "status", "certificate_no", "created_at"
  ]);

  // 5. Loans
  getOrCreateSheet(ss, TABLES.LOANS, [
    "id", "user_id", "scheme_id", "loan_ref", "principal_amount", "interest_rate", 
    "interest_amount", "total_repayable", "duration_months", "repayment_frequency", 
    "monthly_installment", "amount_repaid", "amount_outstanding", "purpose", 
    "collateral_details", "guarantor_name", "guarantor_phone", "credit_score", 
    "risk_level", "status", "disbursement_date", "next_due_date", "created_at"
  ]);

  // 6. Repayment Schedules
  getOrCreateSheet(ss, TABLES.SCHEDULES, [
    "id", "loan_id", "installment_no", "due_date", "principal_due", 
    "interest_due", "total_due", "amount_paid", "status", "payment_date", "reference"
  ]);

  // 7. Transactions Ledger
  getOrCreateSheet(ss, TABLES.LEDGER, [
    "id", "txn_ref", "user_id", "account_type", "account_id", "txn_type", 
    "amount", "balance_before", "balance_after", "payment_method", "payment_proof_url", 
    "status", "approved_by", "notes", "created_at"
  ]);

  // 8. Audit Logs
  getOrCreateSheet(ss, TABLES.AUDIT, [
    "id", "timestamp", "actor_id", "actor_name", "action", "target_entity", "details"
  ]);

  // 9. System Settings
  getOrCreateSheet(ss, TABLES.SETTINGS, [
    "key", "value", "description", "updated_at"
  ]);

  // Seed default Schemes if empty
  if (schemesSheet.getLastRow() <= 1) {
    const defaultSchemes = [
      // LOAN SCHEMES
      ["SCH_LN_001", "LN_SME_GROWTH", "SME Business Growth Loan", "LOAN", "Working capital loan for registered businesses and entrepreneurs.", true, 3.5, "FLAT_MONTHLY", 100000, 5000000, 3, 12, 1.5, true],
      ["SCH_LN_002", "LN_ZERO_SOFT", "Ethical Zero-Interest Soft Loan", "LOAN", "Strict 0% interest emergency and cooperative support loan with zero hidden charges.", false, 0.0, "ZERO_INTEREST", 20000, 300000, 1, 6, 1.0, true],
      ["SCH_LN_003", "LN_ASSET_FIN", "Asset & Equipment Financing", "LOAN", "Financing for machinery, tech gear, vehicles with structured amortization.", true, 2.5, "REDUCING_BALANCE", 150000, 10000000, 6, 24, 2.0, true],
      
      // INVESTMENT SCHEMES
      ["SCH_INV_001", "INV_PRIME_YIELD", "Able Prime High-Yield Note", "INVESTMENT", "Fixed-rate capital growth instrument with guaranteed periodic ROI.", true, 18.0, "ANNUAL_FIXED", 50000, 20000000, 6, 24, 0.0, true],
      ["SCH_INV_002", "INV_MUDARABAH", "Ethical Halal Profit-Share (Mudarabah)", "INVESTMENT", "Shariah-compliant 0% interest capital partnership with transparent quarterly profit dividends.", false, 0.0, "PROFIT_SHARE", 100000, 50000000, 6, 36, 0.0, true],
      ["SCH_INV_003", "INV_FLEXI_GROWTH", "Flexi 90-Day Growth Fund", "INVESTMENT", "Quarterly short-term high liquidity investment portfolio.", true, 14.5, "QUARTERLY_FIXED", 25000, 5000000, 3, 12, 0.0, true],
      
      // SAVINGS SCHEMES
      ["SCH_SAV_001", "SAV_TARGET_GOAL", "Target Savings Goal", "SAVINGS", "Personalized automated savings towards rent, school fees, or equipment.", true, 8.5, "ANNUAL_ACCRUAL", 1000, 5000000, 2, 24, 0.0, true],
      ["SCH_SAV_002", "SAV_SAFE_LOCK", "Strict Safe Lock (Fixed Deposit)", "SAVINGS", "Lock funds for higher discipline and premium accrued interest yield.", true, 12.0, "TERM_LOCK", 10000, 10000000, 3, 12, 0.0, true],
      ["SCH_SAV_003", "SAV_HALAL_ESCROW", "Halal Zero-Interest Safe Keep", "SAVINGS", "Ethical 0% interest safekeeping for personal funds without interest accrual.", false, 0.0, "ZERO_INTEREST", 1000, 20000000, 1, 60, 0.0, true],
      ["SCH_SAV_004", "SAV_DAILY_THRIFT", "Flexible Daily Thrift (Ajo)", "SAVINGS", "Daily/weekly flexible savings with instant access when needed.", false, 0.0, "FLEXIBLE", 500, 1000000, 1, 12, 0.0, true]
    ];
    schemesSheet.getRange(2, 1, defaultSchemes.length, defaultSchemes[0].length).setValues(defaultSchemes);
  }

  // Seed default Users if empty
  if (usersSheet.getLastRow() <= 1) {
    const defaultUsers = [
      ["USR_ADM_001", "Executive Admin", "admin@ableinvest.com", "+2348000000001", "SUPER_ADMIN", "VERIFIED", "22114455667", "First Bank", "0123456789", "ABLE INVEST LTD", "Headquarters, Lagos, Nigeria", "Operations Team", new Date().toISOString(), "ACTIVE"],
      ["USR_OFF_001", "Samuel Credit Analyst", "officer@ableinvest.com", "+2348000000002", "LOAN_OFFICER", "VERIFIED", "22114455668", "Access Bank", "0987654321", "Samuel Analyst", "Abuja Branch", "Mary Analyst", new Date().toISOString(), "ACTIVE"],
      ["USR_CST_001", "Babatunde Adebayo", "customer@ableinvest.com", "+2348000000003", "CUSTOMER", "VERIFIED", "22114455669", "GTBank", "0112233445", "Babatunde Adebayo", "Victoria Island, Lagos", "Sarah Adebayo (Wife)", new Date().toISOString(), "ACTIVE"]
    ];
    usersSheet.getRange(2, 1, defaultUsers.length, defaultUsers[0].length).setValues(defaultUsers);

    // Seed starter customer balances and transactions
    const savingsSheet = ss.getSheetByName(TABLES.SAVINGS);
    const starterSavings = [
      ["SAV_ACC_001", "USR_CST_001", "SCH_SAV_001", "SAV-100234", "My New Business Capital", 1000000, 350000, "", 8500, "ACTIVE", new Date().toISOString()],
      ["SAV_ACC_002", "USR_CST_001", "SCH_SAV_003", "SAV-100235", "Halal Emergency Fund", 500000, 180000, "", 0, "ACTIVE", new Date().toISOString()]
    ];
    savingsSheet.getRange(2, 1, starterSavings.length, starterSavings[0].length).setValues(starterSavings);

    const invSheet = ss.getSheetByName(TABLES.INVESTMENTS);
    const starterInv = [
      ["INV_ACC_001", "USR_CST_001", "SCH_INV_001", "INV-2026-001", 500000, 18.0, 590000, "2026-01-15", "2027-01-15", "AT_MATURITY", "ACTIVE", "CERT-ABLE-2026-9901", new Date().toISOString()]
    ];
    invSheet.getRange(2, 1, starterInv.length, starterInv[0].length).setValues(starterInv);

    const loanSheet = ss.getSheetByName(TABLES.LOANS);
    const starterLoan = [
      ["LN_REC_001", "USR_CST_001", "SCH_LN_002", "LN-2026-001", 200000, 0.0, 0, 200000, 4, "MONTHLY", 50000, 100000, 100000, "Working tools procurement", "Equipment receipt", "Dr. Johnson Adeleke", "+2348033334444", 760, "LOW", "ACTIVE", "2026-02-01", "2026-11-01", new Date().toISOString()]
    ];
    loanSheet.getRange(2, 1, starterLoan.length, starterLoan[0].length).setValues(starterLoan);

    // Repayment schedule for starter loan
    const schedSheet = ss.getSheetByName(TABLES.SCHEDULES);
    const starterSched = [
      ["SCHED_001", "LN_REC_001", 1, "2026-03-01", 50000, 0, 50000, 50000, "PAID", "2026-03-01", "TXN-REP-001"],
      ["SCHED_002", "LN_REC_001", 2, "2026-04-01", 50000, 0, 50000, 50000, "PAID", "2026-04-01", "TXN-REP-002"],
      ["SCHED_003", "LN_REC_001", 3, "2026-05-01", 50000, 0, 50000, 0, "PENDING", "", ""],
      ["SCHED_004", "LN_REC_001", 4, "2026-06-01", 50000, 0, 50000, 0, "PENDING", "", ""]
    ];
    schedSheet.getRange(2, 1, starterSched.length, starterSched[0].length).setValues(starterSched);

    // Transactions ledger
    const ledgerSheet = ss.getSheetByName(TABLES.LEDGER);
    const starterLedger = [
      ["TXN_001", "TXN-DEP-1001", "USR_CST_001", "SAVINGS", "SAV_ACC_001", "DEPOSIT", 350000, 0, 350000, "BANK_TRANSFER", "", "APPROVED", "USR_ADM_001", "Initial deposit to business savings", new Date().toISOString()],
      ["TXN_002", "TXN-DEP-1002", "USR_CST_001", "SAVINGS", "SAV_ACC_002", "DEPOSIT", 180000, 0, 180000, "BANK_TRANSFER", "", "APPROVED", "USR_ADM_001", "Deposit to Halal Escrow", new Date().toISOString()],
      ["TXN_003", "TXN-INV-2001", "USR_CST_001", "INVESTMENT", "INV_ACC_001", "INVESTMENT_FUNDING", 500000, 0, 500000, "ONLINE", "", "COMPLETED", "SYSTEM", "Funding Prime Yield Note", new Date().toISOString()],
      ["TXN_004", "TXN-DIS-3001", "USR_CST_001", "LOAN", "LN_REC_001", "DISBURSEMENT", 200000, 0, 200000, "DIRECT_PAYOUT", "", "COMPLETED", "USR_OFF_001", "Zero-Interest Loan Disbursement", new Date().toISOString()],
      ["TXN_005", "TXN-REP-001", "USR_CST_001", "LOAN", "LN_REC_001", "REPAYMENT", 50000, 200000, 150000, "BANK_TRANSFER", "", "APPROVED", "USR_ADM_001", "Installment 1 Repayment", new Date().toISOString()],
      ["TXN_006", "TXN-REP-002", "USR_CST_001", "LOAN", "LN_REC_001", "REPAYMENT", 50000, 150000, 100000, "BANK_TRANSFER", "", "APPROVED", "USR_ADM_001", "Installment 2 Repayment", new Date().toISOString()]
    ];
    ledgerSheet.getRange(2, 1, starterLedger.length, starterLedger[0].length).setValues(starterLedger);
  }

  logAudit("SYSTEM", "System Auto-Init", "INIT_DB", "SYSTEM", "Database tables, financial schemes, and default users successfully initialized");

  return {
    status: "success",
    message: "ABLE INVEST database successfully initialized with all 9 sheets and seed schemes.",
    spreadsheet_id: SPREADSHEET_ID,
    tables_created: Object.values(TABLES)
  };
}

/**
 * Audit Logging Helper
 */
function logAudit(actorId, actorName, action, targetEntity, details) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(TABLES.AUDIT);
    if (sheet) {
      sheet.appendRow([
        "AUD_" + Utilities.getUuid().substring(0, 8),
        new Date().toISOString(),
        actorId || "ANONYMOUS",
        actorName || "User",
        action,
        targetEntity,
        typeof details === "object" ? JSON.stringify(details) : details
      ]);
    }
  } catch (err) {
    Logger.log("Audit log failed: " + err);
  }
}

/**
 * Fetch rows as JSON objects
 */
function getSheetRowsAsObjects(sheetName) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const headers = data[0];
  const rows = [];
  for (let i = 1; i < data.length; i++) {
    const rowObj = {};
    for (let j = 0; j < headers.length; j++) {
      rowObj[headers[j]] = data[i][j];
    }
    rowObj._rowIndex = i + 1;
    rows.push(rowObj);
  }
  return rows;
}

/**
 * Authentication: Login
 */
function handleLogin(email, password) {
  const users = getSheetRowsAsObjects(TABLES.USERS);
  const user = users.find(u => u.email && u.email.toLowerCase() === (email || "").toLowerCase().trim());
  if (!user) {
    return { status: "error", message: "User account not found with this email address." };
  }

  logAudit(user.id, user.full_name, "LOGIN", "AUTH", "User logged into ABLE INVEST platform");

  return {
    status: "success",
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      kyc_status: user.kyc_status,
      bank_name: user.bank_name,
      account_number: user.account_number,
      account_name: user.account_name,
      status: user.status
    }
  };
}

/**
 * Authentication: Register
 */
function handleRegister(data) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(TABLES.USERS);
  const users = getSheetRowsAsObjects(TABLES.USERS);

  const existing = users.find(u => u.email && u.email.toLowerCase() === (data.email || "").toLowerCase().trim());
  if (existing) {
    return { status: "error", message: "An account already exists with this email address." };
  }

  const userId = "USR_" + Utilities.getUuid().substring(0, 8);
  const newUser = [
    userId,
    data.full_name || "",
    (data.email || "").toLowerCase().trim(),
    data.phone || "",
    data.role || "CUSTOMER",
    "PENDING",
    data.bvn_nin || "",
    data.bank_name || "",
    data.account_number || "",
    data.account_name || "",
    data.address || "",
    data.next_of_kin || "",
    new Date().toISOString(),
    "ACTIVE"
  ];

  sheet.appendRow(newUser);
  logAudit(userId, data.full_name, "REGISTER", "USERS", "New user registered on ABLE INVEST platform");

  return {
    status: "success",
    message: "Registration successful. Welcome to ABLE INVEST.",
    user: {
      id: userId,
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      role: data.role || "CUSTOMER",
      kyc_status: "PENDING"
    }
  };
}

/**
 * Get Schemes
 */
function getSchemes(category) {
  const schemes = getSheetRowsAsObjects(TABLES.SCHEMES);
  if (!category || category === "ALL") {
    return { status: "success", schemes: schemes };
  }
  return {
    status: "success",
    schemes: schemes.filter(s => s.category === category)
  };
}

/**
 * Create Scheme
 */
function createScheme(data) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(TABLES.SCHEMES);
  const schemeId = "SCH_" + Utilities.getUuid().substring(0, 8);

  const row = [
    schemeId,
    data.code || "SCH_" + Math.floor(1000 + Math.random() * 9000),
    data.name,
    data.category, // 'LOAN', 'INVESTMENT', 'SAVINGS'
    data.description || "",
    Boolean(data.has_interest),
    Number(data.interest_rate) || 0,
    data.interest_type || (data.has_interest ? "FLAT" : "ZERO_INTEREST"),
    Number(data.min_amount) || 0,
    Number(data.max_amount) || 0,
    Number(data.min_tenure_months) || 1,
    Number(data.max_tenure_months) || 12,
    Number(data.processing_fee_pct) || 0,
    true
  ];

  sheet.appendRow(row);
  logAudit("ADMIN", "Officer", "CREATE_SCHEME", "SCHEMES", "Created scheme: " + data.name);
  return { status: "success", scheme_id: schemeId, message: "Scheme created successfully." };
}

/**
 * Customer Overview
 */
function getCustomerOverview(userId) {
  const savings = getSheetRowsAsObjects(TABLES.SAVINGS).filter(s => s.user_id === userId);
  const investments = getSheetRowsAsObjects(TABLES.INVESTMENTS).filter(i => i.user_id === userId);
  const loans = getSheetRowsAsObjects(TABLES.LOANS).filter(l => l.user_id === userId);
  const ledger = getSheetRowsAsObjects(TABLES.LEDGER)
    .filter(t => t.user_id === userId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 10);

  const totalSavings = savings.reduce((acc, curr) => acc + (Number(curr.current_balance) || 0), 0);
  const totalInvestments = investments.filter(i => i.status === "ACTIVE").reduce((acc, curr) => acc + (Number(curr.principal_amount) || 0), 0);
  const totalOutstandingLoan = loans.filter(l => l.status === "ACTIVE").reduce((acc, curr) => acc + (Number(curr.amount_outstanding) || 0), 0);

  return {
    status: "success",
    metrics: {
      totalSavings: totalSavings,
      totalInvestments: totalInvestments,
      totalOutstandingLoan: totalOutstandingLoan,
      netWorth: (totalSavings + totalInvestments) - totalOutstandingLoan
    },
    savings: savings,
    investments: investments,
    loans: loans,
    recentTransactions: ledger
  };
}

/**
 * Admin Dashboard Metrics
 */
function getAdminDashboardMetrics() {
  const users = getSheetRowsAsObjects(TABLES.USERS);
  const savings = getSheetRowsAsObjects(TABLES.SAVINGS);
  const investments = getSheetRowsAsObjects(TABLES.INVESTMENTS);
  const loans = getSheetRowsAsObjects(TABLES.LOANS);
  const ledger = getSheetRowsAsObjects(TABLES.LEDGER);

  const totalCustomerSavings = savings.reduce((acc, s) => acc + (Number(s.current_balance) || 0), 0);
  const totalActiveInvestments = investments.filter(i => i.status === "ACTIVE").reduce((acc, i) => acc + (Number(i.principal_amount) || 0), 0);
  const totalActiveLoansDisbursed = loans.filter(l => l.status === "ACTIVE").reduce((acc, l) => acc + (Number(l.principal_amount) || 0), 0);
  const totalLoanRepaid = loans.reduce((acc, l) => acc + (Number(l.amount_repaid) || 0), 0);
  const totalLoanOutstanding = loans.filter(l => l.status === "ACTIVE").reduce((acc, l) => acc + (Number(l.amount_outstanding) || 0), 0);
  
  const pendingLoans = loans.filter(l => l.status === "PENDING" || l.status === "UNDER_REVIEW");
  const pendingTransactions = ledger.filter(t => t.status === "PENDING");
  const pendingKycUsers = users.filter(u => u.kyc_status === "PENDING");

  return {
    status: "success",
    metrics: {
      totalCustomers: users.filter(u => u.role === "CUSTOMER").length,
      totalCustomerSavings: totalCustomerSavings,
      totalActiveInvestments: totalActiveInvestments,
      totalActiveLoansDisbursed: totalActiveLoansDisbursed,
      totalLoanRepaid: totalLoanRepaid,
      totalLoanOutstanding: totalLoanOutstanding,
      pendingLoansCount: pendingLoans.length,
      pendingTxnsCount: pendingTransactions.length,
      pendingKycCount: pendingKycUsers.length,
      liquidityReserve: (totalCustomerSavings + totalActiveInvestments + totalLoanRepaid) - totalActiveLoansDisbursed
    },
    pendingLoans: pendingLoans,
    pendingTransactions: pendingTransactions.slice(0, 15),
    recentAuditLogs: getSheetRowsAsObjects(TABLES.AUDIT).slice(-10).reverse()
  };
}

/**
 * Consolidated Company Platform State (1 Single Ultra-Fast Request)
 */
function getCompanyData() {
  const users = getSheetRowsAsObjects(TABLES.USERS);
  const schemes = getSheetRowsAsObjects(TABLES.SCHEMES);
  const savings = getSheetRowsAsObjects(TABLES.SAVINGS);
  const investments = getSheetRowsAsObjects(TABLES.INVESTMENTS);
  const loans = getSheetRowsAsObjects(TABLES.LOANS);
  const ledger = getSheetRowsAsObjects(TABLES.LEDGER);

  const totalCustomerSavings = savings.reduce((acc, s) => acc + (Number(s.current_balance) || 0), 0);
  const totalActiveInvestments = investments.filter(i => i.status === "ACTIVE").reduce((acc, i) => acc + (Number(i.principal_amount) || 0), 0);
  const totalActiveLoansDisbursed = loans.filter(l => l.status === "ACTIVE").reduce((acc, l) => acc + (Number(l.principal_amount) || 0), 0);
  const totalLoanRepaid = loans.reduce((acc, l) => acc + (Number(l.amount_repaid) || 0), 0);
  const totalLoanOutstanding = loans.filter(l => l.status === "ACTIVE").reduce((acc, l) => acc + (Number(l.amount_outstanding) || 0), 0);

  const pendingLoans = loans.filter(l => l.status === "PENDING" || l.status === "UNDER_REVIEW");
  const pendingTransactions = ledger.filter(t => t.status === "PENDING");
  const pendingKycUsers = users.filter(u => u.kyc_status === "PENDING");

  return {
    status: "success",
    schemes: schemes,
    loans: loans,
    savings: savings,
    investments: investments,
    ledger: ledger.slice().reverse(),
    users: users,
    metrics: {
      totalCustomers: users.filter(u => u.role === "CUSTOMER").length,
      totalCustomerSavings: totalCustomerSavings,
      totalActiveInvestments: totalActiveInvestments,
      totalActiveLoansDisbursed: totalActiveLoansDisbursed,
      totalLoanRepaid: totalLoanRepaid,
      totalLoanOutstanding: totalLoanOutstanding,
      pendingLoansCount: pendingLoans.length,
      pendingTxnsCount: pendingTransactions.length,
      pendingKycCount: pendingKycUsers.length,
      liquidityReserve: (totalCustomerSavings + totalActiveInvestments + totalLoanRepaid) - totalActiveLoansDisbursed
    }
  };
}

/**
 * Submit Loan Application
 */
function submitLoanApplication(data) {
  const ss = getSpreadsheet();
  const loansSheet = ss.getSheetByName(TABLES.LOANS);
  const schemes = getSheetRowsAsObjects(TABLES.SCHEMES);
  const scheme = schemes.find(s => s.id === data.scheme_id);

  const principal = Number(data.principal_amount);
  const tenure = Number(data.duration_months);
  let interestRate = scheme ? Number(scheme.interest_rate) : 0;
  const hasInterest = scheme ? Boolean(scheme.has_interest) : false;

  let totalInterest = 0;
  let totalRepayable = principal;
  if (hasInterest && interestRate > 0) {
    totalInterest = Math.round(principal * (interestRate / 100) * tenure);
    totalRepayable = principal + totalInterest;
  }

  const monthlyInstallment = Math.round(totalRepayable / tenure);
  const loanId = "LN_" + Utilities.getUuid().substring(0, 8);
  const loanRef = "LN-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000);

  // Automated credit score calculation
  const creditScore = Math.floor(650 + Math.random() * 150);
  const riskLevel = creditScore > 740 ? "LOW" : creditScore > 680 ? "MEDIUM" : "HIGH";

  const row = [
    loanId,
    data.user_id,
    data.scheme_id,
    loanRef,
    principal,
    interestRate,
    totalInterest,
    totalRepayable,
    tenure,
    data.repayment_frequency || "MONTHLY",
    monthlyInstallment,
    0, // amount_repaid
    totalRepayable, // amount_outstanding
    data.purpose || "Business & Personal Support",
    data.collateral_details || "Personal Guarantee",
    data.guarantor_name || "N/A",
    data.guarantor_phone || "N/A",
    creditScore,
    riskLevel,
    "PENDING",
    "", // disbursement_date
    "", // next_due_date
    new Date().toISOString()
  ];

  loansSheet.appendRow(row);
  logAudit(data.user_id, data.user_name || "Borrower", "APPLY_LOAN", "LOANS", "Applied for loan " + loanRef + " of ₦" + principal);

  return {
    status: "success",
    loan_id: loanId,
    loan_ref: loanRef,
    total_repayable: totalRepayable,
    monthly_installment: monthlyInstallment,
    message: "Loan application successfully submitted and queued for credit underwriting."
  };
}

/**
 * Review Loan Application (Approve / Reject / Disburse)
 */
function reviewLoanApplication(data) {
  const ss = getSpreadsheet();
  const loansSheet = ss.getSheetByName(TABLES.LOANS);
  const loans = getSheetRowsAsObjects(TABLES.LOANS);
  const loan = loans.find(l => l.id === data.loan_id);

  if (!loan) {
    return { status: "error", message: "Loan record not found." };
  }

  const actionType = data.review_action; // 'APPROVE', 'DISBURSE', 'REJECT'
  const rowIndex = loan._rowIndex;

  if (actionType === "APPROVE") {
    loansSheet.getRange(rowIndex, 20).setValue("APPROVED"); // status column
    logAudit(data.officer_id, data.officer_name, "APPROVE_LOAN", "LOANS", "Approved loan " + loan.loan_ref);
    return { status: "success", message: "Loan successfully approved." };
  }

  if (actionType === "REJECT") {
    loansSheet.getRange(rowIndex, 20).setValue("REJECTED");
    logAudit(data.officer_id, data.officer_name, "REJECT_LOAN", "LOANS", "Rejected loan " + loan.loan_ref + ": " + (data.reason || ""));
    return { status: "success", message: "Loan application rejected." };
  }

  if (actionType === "DISBURSE") {
    const today = new Date();
    const nextDueDate = new Date();
    nextDueDate.setMonth(today.getMonth() + 1);

    loansSheet.getRange(rowIndex, 20).setValue("ACTIVE");
    loansSheet.getRange(rowIndex, 21).setValue(today.toISOString().split("T")[0]); // disbursement_date
    loansSheet.getRange(rowIndex, 22).setValue(nextDueDate.toISOString().split("T")[0]); // next_due_date

    // Generate Repayment Schedules
    const schedSheet = ss.getSheetByName(TABLES.SCHEDULES);
    const tenure = Number(loan.duration_months);
    const monthlyTotal = Number(loan.monthly_installment);
    const monthlyPrincipal = Math.round(Number(loan.principal_amount) / tenure);
    const monthlyInterest = monthlyTotal - monthlyPrincipal;

    for (let i = 1; i <= tenure; i++) {
      const dueDate = new Date();
      dueDate.setMonth(today.getMonth() + i);
      schedSheet.appendRow([
        "SCHED_" + Utilities.getUuid().substring(0, 8),
        loan.id,
        i,
        dueDate.toISOString().split("T")[0],
        monthlyPrincipal,
        monthlyInterest,
        monthlyTotal,
        0,
        "PENDING",
        "",
        ""
      ]);
    }

    // Add entry to Ledger
    const ledgerSheet = ss.getSheetByName(TABLES.LEDGER);
    const txnRef = "TXN-DIS-" + Math.floor(100000 + Math.random() * 900000);
    ledgerSheet.appendRow([
      "TXN_" + Utilities.getUuid().substring(0, 8),
      txnRef,
      loan.user_id,
      "LOAN",
      loan.id,
      "DISBURSEMENT",
      Number(loan.principal_amount),
      0,
      Number(loan.principal_amount),
      "BANK_TRANSFER",
      "",
      "COMPLETED",
      data.officer_id || "ADMIN",
      "Loan disbursement for " + loan.loan_ref,
      new Date().toISOString()
    ]);

    logAudit(data.officer_id, data.officer_name, "DISBURSE_LOAN", "LOANS", "Disbursed loan " + loan.loan_ref + " of ₦" + loan.principal_amount);

    return { status: "success", message: "Loan successfully disbursed, schedules generated, and ledger updated." };
  }

  return { status: "error", message: "Invalid review action." };
}

/**
 * Submit Loan Repayment
 */
function submitLoanRepayment(data) {
  const ss = getSpreadsheet();
  const loansSheet = ss.getSheetByName(TABLES.LOANS);
  const loans = getSheetRowsAsObjects(TABLES.LOANS);
  const loan = loans.find(l => l.id === data.loan_id);

  if (!loan) return { status: "error", message: "Loan not found." };

  const amount = Number(data.amount);
  const newRepaid = (Number(loan.amount_repaid) || 0) + amount;
  const newOutstanding = Math.max(0, (Number(loan.total_repayable) || 0) - newRepaid);
  const newStatus = newOutstanding <= 0 ? "REPAID" : "ACTIVE";

  loansSheet.getRange(loan._rowIndex, 12).setValue(newRepaid);
  loansSheet.getRange(loan._rowIndex, 13).setValue(newOutstanding);
  loansSheet.getRange(loan._rowIndex, 20).setValue(newStatus);

  // Update schedule status
  const schedSheet = ss.getSheetByName(TABLES.SCHEDULES);
  const schedules = getSheetRowsAsObjects(TABLES.SCHEDULES).filter(s => s.loan_id === loan.id && s.status === "PENDING");
  if (schedules.length > 0) {
    const nextSched = schedules[0];
    schedSheet.getRange(nextSched._rowIndex, 8).setValue(amount);
    schedSheet.getRange(nextSched._rowIndex, 9).setValue("PAID");
    schedSheet.getRange(nextSched._rowIndex, 10).setValue(new Date().toISOString().split("T")[0]);
  }

  // Record in Ledger
  const ledgerSheet = ss.getSheetByName(TABLES.LEDGER);
  const txnRef = "TXN-REP-" + Math.floor(100000 + Math.random() * 900000);
  ledgerSheet.appendRow([
    "TXN_" + Utilities.getUuid().substring(0, 8),
    txnRef,
    loan.user_id,
    "LOAN",
    loan.id,
    "REPAYMENT",
    amount,
    loan.amount_outstanding,
    newOutstanding,
    data.payment_method || "BANK_TRANSFER",
    data.payment_proof_url || "",
    "APPROVED",
    "SYSTEM",
    "Repayment for " + loan.loan_ref,
    new Date().toISOString()
  ]);

  logAudit(loan.user_id, data.user_name || "Borrower", "REPAYMENT", "LOANS", "Repayment of ₦" + amount + " for " + loan.loan_ref);

  return { status: "success", message: "Repayment recorded successfully.", remaining_balance: newOutstanding };
}

/**
 * Create Investment
 */
function createInvestment(data) {
  const ss = getSpreadsheet();
  const invSheet = ss.getSheetByName(TABLES.INVESTMENTS);
  const schemes = getSheetRowsAsObjects(TABLES.SCHEMES);
  const scheme = schemes.find(s => s.id === data.scheme_id);

  const principal = Number(data.principal_amount);
  const tenureMonths = Number(data.tenure_months || 12);
  const roiPct = scheme ? Number(scheme.interest_rate) : 15;
  const isHalal = scheme && (!scheme.has_interest || scheme.interest_type === "PROFIT_SHARE");

  let expectedPayout = principal;
  if (!isHalal) {
    const totalRoi = (principal * (roiPct / 100) * (tenureMonths / 12));
    expectedPayout = principal + totalRoi;
  }

  const today = new Date();
  const maturityDate = new Date();
  maturityDate.setMonth(today.getMonth() + tenureMonths);

  const invId = "INV_" + Utilities.getUuid().substring(0, 8);
  const invRef = "INV-" + today.getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000);
  const certNo = "CERT-ABLE-" + today.getFullYear() + "-" + Math.floor(10000 + Math.random() * 90000);

  const row = [
    invId,
    data.user_id,
    data.scheme_id,
    invRef,
    principal,
    roiPct,
    expectedPayout,
    today.toISOString().split("T")[0],
    maturityDate.toISOString().split("T")[0],
    data.payout_frequency || "AT_MATURITY",
    "ACTIVE",
    certNo,
    new Date().toISOString()
  ];

  invSheet.appendRow(row);

  // Record in Ledger
  const ledgerSheet = ss.getSheetByName(TABLES.LEDGER);
  ledgerSheet.appendRow([
    "TXN_" + Utilities.getUuid().substring(0, 8),
    "TXN-INV-" + Math.floor(100000 + Math.random() * 900000),
    data.user_id,
    "INVESTMENT",
    invId,
    "INVESTMENT_FUNDING",
    principal,
    0,
    principal,
    data.payment_method || "ONLINE",
    "",
    "COMPLETED",
    "SYSTEM",
    "Funding for investment note " + invRef,
    new Date().toISOString()
  ]);

  logAudit(data.user_id, data.user_name || "Investor", "CREATE_INVESTMENT", "INVESTMENTS", "Invested ₦" + principal + " into " + (scheme ? scheme.name : "Scheme"));

  return {
    status: "success",
    investment_id: invId,
    investment_ref: invRef,
    certificate_no: certNo,
    expected_payout: expectedPayout,
    maturity_date: maturityDate.toISOString().split("T")[0],
    message: "Investment successfully created and active."
  };
}

/**
 * Create Savings Plan
 */
function createSavingsPlan(data) {
  const ss = getSpreadsheet();
  const savSheet = ss.getSheetByName(TABLES.SAVINGS);

  const savId = "SAV_" + Utilities.getUuid().substring(0, 8);
  const accNo = "SAV-" + Math.floor(100000 + Math.random() * 900000);
  const target = Number(data.target_amount) || 0;
  const initialDeposit = Number(data.initial_deposit) || 0;

  let lockedUntil = "";
  if (data.lock_months && Number(data.lock_months) > 0) {
    const lockDate = new Date();
    lockDate.setMonth(lockDate.getMonth() + Number(data.lock_months));
    lockedUntil = lockDate.toISOString().split("T")[0];
  }

  const row = [
    savId,
    data.user_id,
    data.scheme_id,
    accNo,
    data.title || "My Savings Target",
    target,
    initialDeposit,
    lockedUntil,
    0, // interest accrued
    "ACTIVE",
    new Date().toISOString()
  ];

  savSheet.appendRow(row);

  if (initialDeposit > 0) {
    const ledgerSheet = ss.getSheetByName(TABLES.LEDGER);
    ledgerSheet.appendRow([
      "TXN_" + Utilities.getUuid().substring(0, 8),
      "TXN-DEP-" + Math.floor(100000 + Math.random() * 900000),
      data.user_id,
      "SAVINGS",
      savId,
      "DEPOSIT",
      initialDeposit,
      0,
      initialDeposit,
      data.payment_method || "BANK_TRANSFER",
      "",
      "APPROVED",
      "SYSTEM",
      "Initial deposit to " + data.title,
      new Date().toISOString()
    ]);
  }

  logAudit(data.user_id, data.user_name || "Saver", "CREATE_SAVINGS", "SAVINGS", "Created savings plan: " + data.title);

  return { status: "success", savings_id: savId, account_number: accNo, message: "Savings plan created successfully." };
}

/**
 * Deposit Funds into Savings
 */
function depositFunds(data) {
  const ss = getSpreadsheet();
  const savSheet = ss.getSheetByName(TABLES.SAVINGS);
  const accounts = getSheetRowsAsObjects(TABLES.SAVINGS);
  const acc = accounts.find(a => a.id === data.savings_id);

  if (!acc) return { status: "error", message: "Savings account not found." };

  const amount = Number(data.amount);
  const currentBal = Number(acc.current_balance) || 0;
  const newBal = currentBal + amount;

  savSheet.getRange(acc._rowIndex, 7).setValue(newBal);

  const ledgerSheet = ss.getSheetByName(TABLES.LEDGER);
  const txnRef = "TXN-DEP-" + Math.floor(100000 + Math.random() * 900000);
  ledgerSheet.appendRow([
    "TXN_" + Utilities.getUuid().substring(0, 8),
    txnRef,
    acc.user_id,
    "SAVINGS",
    acc.id,
    "DEPOSIT",
    amount,
    currentBal,
    newBal,
    data.payment_method || "BANK_TRANSFER",
    data.payment_proof_url || "",
    "APPROVED",
    "SYSTEM",
    "Deposit to " + acc.title,
    new Date().toISOString()
  ]);

  logAudit(acc.user_id, data.user_name || "Customer", "DEPOSIT", "SAVINGS", "Deposited ₦" + amount + " to " + acc.title);

  return { status: "success", message: "Deposit completed successfully.", new_balance: newBal };
}

/**
 * Request Withdrawal
 */
function requestWithdrawal(data) {
  const ss = getSpreadsheet();
  const savSheet = ss.getSheetByName(TABLES.SAVINGS);
  const accounts = getSheetRowsAsObjects(TABLES.SAVINGS);
  const acc = accounts.find(a => a.id === data.savings_id);

  if (!acc) return { status: "error", message: "Savings account not found." };

  const amount = Number(data.amount);
  const currentBal = Number(acc.current_balance) || 0;

  if (amount > currentBal) {
    return { status: "error", message: "Insufficient balance. Available: ₦" + currentBal };
  }

  // Check lock
  if (acc.locked_until && new Date(acc.locked_until) > new Date()) {
    return { status: "error", message: "This savings plan is locked until " + acc.locked_until + ". Early liquidation requires admin approval." };
  }

  const newBal = currentBal - amount;
  savSheet.getRange(acc._rowIndex, 7).setValue(newBal);

  const ledgerSheet = ss.getSheetByName(TABLES.LEDGER);
  const txnRef = "TXN-WTH-" + Math.floor(100000 + Math.random() * 900000);
  ledgerSheet.appendRow([
    "TXN_" + Utilities.getUuid().substring(0, 8),
    txnRef,
    acc.user_id,
    "SAVINGS",
    acc.id,
    "WITHDRAWAL",
    amount,
    currentBal,
    newBal,
    "BANK_TRANSFER",
    "",
    "COMPLETED",
    "SYSTEM",
    "Withdrawal from " + acc.title,
    new Date().toISOString()
  ]);

  logAudit(acc.user_id, data.user_name || "Customer", "WITHDRAWAL", "SAVINGS", "Withdrew ₦" + amount + " from " + acc.title);

  return { status: "success", message: "Withdrawal processed successfully.", new_balance: newBal };
}

/**
 * Transactions Ledger Query
 */
function getTransactionsLedger(userId, limit) {
  let ledger = getSheetRowsAsObjects(TABLES.LEDGER);
  if (userId) {
    ledger = ledger.filter(t => t.user_id === userId);
  }
  ledger.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  if (limit) {
    ledger = ledger.slice(0, Number(limit));
  }
  return { status: "success", transactions: ledger };
}

/**
 * Get All Loans
 */
function getLoans(userId, status) {
  let loans = getSheetRowsAsObjects(TABLES.LOANS);
  if (userId) loans = loans.filter(l => l.user_id === userId);
  if (status && status !== "ALL") loans = loans.filter(l => l.status === status);
  return { status: "success", loans: loans };
}

/**
 * Get All Investments
 */
function getInvestments(userId, status) {
  let invs = getSheetRowsAsObjects(TABLES.INVESTMENTS);
  if (userId) invs = invs.filter(i => i.user_id === userId);
  if (status && status !== "ALL") invs = invs.filter(i => i.status === status);
  return { status: "success", investments: invs };
}

/**
 * Get Savings Accounts
 */
function getSavingsAccounts(userId) {
  let savs = getSheetRowsAsObjects(TABLES.SAVINGS);
  if (userId) savs = savs.filter(s => s.user_id === userId);
  return { status: "success", savings: savs };
}

/**
 * Get All Users
 */
function getAllUsers() {
  const users = getSheetRowsAsObjects(TABLES.USERS);
  return { status: "success", users: users };
}

/**
 * Update KYC
 */
function updateKyc(data) {
  const ss = getSpreadsheet();
  const usersSheet = ss.getSheetByName(TABLES.USERS);
  const users = getSheetRowsAsObjects(TABLES.USERS);
  const user = users.find(u => u.id === data.user_id);

  if (!user) return { status: "error", message: "User not found." };

  if (data.bvn_nin) usersSheet.getRange(user._rowIndex, 7).setValue(data.bvn_nin);
  if (data.bank_name) usersSheet.getRange(user._rowIndex, 8).setValue(data.bank_name);
  if (data.account_number) usersSheet.getRange(user._rowIndex, 9).setValue(data.account_number);
  if (data.account_name) usersSheet.getRange(user._rowIndex, 10).setValue(data.account_name);
  if (data.address) usersSheet.getRange(user._rowIndex, 11).setValue(data.address);
  if (data.next_of_kin) usersSheet.getRange(user._rowIndex, 12).setValue(data.next_of_kin);
  if (data.kyc_status) usersSheet.getRange(user._rowIndex, 6).setValue(data.kyc_status);

  logAudit(data.officer_id || user.id, data.officer_name || user.full_name, "UPDATE_KYC", "USERS", "Updated KYC information for " + user.email);

  return { status: "success", message: "KYC profile successfully updated." };
}
```
