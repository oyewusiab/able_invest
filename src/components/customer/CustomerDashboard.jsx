import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import StatCard from '../common/StatCard';
import Badge from '../common/Badge';
import ReceiptModal from '../common/ReceiptModal';
import { 
  PiggyBank, 
  TrendingUp, 
  HandCoins, 
  Wallet, 
  PlusCircle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldCheck, 
  Clock, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function CustomerDashboard({ setActiveTab, onOpenDeposit, onOpenApplyLoan, onOpenInvest }) {
  const { currentUser } = useAuth();
  const { customerMetrics, savings, investments, loans, ledger } = useData();
  const [selectedTxn, setSelectedTxn] = useState(null);

  const activeLoan = loans.find(l => l.status === 'ACTIVE');
  const activeInvs = investments.filter(i => i.status === 'ACTIVE');

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-900 via-slate-900 to-navy-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Customer Account Portfolio
              </span>
              <Badge status={currentUser?.kyc_status || 'VERIFIED'} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-white">
              Welcome back, {currentUser?.full_name?.split(' ')[0]}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-lg">
              Manage your goal savings, active investment yields, and structured loan repayments with accounting precision.
            </p>
          </div>

          {/* Net Worth Highlight Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 min-w-[220px]">
            <span className="text-xs text-slate-300 font-medium">Total Net Financial Asset</span>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">
              ₦{customerMetrics.netWorth.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-300 mt-1 flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> Balanced Double-Entry Core
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mt-6 pt-6 border-t border-white/10">
          <button
            onClick={onOpenDeposit}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold transition shadow-lg shadow-emerald-500/20"
          >
            <ArrowDownLeft className="w-4 h-4" /> Deposit Savings
          </button>
          <button
            onClick={onOpenInvest}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition border border-white/10"
          >
            <TrendingUp className="w-4 h-4" /> New Investment
          </button>
          <button
            onClick={onOpenApplyLoan}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition border border-white/10"
          >
            <HandCoins className="w-4 h-4" /> Request Loan
          </button>
          <button
            onClick={() => setActiveTab('statement')}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition border border-white/10"
          >
            <Wallet className="w-4 h-4" /> View Ledger
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Savings Balance"
          value={`₦${customerMetrics.totalSavings.toLocaleString()}`}
          subtext={`${savings.length} active savings plan(s)`}
          icon={PiggyBank}
          color="emerald"
        />
        <StatCard
          title="Active Investments"
          value={`₦${customerMetrics.totalInvestments.toLocaleString()}`}
          subtext={`${activeInvs.length} note(s) generating returns`}
          icon={TrendingUp}
          color="indigo"
        />
        <StatCard
          title="Outstanding Loans"
          value={`₦${customerMetrics.totalOutstandingLoan.toLocaleString()}`}
          subtext={activeLoan ? `Next Due: ${activeLoan.next_due_date || 'Upcoming'}` : 'Zero active debt'}
          icon={HandCoins}
          color="amber"
        />
      </div>

      {/* Active Loan Alert / Progress Box */}
      {activeLoan && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <HandCoins className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm">{activeLoan.scheme_name}</h4>
                  <Badge status={activeLoan.status} />
                  {activeLoan.interest_rate === 0 && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">
                      0% Zero-Interest
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Ref: <span className="font-mono font-semibold">{activeLoan.loan_ref}</span> • Total Repayable: ₦{activeLoan.total_repayable?.toLocaleString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('loans')}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-sm self-start sm:self-auto"
            >
              Pay Repayment (₦{activeLoan.monthly_installment?.toLocaleString()})
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-600 mb-1.5 font-medium">
              <span>Repaid: ₦{(activeLoan.amount_repaid || 0).toLocaleString()}</span>
              <span>Outstanding: ₦{(activeLoan.amount_outstanding || 0).toLocaleString()}</span>
            </div>
            <div className="w-full h-2.5 bg-amber-200/70 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-600 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.round(((activeLoan.amount_repaid || 0) / (activeLoan.total_repayable || 1)) * 100))}%`
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Grid: Savings Goals & Investments Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Savings Goals */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PiggyBank className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-base">Savings Schemes</h3>
            </div>
            <button
              onClick={() => setActiveTab('savings')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              Manage <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {savings.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">No active savings plan found.</div>
            ) : (
              savings.map((sav) => {
                const pct = sav.target_amount ? Math.min(100, Math.round((sav.current_balance / sav.target_amount) * 100)) : 100;
                return (
                  <div key={sav.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{sav.title}</h4>
                        <span className="text-[11px] text-slate-500 font-mono">{sav.account_number}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-extrabold text-slate-900">
                          ₦{Number(sav.current_balance).toLocaleString()}
                        </div>
                        {sav.target_amount > 0 && (
                          <div className="text-[10px] text-slate-500">
                            Target: ₦{Number(sav.target_amount).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>

                    {sav.target_amount > 0 && (
                      <div className="mt-2.5">
                        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                          <span>Progress</span>
                          <span className="font-bold text-emerald-700">{pct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Active Investments */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-base">Investment Yields</h3>
            </div>
            <button
              onClick={() => setActiveTab('investments')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Explore Schemes <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {investments.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">No active investments found.</div>
            ) : (
              investments.map((inv) => (
                <div key={inv.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{inv.scheme_name}</h4>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">Cert: {inv.certificate_no}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-indigo-700">
                        ₦{Number(inv.principal_amount).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-emerald-600 font-bold">
                        {inv.expected_roi_pct > 0 ? `+${inv.expected_roi_pct}% p.a.` : 'Ethical Profit Share'}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" /> Maturity: {inv.maturity_date}
                    </span>
                    <span className="font-semibold text-slate-800">
                      Est. Payout: ₦{Number(inv.expected_payout).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Recent Double-Entry Ledger Transactions */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Recent Ledger Movements</h3>
            <p className="text-xs text-slate-500">Double-entry verified transaction receipts</p>
          </div>
          <button
            onClick={() => setActiveTab('statement')}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
          >
            Full Statement
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                <th className="pb-3 pl-2">Reference</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Account</th>
                <th className="pb-3">Date</th>
                <th className="pb-3 text-right">Amount</th>
                <th className="pb-3 text-center">Status</th>
                <th className="pb-3 text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ledger.slice(0, 5).map((txn) => (
                <tr key={txn.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 pl-2 font-mono font-medium text-slate-700">{txn.txn_ref}</td>
                  <td className="py-3 font-semibold text-slate-800 uppercase">{txn.txn_type}</td>
                  <td className="py-3 text-slate-600">{txn.account_title || txn.account_type}</td>
                  <td className="py-3 text-slate-500">{new Date(txn.created_at).toLocaleDateString()}</td>
                  <td className={`py-3 text-right font-extrabold ${txn.txn_type === 'DEPOSIT' || txn.txn_type === 'DISBURSEMENT' ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {txn.txn_type === 'DEPOSIT' || txn.txn_type === 'DISBURSEMENT' ? '+' : '-'}₦{Number(txn.amount).toLocaleString()}
                  </td>
                  <td className="py-3 text-center">
                    <Badge status={txn.status} />
                  </td>
                  <td className="py-3 text-right pr-2">
                    <button
                      onClick={() => setSelectedTxn(txn)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                    >
                      Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal */}
      {selectedTxn && (
        <ReceiptModal
          isOpen={Boolean(selectedTxn)}
          onClose={() => setSelectedTxn(null)}
          txn={selectedTxn}
        />
      )}
    </div>
  );
}
