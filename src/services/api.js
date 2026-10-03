/**
 * ABLE INVEST - API & DATA SYNCHRONIZATION ENGINE
 * Directly connects to Google Apps Script Web App backed by Google Sheets.
 * Features automatic offline cache and resilient fallback data store.
 */

export const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyJ6ftYZqzRhAtYJotjHeQP2EPXNsCloyPM6BAJL217wXwcmEWpVUgKxDxmMTT38k6L/exec";
export const SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/1TqpTwKWFM7yMsmvOe51yLBDoZaCXA6CDz-DppvYkKNE";

// Initial Seed Data for Local Storage Fallback
const INITIAL_SCHEMES = [
  {
    id: "SCH_LN_001",
    code: "LN_SME_GROWTH",
    name: "SME Business Growth Loan",
    category: "LOAN",
    description: "Working capital loan for registered businesses, retail shops and entrepreneurs.",
    has_interest: true,
    interest_rate: 3.5,
    interest_type: "FLAT_MONTHLY",
    min_amount: 100000,
    max_amount: 5000000,
    min_tenure_months: 3,
    max_tenure_months: 12,
    processing_fee_pct: 1.5,
    is_active: true
  },
  {
    id: "SCH_LN_002",
    code: "LN_ZERO_SOFT",
    name: "Ethical Zero-Interest Soft Loan",
    category: "LOAN",
    description: "Strict 0% interest emergency and cooperative support loan for personal & community empowerment.",
    has_interest: false,
    interest_rate: 0,
    interest_type: "ZERO_INTEREST",
    min_amount: 20000,
    max_amount: 300000,
    min_tenure_months: 1,
    max_tenure_months: 6,
    processing_fee_pct: 1.0,
    is_active: true
  },
  {
    id: "SCH_LN_003",
    code: "LN_ASSET_FIN",
    name: "Asset & Equipment Financing",
    category: "LOAN",
    description: "Asset acquisition financing for tools, vehicles, machines, and electronics.",
    has_interest: true,
    interest_rate: 2.5,
    interest_type: "REDUCING_BALANCE",
    min_amount: 150000,
    max_amount: 10000000,
    min_tenure_months: 6,
    max_tenure_months: 24,
    processing_fee_pct: 2.0,
    is_active: true
  },
  {
    id: "SCH_INV_001",
    code: "INV_PRIME_YIELD",
    name: "Able Prime High-Yield Note",
    category: "INVESTMENT",
    description: "Fixed-rate capital growth instrument with guaranteed periodic ROI.",
    has_interest: true,
    interest_rate: 18.0,
    interest_type: "ANNUAL_FIXED",
    min_amount: 50000,
    max_amount: 20000000,
    min_tenure_months: 6,
    max_tenure_months: 24,
    processing_fee_pct: 0,
    is_active: true
  },
  {
    id: "SCH_INV_002",
    code: "INV_MUDARABAH",
    name: "Ethical Halal Profit-Share (Mudarabah)",
    category: "INVESTMENT",
    description: "Shariah-compliant 0% interest capital partnership with transparent quarterly profit dividends.",
    has_interest: false,
    interest_rate: 0,
    interest_type: "PROFIT_SHARE",
    min_amount: 100000,
    max_amount: 50000000,
    min_tenure_months: 6,
    max_tenure_months: 36,
    processing_fee_pct: 0,
    is_active: true
  },
  {
    id: "SCH_INV_003",
    code: "INV_FLEXI_GROWTH",
    name: "Flexi 90-Day Growth Fund",
    category: "INVESTMENT",
    description: "Quarterly short-term high liquidity investment portfolio.",
    has_interest: true,
    interest_rate: 14.5,
    interest_type: "QUARTERLY_FIXED",
    min_amount: 25000,
    max_amount: 5000000,
    min_tenure_months: 3,
    max_tenure_months: 12,
    processing_fee_pct: 0,
    is_active: true
  },
  {
    id: "SCH_SAV_001",
    code: "SAV_TARGET_GOAL",
    name: "Target Savings Goal",
    category: "SAVINGS",
    description: "Personalized automated savings towards rent, school fees, or equipment.",
    has_interest: true,
    interest_rate: 8.5,
    interest_type: "ANNUAL_ACCRUAL",
    min_amount: 1000,
    max_amount: 5000000,
    min_tenure_months: 2,
    max_tenure_months: 24,
    processing_fee_pct: 0,
    is_active: true
  },
  {
    id: "SCH_SAV_002",
    code: "SAV_SAFE_LOCK",
    name: "Strict Safe Lock (Fixed Deposit)",
    category: "SAVINGS",
    description: "Lock funds for higher discipline and premium accrued interest yield.",
    has_interest: true,
    interest_rate: 12.0,
    interest_type: "TERM_LOCK",
    min_amount: 10000,
    max_amount: 10000000,
    min_tenure_months: 3,
    max_tenure_months: 12,
    processing_fee_pct: 0,
    is_active: true
  },
  {
    id: "SCH_SAV_003",
    code: "SAV_HALAL_ESCROW",
    name: "Halal Zero-Interest Safe Keep",
    category: "SAVINGS",
    description: "Ethical 0% interest safekeeping for personal funds without interest accrual.",
    has_interest: false,
    interest_rate: 0,
    interest_type: "ZERO_INTEREST",
    min_amount: 1000,
    max_amount: 20000000,
    min_tenure_months: 1,
    max_tenure_months: 60,
    processing_fee_pct: 0,
    is_active: true
  }
];

const INITIAL_USERS = [
  {
    id: "USR_ADM_001",
    full_name: "Executive Admin",
    email: "admin@ableinvest.com",
    phone: "+234 802 334 4555",
    role: "SUPER_ADMIN",
    kyc_status: "VERIFIED",
    bvn_nin: "22114455667",
    bank_name: "First Bank",
    account_number: "0123456789",
    account_name: "ABLE INVEST LTD",
    address: "Headquarters, Victoria Island, Lagos",
    next_of_kin: "Executive Board",
    status: "ACTIVE"
  },
  {
    id: "USR_OFF_001",
    full_name: "Samuel Credit Analyst",
    email: "officer@ableinvest.com",
    phone: "+234 803 445 5666",
    role: "LOAN_OFFICER",
    kyc_status: "VERIFIED",
    bvn_nin: "22114455668",
    bank_name: "Access Bank",
    account_number: "0987654321",
    account_name: "Samuel Analyst",
    address: "Credit Bureau, Ikeja, Lagos",
    next_of_kin: "Mary Analyst",
    status: "ACTIVE"
  },
  {
    id: "USR_CST_001",
    full_name: "Babatunde Adebayo",
    email: "customer@ableinvest.com",
    phone: "+234 805 556 6777",
    role: "CUSTOMER",
    kyc_status: "VERIFIED",
    bvn_nin: "22114455669",
    bank_name: "Guaranty Trust Bank",
    account_number: "0112233445",
    account_name: "Babatunde Adebayo",
    address: "Obantoko, Abeokuta / Lagos",
    next_of_kin: "Sarah Adebayo (Wife)",
    status: "ACTIVE"
  }
];

const INITIAL_SAVINGS = [
  {
    id: "SAV_ACC_001",
    user_id: "USR_CST_001",
    scheme_id: "SCH_SAV_001",
    account_number: "SAV-100234",
    title: "New Retail Shop Expansion",
    target_amount: 1500000,
    current_balance: 650000,
    locked_until: "2026-12-31",
    interest_accrued: 18500,
    status: "ACTIVE",
    created_at: "2026-01-10T09:00:00.000Z"
  },
  {
    id: "SAV_ACC_002",
    user_id: "USR_CST_001",
    scheme_id: "SCH_SAV_003",
    account_number: "SAV-100235",
    title: "Halal Zero-Interest Emergency Reserve",
    target_amount: 500000,
    current_balance: 320000,
    locked_until: "",
    interest_accrued: 0,
    status: "ACTIVE",
    created_at: "2026-02-01T11:20:00.000Z"
  }
];

const INITIAL_INVESTMENTS = [
  {
    id: "INV_ACC_001",
    user_id: "USR_CST_001",
    scheme_id: "SCH_INV_001",
    scheme_name: "Able Prime High-Yield Note",
    investment_ref: "INV-2026-0891",
    principal_amount: 500000,
    expected_roi_pct: 18.0,
    expected_payout: 590000,
    start_date: "2026-01-15",
    maturity_date: "2027-01-15",
    payout_frequency: "AT_MATURITY",
    status: "ACTIVE",
    certificate_no: "CERT-ABLE-2026-9901",
    created_at: "2026-01-15T14:30:00.000Z"
  },
  {
    id: "INV_ACC_002",
    user_id: "USR_CST_001",
    scheme_id: "SCH_INV_002",
    scheme_name: "Ethical Halal Profit-Share (Mudarabah)",
    investment_ref: "INV-2026-1044",
    principal_amount: 250000,
    expected_roi_pct: 0,
    expected_payout: 250000,
    start_date: "2026-02-20",
    maturity_date: "2026-11-20",
    payout_frequency: "QUARTERLY_DIVIDEND",
    status: "ACTIVE",
    certificate_no: "CERT-ABLE-2026-9942",
    created_at: "2026-02-20T10:15:00.000Z"
  }
];

const INITIAL_LOANS = [
  {
    id: "LN_REC_001",
    user_id: "USR_CST_001",
    user_name: "Babatunde Adebayo",
    scheme_id: "SCH_LN_002",
    scheme_name: "Ethical Zero-Interest Soft Loan",
    loan_ref: "LN-2026-0041",
    principal_amount: 200000,
    interest_rate: 0.0,
    interest_amount: 0,
    total_repayable: 200000,
    duration_months: 4,
    repayment_frequency: "MONTHLY",
    monthly_installment: 50000,
    amount_repaid: 100000,
    amount_outstanding: 100000,
    purpose: "Working tools procurement and trade inventory",
    collateral_details: "Signed Personal Indemnity Guarantee",
    guarantor_name: "Dr. Johnson Adeleke",
    guarantor_phone: "+234 803 333 4444",
    credit_score: 750,
    risk_level: "LOW",
    status: "ACTIVE",
    disbursement_date: "2026-02-01",
    next_due_date: "2026-11-01",
    created_at: "2026-01-28T09:30:00.000Z"
  },
  {
    id: "LN_REC_002",
    user_id: "USR_CST_001",
    user_name: "Babatunde Adebayo",
    scheme_id: "SCH_LN_001",
    scheme_name: "SME Business Growth Loan",
    loan_ref: "LN-2026-0109",
    principal_amount: 450000,
    interest_rate: 3.5,
    interest_amount: 94500,
    total_repayable: 544500,
    duration_months: 6,
    repayment_frequency: "MONTHLY",
    monthly_installment: 90750,
    amount_repaid: 0,
    amount_outstanding: 544500,
    purpose: "Warehouse inventory stock-up for seasonal demand",
    collateral_details: "Commercial Vehicle Logbook",
    guarantor_name: "Engr. Felix Balogun",
    guarantor_phone: "+234 802 888 7777",
    credit_score: 710,
    risk_level: "LOW",
    status: "PENDING",
    disbursement_date: "",
    next_due_date: "",
    created_at: "2026-10-02T16:45:00.000Z"
  }
];

const INITIAL_SCHEDULES = [
  { id: "SCHED_001", loan_id: "LN_REC_001", installment_no: 1, due_date: "2026-03-01", principal_due: 50000, interest_due: 0, total_due: 50000, amount_paid: 50000, status: "PAID", payment_date: "2026-03-01", reference: "TXN-REP-001" },
  { id: "SCHED_002", loan_id: "LN_REC_001", installment_no: 2, due_date: "2026-04-01", principal_due: 50000, interest_due: 0, total_due: 50000, amount_paid: 50000, status: "PAID", payment_date: "2026-04-01", reference: "TXN-REP-002" },
  { id: "SCHED_003", loan_id: "LN_REC_001", installment_no: 3, due_date: "2026-11-01", principal_due: 50000, interest_due: 0, total_due: 50000, amount_paid: 0, status: "PENDING", payment_date: "", reference: "" },
  { id: "SCHED_004", loan_id: "LN_REC_001", installment_no: 4, due_date: "2026-12-01", principal_due: 50000, interest_due: 0, total_due: 50000, amount_paid: 0, status: "PENDING", payment_date: "", reference: "" }
];

const INITIAL_LEDGER = [
  {
    id: "TXN_001",
    txn_ref: "TXN-DEP-1001",
    user_id: "USR_CST_001",
    user_name: "Babatunde Adebayo",
    account_type: "SAVINGS",
    account_id: "SAV_ACC_001",
    account_title: "New Retail Shop Expansion",
    txn_type: "DEPOSIT",
    amount: 650000,
    balance_before: 0,
    balance_after: 650000,
    payment_method: "BANK_TRANSFER",
    payment_proof_url: "",
    status: "APPROVED",
    approved_by: "USR_ADM_001",
    notes: "Direct bank transfer credited to savings ledger",
    created_at: "2026-01-10T09:15:00.000Z"
  },
  {
    id: "TXN_002",
    txn_ref: "TXN-DEP-1002",
    user_id: "USR_CST_001",
    user_name: "Babatunde Adebayo",
    account_type: "SAVINGS",
    account_id: "SAV_ACC_002",
    account_title: "Halal Zero-Interest Emergency Reserve",
    txn_type: "DEPOSIT",
    amount: 320000,
    balance_before: 0,
    balance_after: 320000,
    payment_method: "BANK_TRANSFER",
    payment_proof_url: "",
    status: "APPROVED",
    approved_by: "USR_ADM_001",
    notes: "Deposit to Halal zero-interest account",
    created_at: "2026-02-01T11:30:00.000Z"
  },
  {
    id: "TXN_003",
    txn_ref: "TXN-INV-2001",
    user_id: "USR_CST_001",
    user_name: "Babatunde Adebayo",
    account_type: "INVESTMENT",
    account_id: "INV_ACC_001",
    account_title: "Able Prime High-Yield Note",
    txn_type: "INVESTMENT_FUNDING",
    amount: 500000,
    balance_before: 0,
    balance_after: 500000,
    payment_method: "ONLINE",
    payment_proof_url: "",
    status: "COMPLETED",
    approved_by: "SYSTEM",
    notes: "Investment subscription settled",
    created_at: "2026-01-15T14:35:00.000Z"
  },
  {
    id: "TXN_004",
    txn_ref: "TXN-DIS-3001",
    user_id: "USR_CST_001",
    user_name: "Babatunde Adebayo",
    account_type: "LOAN",
    account_id: "LN_REC_001",
    account_title: "Ethical Zero-Interest Soft Loan",
    txn_type: "DISBURSEMENT",
    amount: 200000,
    balance_before: 0,
    balance_after: 200000,
    payment_method: "BANK_TRANSFER",
    payment_proof_url: "",
    status: "COMPLETED",
    approved_by: "USR_OFF_001",
    notes: "Loan disbursed to GTBank Account 0112233445",
    created_at: "2026-02-01T10:00:00.000Z"
  },
  {
    id: "TXN_005",
    txn_ref: "TXN-REP-001",
    user_id: "USR_CST_001",
    user_name: "Babatunde Adebayo",
    account_type: "LOAN",
    account_id: "LN_REC_001",
    account_title: "Ethical Zero-Interest Soft Loan",
    txn_type: "REPAYMENT",
    amount: 50000,
    balance_before: 200000,
    balance_after: 150000,
    payment_method: "BANK_TRANSFER",
    payment_proof_url: "",
    status: "APPROVED",
    approved_by: "USR_ADM_001",
    notes: "Installment #1 repayment received",
    created_at: "2026-03-01T12:00:00.000Z"
  },
  {
    id: "TXN_006",
    txn_ref: "TXN-REP-002",
    user_id: "USR_CST_001",
    user_name: "Babatunde Adebayo",
    account_type: "LOAN",
    account_id: "LN_REC_001",
    account_title: "Ethical Zero-Interest Soft Loan",
    txn_type: "REPAYMENT",
    amount: 50000,
    balance_before: 150000,
    balance_after: 100000,
    payment_method: "BANK_TRANSFER",
    payment_proof_url: "",
    status: "APPROVED",
    approved_by: "USR_ADM_001",
    notes: "Installment #2 repayment received",
    created_at: "2026-04-01T14:30:00.000Z"
  }
];

class LocalDataStore {
  constructor() {
    this.initStorage();
  }

  initStorage() {
    if (!localStorage.getItem('able_schemes')) {
      localStorage.setItem('able_schemes', JSON.stringify(INITIAL_SCHEMES));
    }
    if (!localStorage.getItem('able_users')) {
      localStorage.setItem('able_users', JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem('able_savings')) {
      localStorage.setItem('able_savings', JSON.stringify(INITIAL_SAVINGS));
    }
    if (!localStorage.getItem('able_investments')) {
      localStorage.setItem('able_investments', JSON.stringify(INITIAL_INVESTMENTS));
    }
    if (!localStorage.getItem('able_loans')) {
      localStorage.setItem('able_loans', JSON.stringify(INITIAL_LOANS));
    }
    if (!localStorage.getItem('able_schedules')) {
      localStorage.setItem('able_schedules', JSON.stringify(INITIAL_SCHEDULES));
    }
    if (!localStorage.getItem('able_ledger')) {
      localStorage.setItem('able_ledger', JSON.stringify(INITIAL_LEDGER));
    }
  }

  get(key) {
    return JSON.parse(localStorage.getItem(key) || '[]');
  }

  set(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

const localStore = new LocalDataStore();

/**
 * Universal API Request Handler
 * Tries Google Apps Script first; falls back gracefully to local store on network failures or CORS blocks.
 */
async function callApi(action, payload = {}, method = 'POST') {
  try {
    let url = APPS_SCRIPT_URL;
    const fetchOptions = {
      method: method,
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // Prevents preflight CORS failure with Google Apps Script
      }
    };

    if (method === 'GET') {
      const query = new URLSearchParams({ action, ...payload }).toString();
      url = `${APPS_SCRIPT_URL}?${query}`;
    } else {
      fetchOptions.body = JSON.stringify({ action, ...payload });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    fetchOptions.signal = controller.signal;

    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.status === 'success') {
        return { data, source: 'cloud' };
      }
    }
  } catch (err) {
    console.warn(`[ABLE INVEST Cloud Sync] Falling back to local ledger engine: ${err.message}`);
  }

  // Graceful Local Store Fallback
  return { data: executeLocalFallback(action, payload), source: 'local' };
}

/**
 * Local Fallback Execution Engine
 */
function executeLocalFallback(action, payload) {
  switch (action) {
    case 'ping':
      return { status: 'success', message: 'ABLE INVEST Engine active (Local / Ready)', timestamp: new Date().toISOString() };

    case 'setup_database':
    case 'init_db':
      localStore.initStorage();
      return { status: 'success', message: 'Database initialized successfully.' };

    case 'auth_login': {
      const users = localStore.get('able_users');
      const user = users.find(u => u.email.toLowerCase() === (payload.email || '').toLowerCase().trim());
      if (user) {
        return { status: 'success', user };
      }
      return { status: 'error', message: 'User not found with this email.' };
    }

    case 'auth_register': {
      const users = localStore.get('able_users');
      const newUser = {
        id: `USR_${Date.now()}`,
        full_name: payload.full_name,
        email: payload.email,
        phone: payload.phone || '',
        role: payload.role || 'CUSTOMER',
        kyc_status: 'PENDING',
        bvn_nin: payload.bvn_nin || '',
        bank_name: payload.bank_name || '',
        account_number: payload.account_number || '',
        account_name: payload.account_name || payload.full_name,
        address: payload.address || '',
        next_of_kin: payload.next_of_kin || '',
        status: 'ACTIVE',
        created_at: new Date().toISOString()
      };
      users.push(newUser);
      localStore.set('able_users', users);
      return { status: 'success', user: newUser };
    }

    case 'get_schemes': {
      let schemes = localStore.get('able_schemes');
      if (payload.category && payload.category !== 'ALL') {
        schemes = schemes.filter(s => s.category === payload.category);
      }
      return { status: 'success', schemes };
    }

    case 'create_scheme': {
      const schemes = localStore.get('able_schemes');
      const newScheme = {
        id: `SCH_${Date.now()}`,
        code: payload.code || `SCH_${Math.floor(1000 + Math.random() * 9000)}`,
        name: payload.name,
        category: payload.category,
        description: payload.description || '',
        has_interest: Boolean(payload.has_interest),
        interest_rate: Number(payload.interest_rate) || 0,
        interest_type: payload.interest_type || (payload.has_interest ? 'FLAT' : 'ZERO_INTEREST'),
        min_amount: Number(payload.min_amount) || 0,
        max_amount: Number(payload.max_amount) || 0,
        min_tenure_months: Number(payload.min_tenure_months) || 1,
        max_tenure_months: Number(payload.max_tenure_months) || 12,
        processing_fee_pct: Number(payload.processing_fee_pct) || 0,
        is_active: true
      };
      schemes.push(newScheme);
      localStore.set('able_schemes', schemes);
      return { status: 'success', scheme: newScheme };
    }

    case 'get_customer_overview': {
      const userId = payload.user_id;
      const savings = localStore.get('able_savings').filter(s => s.user_id === userId);
      const investments = localStore.get('able_investments').filter(i => i.user_id === userId);
      const loans = localStore.get('able_loans').filter(l => l.user_id === userId);
      const ledger = localStore.get('able_ledger').filter(t => t.user_id === userId);

      const totalSavings = savings.reduce((acc, curr) => acc + (Number(curr.current_balance) || 0), 0);
      const totalInvestments = investments.filter(i => i.status === 'ACTIVE').reduce((acc, curr) => acc + (Number(curr.principal_amount) || 0), 0);
      const totalOutstandingLoan = loans.filter(l => l.status === 'ACTIVE').reduce((acc, curr) => acc + (Number(curr.amount_outstanding) || 0), 0);

      return {
        status: 'success',
        metrics: {
          totalSavings,
          totalInvestments,
          totalOutstandingLoan,
          netWorth: (totalSavings + totalInvestments) - totalOutstandingLoan
        },
        savings,
        investments,
        loans,
        recentTransactions: ledger.slice(-10).reverse()
      };
    }

    case 'get_admin_dashboard_metrics': {
      const users = localStore.get('able_users');
      const savings = localStore.get('able_savings');
      const investments = localStore.get('able_investments');
      const loans = localStore.get('able_loans');
      const ledger = localStore.get('able_ledger');

      const totalCustomerSavings = savings.reduce((acc, s) => acc + (Number(s.current_balance) || 0), 0);
      const totalActiveInvestments = investments.filter(i => i.status === 'ACTIVE').reduce((acc, i) => acc + (Number(i.principal_amount) || 0), 0);
      const totalActiveLoansDisbursed = loans.filter(l => l.status === 'ACTIVE').reduce((acc, l) => acc + (Number(l.principal_amount) || 0), 0);
      const totalLoanRepaid = loans.reduce((acc, l) => acc + (Number(l.amount_repaid) || 0), 0);
      const totalLoanOutstanding = loans.filter(l => l.status === 'ACTIVE').reduce((acc, l) => acc + (Number(l.amount_outstanding) || 0), 0);

      const pendingLoans = loans.filter(l => l.status === 'PENDING' || l.status === 'UNDER_REVIEW');
      const pendingTransactions = ledger.filter(t => t.status === 'PENDING');
      const pendingKycUsers = users.filter(u => u.kyc_status === 'PENDING');

      return {
        status: 'success',
        metrics: {
          totalCustomers: users.filter(u => u.role === 'CUSTOMER').length,
          totalCustomerSavings,
          totalActiveInvestments,
          totalActiveLoansDisbursed,
          totalLoanRepaid,
          totalLoanOutstanding,
          pendingLoansCount: pendingLoans.length,
          pendingTxnsCount: pendingTransactions.length,
          pendingKycCount: pendingKycUsers.length,
          liquidityReserve: (totalCustomerSavings + totalActiveInvestments + totalLoanRepaid) - totalActiveLoansDisbursed
        },
        pendingLoans,
        pendingTransactions: pendingTransactions.slice(0, 15)
      };
    }

    case 'submit_loan_application': {
      const loans = localStore.get('able_loans');
      const schemes = localStore.get('able_schemes');
      const scheme = schemes.find(s => s.id === payload.scheme_id);

      const principal = Number(payload.principal_amount);
      const tenure = Number(payload.duration_months);
      let interestRate = scheme ? Number(scheme.interest_rate) : 0;
      const hasInterest = scheme ? Boolean(scheme.has_interest) : false;

      let totalInterest = 0;
      let totalRepayable = principal;
      if (hasInterest && interestRate > 0) {
        totalInterest = Math.round(principal * (interestRate / 100) * tenure);
        totalRepayable = principal + totalInterest;
      }
      const monthlyInstallment = Math.round(totalRepayable / tenure);
      const creditScore = Math.floor(660 + Math.random() * 140);

      const newLoan = {
        id: `LN_${Date.now()}`,
        user_id: payload.user_id,
        user_name: payload.user_name || 'Customer',
        scheme_id: payload.scheme_id,
        scheme_name: scheme ? scheme.name : 'Loan Scheme',
        loan_ref: `LN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        principal_amount: principal,
        interest_rate: interestRate,
        interest_amount: totalInterest,
        total_repayable: totalRepayable,
        duration_months: tenure,
        repayment_frequency: payload.repayment_frequency || 'MONTHLY',
        monthly_installment: monthlyInstallment,
        amount_repaid: 0,
        amount_outstanding: totalRepayable,
        purpose: payload.purpose || 'Business Finance',
        collateral_details: payload.collateral_details || 'Personal Guarantee',
        guarantor_name: payload.guarantor_name || 'N/A',
        guarantor_phone: payload.guarantor_phone || 'N/A',
        credit_score: creditScore,
        risk_level: creditScore > 740 ? 'LOW' : creditScore > 680 ? 'MEDIUM' : 'HIGH',
        status: 'PENDING',
        disbursement_date: '',
        next_due_date: '',
        created_at: new Date().toISOString()
      };

      loans.push(newLoan);
      localStore.set('able_loans', loans);
      return { status: 'success', loan: newLoan };
    }

    case 'review_loan_application': {
      const loans = localStore.get('able_loans');
      const loan = loans.find(l => l.id === payload.loan_id);
      if (!loan) return { status: 'error', message: 'Loan not found.' };

      if (payload.review_action === 'APPROVE') {
        loan.status = 'APPROVED';
      } else if (payload.review_action === 'REJECT') {
        loan.status = 'REJECTED';
        loan.rejection_reason = payload.reason || 'Criteria not met';
      } else if (payload.review_action === 'DISBURSE') {
        loan.status = 'ACTIVE';
        loan.disbursement_date = new Date().toISOString().split('T')[0];
        const nextDue = new Date();
        nextDue.setMonth(nextDue.getMonth() + 1);
        loan.next_due_date = nextDue.toISOString().split('T')[0];

        // Generate schedules
        const schedules = localStore.get('able_schedules');
        const tenure = Number(loan.duration_months);
        const monthlyTotal = Number(loan.monthly_installment);
        const monthlyPrincipal = Math.round(Number(loan.principal_amount) / tenure);
        const monthlyInterest = monthlyTotal - monthlyPrincipal;

        for (let i = 1; i <= tenure; i++) {
          const d = new Date();
          d.setMonth(d.getMonth() + i);
          schedules.push({
            id: `SCHED_${Date.now()}_${i}`,
            loan_id: loan.id,
            installment_no: i,
            due_date: d.toISOString().split('T')[0],
            principal_due: monthlyPrincipal,
            interest_due: monthlyInterest,
            total_due: monthlyTotal,
            amount_paid: 0,
            status: 'PENDING',
            payment_date: '',
            reference: ''
          });
        }
        localStore.set('able_schedules', schedules);

        // Record in ledger
        const ledger = localStore.get('able_ledger');
        ledger.push({
          id: `TXN_${Date.now()}`,
          txn_ref: `TXN-DIS-${Math.floor(100000 + Math.random() * 900000)}`,
          user_id: loan.user_id,
          user_name: loan.user_name,
          account_type: 'LOAN',
          account_id: loan.id,
          account_title: loan.scheme_name,
          txn_type: 'DISBURSEMENT',
          amount: Number(loan.principal_amount),
          balance_before: 0,
          balance_after: Number(loan.principal_amount),
          payment_method: 'BANK_TRANSFER',
          payment_proof_url: '',
          status: 'COMPLETED',
          approved_by: payload.officer_id || 'ADMIN',
          notes: `Disbursement for loan ${loan.loan_ref}`,
          created_at: new Date().toISOString()
        });
        localStore.set('able_ledger', ledger);
      }

      localStore.set('able_loans', loans);
      return { status: 'success', loan };
    }

    case 'submit_loan_repayment': {
      const loans = localStore.get('able_loans');
      const loan = loans.find(l => l.id === payload.loan_id);
      if (!loan) return { status: 'error', message: 'Loan not found.' };

      const amount = Number(payload.amount);
      const newRepaid = (Number(loan.amount_repaid) || 0) + amount;
      const newOutstanding = Math.max(0, (Number(loan.total_repayable) || 0) - newRepaid);

      loan.amount_repaid = newRepaid;
      loan.amount_outstanding = newOutstanding;
      if (newOutstanding <= 0) {
        loan.status = 'REPAID';
      }

      // Update next schedule
      const schedules = localStore.get('able_schedules');
      const nextPending = schedules.find(s => s.loan_id === loan.id && s.status === 'PENDING');
      if (nextPending) {
        nextPending.status = 'PAID';
        nextPending.amount_paid = amount;
        nextPending.payment_date = new Date().toISOString().split('T')[0];
        nextPending.reference = `TXN-REP-${Math.floor(1000 + Math.random() * 9000)}`;
      }
      localStore.set('able_schedules', schedules);

      // Ledger
      const ledger = localStore.get('able_ledger');
      ledger.push({
        id: `TXN_${Date.now()}`,
        txn_ref: `TXN-REP-${Math.floor(100000 + Math.random() * 900000)}`,
        user_id: loan.user_id,
        user_name: loan.user_name,
        account_type: 'LOAN',
        account_id: loan.id,
        account_title: loan.scheme_name,
        txn_type: 'REPAYMENT',
        amount: amount,
        balance_before: loan.amount_outstanding + amount,
        balance_after: newOutstanding,
        payment_method: payload.payment_method || 'BANK_TRANSFER',
        payment_proof_url: '',
        status: 'APPROVED',
        approved_by: 'SYSTEM',
        notes: `Loan repayment of ₦${amount.toLocaleString()} recorded`,
        created_at: new Date().toISOString()
      });
      localStore.set('able_ledger', ledger);
      localStore.set('able_loans', loans);

      return { status: 'success', remaining_balance: newOutstanding };
    }

    case 'create_investment': {
      const invs = localStore.get('able_investments');
      const schemes = localStore.get('able_schemes');
      const scheme = schemes.find(s => s.id === payload.scheme_id);

      const principal = Number(payload.principal_amount);
      const tenureMonths = Number(payload.tenure_months || 12);
      const roiPct = scheme ? Number(scheme.interest_rate) : 15;
      const isHalal = scheme && (!scheme.has_interest || scheme.interest_type === 'PROFIT_SHARE');

      let expectedPayout = principal;
      if (!isHalal) {
        const totalRoi = (principal * (roiPct / 100) * (tenureMonths / 12));
        expectedPayout = principal + totalRoi;
      }

      const today = new Date();
      const maturity = new Date();
      maturity.setMonth(today.getMonth() + tenureMonths);

      const newInv = {
        id: `INV_${Date.now()}`,
        user_id: payload.user_id,
        scheme_id: payload.scheme_id,
        scheme_name: scheme ? scheme.name : 'Investment Scheme',
        investment_ref: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        principal_amount: principal,
        expected_roi_pct: roiPct,
        expected_payout: Math.round(expectedPayout),
        start_date: today.toISOString().split('T')[0],
        maturity_date: maturity.toISOString().split('T')[0],
        payout_frequency: payload.payout_frequency || 'AT_MATURITY',
        status: 'ACTIVE',
        certificate_no: `CERT-ABLE-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        created_at: today.toISOString()
      };

      invs.push(newInv);
      localStore.set('able_investments', invs);

      // Ledger
      const ledger = localStore.get('able_ledger');
      ledger.push({
        id: `TXN_${Date.now()}`,
        txn_ref: `TXN-INV-${Math.floor(100000 + Math.random() * 900000)}`,
        user_id: payload.user_id,
        user_name: payload.user_name || 'Investor',
        account_type: 'INVESTMENT',
        account_id: newInv.id,
        account_title: newInv.scheme_name,
        txn_type: 'INVESTMENT_FUNDING',
        amount: principal,
        balance_before: 0,
        balance_after: principal,
        payment_method: payload.payment_method || 'ONLINE',
        payment_proof_url: '',
        status: 'COMPLETED',
        approved_by: 'SYSTEM',
        notes: `Subscription to ${newInv.scheme_name}`,
        created_at: today.toISOString()
      });
      localStore.set('able_ledger', ledger);

      return { status: 'success', investment: newInv };
    }

    case 'create_savings_plan': {
      const savings = localStore.get('able_savings');
      const target = Number(payload.target_amount) || 0;
      const initial = Number(payload.initial_deposit) || 0;

      let lockUntil = '';
      if (payload.lock_months && Number(payload.lock_months) > 0) {
        const d = new Date();
        d.setMonth(d.getMonth() + Number(payload.lock_months));
        lockUntil = d.toISOString().split('T')[0];
      }

      const newPlan = {
        id: `SAV_${Date.now()}`,
        user_id: payload.user_id,
        scheme_id: payload.scheme_id,
        account_number: `SAV-${Math.floor(100000 + Math.random() * 900000)}`,
        title: payload.title || 'My Target Savings',
        target_amount: target,
        current_balance: initial,
        locked_until: lockUntil,
        interest_accrued: 0,
        status: 'ACTIVE',
        created_at: new Date().toISOString()
      };

      savings.push(newPlan);
      localStore.set('able_savings', savings);

      if (initial > 0) {
        const ledger = localStore.get('able_ledger');
        ledger.push({
          id: `TXN_${Date.now()}`,
          txn_ref: `TXN-DEP-${Math.floor(100000 + Math.random() * 900000)}`,
          user_id: payload.user_id,
          user_name: payload.user_name || 'Customer',
          account_type: 'SAVINGS',
          account_id: newPlan.id,
          account_title: newPlan.title,
          txn_type: 'DEPOSIT',
          amount: initial,
          balance_before: 0,
          balance_after: initial,
          payment_method: payload.payment_method || 'BANK_TRANSFER',
          payment_proof_url: '',
          status: 'APPROVED',
          approved_by: 'SYSTEM',
          notes: `Initial deposit to ${newPlan.title}`,
          created_at: new Date().toISOString()
        });
        localStore.set('able_ledger', ledger);
      }

      return { status: 'success', savings: newPlan };
    }

    case 'deposit_funds': {
      const savings = localStore.get('able_savings');
      const acc = savings.find(s => s.id === payload.savings_id);
      if (!acc) return { status: 'error', message: 'Savings account not found.' };

      const amount = Number(payload.amount);
      const prevBal = Number(acc.current_balance) || 0;
      acc.current_balance = prevBal + amount;
      localStore.set('able_savings', savings);

      const ledger = localStore.get('able_ledger');
      ledger.push({
        id: `TXN_${Date.now()}`,
        txn_ref: `TXN-DEP-${Math.floor(100000 + Math.random() * 900000)}`,
        user_id: acc.user_id,
        user_name: payload.user_name || 'Customer',
        account_type: 'SAVINGS',
        account_id: acc.id,
        account_title: acc.title,
        txn_type: 'DEPOSIT',
        amount: amount,
        balance_before: prevBal,
        balance_after: acc.current_balance,
        payment_method: payload.payment_method || 'BANK_TRANSFER',
        payment_proof_url: payload.payment_proof_url || '',
        status: 'APPROVED',
        approved_by: 'SYSTEM',
        notes: `Deposit credited to ${acc.title}`,
        created_at: new Date().toISOString()
      });
      localStore.set('able_ledger', ledger);

      return { status: 'success', new_balance: acc.current_balance };
    }

    case 'request_withdrawal': {
      const savings = localStore.get('able_savings');
      const acc = savings.find(s => s.id === payload.savings_id);
      if (!acc) return { status: 'error', message: 'Savings account not found.' };

      const amount = Number(payload.amount);
      const prevBal = Number(acc.current_balance) || 0;
      if (amount > prevBal) return { status: 'error', message: 'Insufficient savings balance.' };

      if (acc.locked_until && new Date(acc.locked_until) > new Date()) {
        return { status: 'error', message: `Account is locked until ${acc.locked_until}. Early liquidation requires admin review.` };
      }

      acc.current_balance = prevBal - amount;
      localStore.set('able_savings', savings);

      const ledger = localStore.get('able_ledger');
      ledger.push({
        id: `TXN_${Date.now()}`,
        txn_ref: `TXN-WTH-${Math.floor(100000 + Math.random() * 900000)}`,
        user_id: acc.user_id,
        user_name: payload.user_name || 'Customer',
        account_type: 'SAVINGS',
        account_id: acc.id,
        account_title: acc.title,
        txn_type: 'WITHDRAWAL',
        amount: amount,
        balance_before: prevBal,
        balance_after: acc.current_balance,
        payment_method: 'BANK_TRANSFER',
        payment_proof_url: '',
        status: 'COMPLETED',
        approved_by: 'SYSTEM',
        notes: `Withdrawal payout from ${acc.title}`,
        created_at: new Date().toISOString()
      });
      localStore.set('able_ledger', ledger);

      return { status: 'success', new_balance: acc.current_balance };
    }

    case 'get_ledger': {
      let ledger = localStore.get('able_ledger');
      if (payload.user_id) {
        ledger = ledger.filter(t => t.user_id === payload.user_id);
      }
      return { status: 'success', transactions: ledger.reverse() };
    }

    case 'get_loans': {
      let loans = localStore.get('able_loans');
      if (payload.user_id) loans = loans.filter(l => l.user_id === payload.user_id);
      if (payload.status && payload.status !== 'ALL') loans = loans.filter(l => l.status === payload.status);
      return { status: 'success', loans: loans.reverse() };
    }

    case 'get_investments': {
      let invs = localStore.get('able_investments');
      if (payload.user_id) invs = invs.filter(i => i.user_id === payload.user_id);
      if (payload.status && payload.status !== 'ALL') invs = invs.filter(i => i.status === payload.status);
      return { status: 'success', investments: invs.reverse() };
    }

    case 'get_savings': {
      let savings = localStore.get('able_savings');
      if (payload.user_id) savings = savings.filter(s => s.user_id === payload.user_id);
      return { status: 'success', savings: savings.reverse() };
    }

    case 'get_schedules': {
      let schedules = localStore.get('able_schedules');
      if (payload.loan_id) schedules = schedules.filter(s => s.loan_id === payload.loan_id);
      return { status: 'success', schedules };
    }

    case 'get_users': {
      const users = localStore.get('able_users');
      return { status: 'success', users };
    }

    case 'update_kyc': {
      const users = localStore.get('able_users');
      const user = users.find(u => u.id === payload.user_id);
      if (user) {
        Object.assign(user, payload);
        localStore.set('able_users', users);
        return { status: 'success', user };
      }
      return { status: 'error', message: 'User not found.' };
    }

    default:
      return { status: 'success', message: 'Action executed' };
  }
}

export const api = {
  ping: () => callApi('ping', {}, 'GET'),
  setupDatabase: () => callApi('setup_database', {}),
  login: (email, password) => callApi('auth_login', { email, password }),
  register: (userData) => callApi('auth_register', userData),
  getSchemes: (category) => callApi('get_schemes', { category }, 'GET'),
  createScheme: (data) => callApi('create_scheme', data),
  getCustomerOverview: (userId) => callApi('get_customer_overview', { user_id: userId }, 'GET'),
  getAdminDashboardMetrics: () => callApi('get_admin_dashboard_metrics', {}, 'GET'),
  getLoans: (userId, status) => callApi('get_loans', { user_id: userId, status }, 'GET'),
  submitLoanApplication: (data) => callApi('submit_loan_application', data),
  reviewLoanApplication: (data) => callApi('review_loan_application', data),
  submitLoanRepayment: (data) => callApi('submit_loan_repayment', data),
  getInvestments: (userId, status) => callApi('get_investments', { user_id: userId, status }, 'GET'),
  createInvestment: (data) => callApi('create_investment', data),
  getSavingsAccounts: (userId) => callApi('get_savings', { user_id: userId }, 'GET'),
  createSavingsPlan: (data) => callApi('create_savings_plan', data),
  depositFunds: (data) => callApi('deposit_funds', data),
  requestWithdrawal: (data) => callApi('request_withdrawal', data),
  getLedger: (userId, limit) => callApi('get_ledger', { user_id: userId, limit }, 'GET'),
  getSchedules: (loanId) => callApi('get_schedules', { loan_id: loanId }, 'GET'),
  getUsers: () => callApi('get_users', {}, 'GET'),
  updateKyc: (data) => callApi('update_kyc', data)
};
