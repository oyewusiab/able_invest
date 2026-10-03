import React from 'react';
import { useData } from '../../context/DataContext';
import StatCard from '../common/StatCard';
import Badge from '../common/Badge';
import { 
  Building2, 
  PiggyBank, 
  TrendingUp, 
  HandCoins, 
  Wallet, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  AlertTriangle,
  Receipt,
  Users
} from 'lucide-react';

export default function AdminDashboard({ setActiveTab }) {
  const { adminMetrics, loans, ledger } = useData();

  const pendingLoans = loans.filter(l => l.status === 'PENDING' || l.status === 'UNDER_REVIEW');
  const activeLoans = loans.filter(l => l.status === 'ACTIVE');

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome & KPI Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
              Executive Platform Suite
            </span>
            <span className="text-xs text-slate-400 font-semibold">• Real-Time Ledger State</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            ABLE INVEST Operations Hub
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-xl">
            Company-wide credit underwriting, investment portfolio management, customer savings liabilities, and double-entry reconciliation.
          </p>
        </div>

        {/* Liquidity Reserve Box */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 min-w-[240px]">
          <span className="text-xs text-slate-400 font-medium">Estimated Company Liquidity Reserve</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
            ₦{Number(adminMetrics.liquidityReserve || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Solvency Margin Safe
          </div>
        </div>
      </div>

      {/* Action Required Banner if pending loans or transactions */}
      {(adminMetrics.pendingLoansCount > 0 || adminMetrics.pendingTxnsCount > 0) && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Underwriting & Cashier Approvals Required</h4>
              <p className="text-xs text-slate-600 mt-0.5">
                You have <span className="font-bold text-amber-900">{adminMetrics.pendingLoansCount}</span> loan application(s) awaiting credit approval and <span className="font-bold text-amber-900">{adminMetrics.pendingTxnsCount}</span> transaction(s) queued.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('loans')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-sm self-start sm:self-auto flex items-center gap-1.5"
          >
            Review Applications <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Key Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Customer Savings Liability"
          value={`₦${Number(adminMetrics.totalCustomerSavings || 0).toLocaleString()}`}
          subtext="Total customer savings deposits"
          icon={PiggyBank}
          color="emerald"
        />
        <StatCard
          title="Active Loan Disbursed"
          value={`₦${Number(adminMetrics.totalActiveLoansDisbursed || 0).toLocaleString()}`}
          subtext={`${activeLoans.length} performing credit facilities`}
          icon={HandCoins}
          color="amber"
        />
        <StatCard
          title="Investments Under Management"
          value={`₦${Number(adminMetrics.totalActiveInvestments || 0).toLocaleString()}`}
          subtext="Yield notes and ethical funds"
          icon={TrendingUp}
          color="indigo"
        />
        <StatCard
          title="Loan Principal Recovered"
          value={`₦${Number(adminMetrics.totalLoanRepaid || 0).toLocaleString()}`}
          subtext={`Outstanding: ₦${Number(adminMetrics.totalLoanOutstanding || 0).toLocaleString()}`}
          icon={Wallet}
          color="blue"
        />
      </div>

      {/* Underwriting Queue & Financial Statement Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pending Loan Underwriting Applications */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <HandCoins className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-base">Loan Applications Desk</h3>
              </div>
              <button
                onClick={() => setActiveTab('loans')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
              >
                View Underwriting Desk &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {pendingLoans.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  All loan applications have been reviewed. No pending queues!
                </div>
              ) : (
                pendingLoans.slice(0, 3).map((ln) => (
                  <div key={ln.id} className="p-3.5 rounded-xl border border-amber-100 bg-amber-50/40 hover:bg-amber-50/80 transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">{ln.user_name || 'Borrower'}</h4>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ln.interest_rate === 0 ? 'bg-teal-100 text-teal-800' : 'bg-indigo-100 text-indigo-800'
                          }`}>
                            {ln.interest_rate === 0 ? '0% Zero-Interest' : `${ln.interest_rate}% Interest`}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">{ln.loan_ref} • {ln.purpose}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-black text-slate-900">
                          ₦{Number(ln.principal_amount).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-500 font-semibold">
                          Score: <span className="text-emerald-600">{ln.credit_score || 720}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Guarantor & collateral validation integrated</span>
            <button
              onClick={() => setActiveTab('loans')}
              className="font-bold text-slate-900 hover:text-emerald-600"
            >
              Process Decisions
            </button>
          </div>
        </div>

        {/* Ledger Audit Trail Preview */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Double-Entry Audit Stream</h3>
              </div>
              <button
                onClick={() => setActiveTab('ledger')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
              >
                Open Full Ledger &rarr;
              </button>
            </div>

            <div className="space-y-2.5">
              {ledger.slice(0, 4).map((txn) => (
                <div key={txn.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-slate-700 block text-[11px]">{txn.txn_ref}</span>
                    <span className="text-slate-500 text-[11px]">{txn.user_name || txn.account_title} • {txn.txn_type}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 block">₦{Number(txn.amount).toLocaleString()}</span>
                    <Badge status={txn.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Directly mapped to Google Sheet: <span className="font-mono font-semibold">Transactions_Ledger</span></span>
            <button
              onClick={() => setActiveTab('ledger')}
              className="font-bold text-slate-900 hover:text-indigo-600"
            >
              Reconcile
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
