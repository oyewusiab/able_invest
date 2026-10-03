import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import { 
  HandCoins, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Calculator, 
  Plus, 
  AlertCircle, 
  ShieldCheck, 
  UserCheck, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function LoanPortal({ isApplyOpen, setIsApplyOpen }) {
  const { loans, schemes, applyForLoan, repayLoan } = useData();
  const { currentUser } = useAuth();

  const [selectedSchemeId, setSelectedSchemeId] = useState('');
  const [principalAmount, setPrincipalAmount] = useState('200000');
  const [durationMonths, setDurationMonths] = useState('4');
  const [purpose, setPurpose] = useState('');
  const [collateral, setCollateral] = useState('Personal Guarantee');
  const [guarantorName, setGuarantorName] = useState('');
  const [guarantorPhone, setGuarantorPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Repayment modal
  const [isRepayOpen, setIsRepayOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [repayAmount, setRepayAmount] = useState('');
  const [repayMethod, setRepayMethod] = useState('BANK_TRANSFER');

  // Schedules state
  const [schedules, setSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);

  const loanSchemes = schemes.filter(s => s.category === 'LOAN');
  const activeLoan = loans.find(l => l.status === 'ACTIVE');
  const pendingLoan = loans.find(l => l.status === 'PENDING' || l.status === 'UNDER_REVIEW');

  const currentScheme = schemes.find(s => s.id === selectedSchemeId) || loanSchemes[0] || {};

  // Calculator Logic
  const principal = Number(principalAmount) || 0;
  const tenure = Number(durationMonths) || 1;
  const interestRate = currentScheme ? Number(currentScheme.interest_rate) : 0;
  const hasInterest = currentScheme ? Boolean(currentScheme.has_interest) : false;

  let totalInterest = 0;
  let totalRepayable = principal;
  if (hasInterest && interestRate > 0) {
    totalInterest = Math.round(principal * (interestRate / 100) * tenure);
    totalRepayable = principal + totalInterest;
  }
  const monthlyInstallment = Math.round(totalRepayable / tenure);

  useEffect(() => {
    if (activeLoan) {
      loadSchedules(activeLoan.id);
    }
  }, [activeLoan]);

  const loadSchedules = async (loanId) => {
    setLoadingSchedules(true);
    const res = await api.getSchedules(loanId);
    if (res.data?.schedules) {
      setSchedules(res.data.schedules);
    }
    setLoadingSchedules(false);
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!principal || !purpose) return;

    setIsSubmitting(true);
    await applyForLoan({
      scheme_id: currentScheme.id,
      principal_amount: principal,
      duration_months: tenure,
      purpose,
      collateral_details: collateral,
      guarantor_name: guarantorName,
      guarantor_phone: guarantorPhone
    });
    setIsSubmitting(false);
    setIsApplyOpen(false);
  };

  const handleRepay = async (e) => {
    e.preventDefault();
    if (!selectedLoan || !repayAmount) return;

    setIsSubmitting(true);
    await repayLoan(selectedLoan.id, Number(repayAmount), repayMethod);
    setIsSubmitting(false);
    setIsRepayOpen(false);
    setRepayAmount('');
    if (activeLoan) loadSchedules(activeLoan.id);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Loan & Credit Facilities</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              Zero-Interest & Standard Loans
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Access transparent credit with flexible amortizations. Choose between ethical 0% soft loans or business capital.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedSchemeId(loanSchemes[0]?.id || '');
            setIsApplyOpen(true);
          }}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Apply for Loan
        </button>
      </div>

      {/* Available Loan Schemes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loanSchemes.map((scheme) => (
          <div key={scheme.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-amber-300 transition flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{scheme.code}</span>
                <Badge
                  status={scheme.has_interest ? `${scheme.interest_rate}% mthly rate` : '0% ZERO-INTEREST'}
                  variant={scheme.has_interest ? 'interest' : 'zero-interest'}
                />
              </div>
              <h3 className="font-bold text-slate-900 text-base mt-2">{scheme.name}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{scheme.description}</p>

              <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Limits:</span>
                  <span className="font-bold text-slate-900">₦{Number(scheme.min_amount).toLocaleString()} - ₦{Number(scheme.max_amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-bold text-slate-900">{scheme.min_tenure_months} - {scheme.max_tenure_months} Months</span>
                </div>
                <div className="flex justify-between">
                  <span>Interest Type:</span>
                  <span className="font-bold text-amber-800 capitalize">{scheme.interest_type?.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setSelectedSchemeId(scheme.id);
                  setIsApplyOpen(true);
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 transition"
              >
                Apply for this Scheme &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Active Loan or Pending Application Review */}
      {pendingLoan && !activeLoan && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
          <Clock className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm">Application Under Underwriting Review</h3>
              <Badge status={pendingLoan.status} />
            </div>
            <p className="text-xs text-slate-600">
              Your application for <strong>₦{Number(pendingLoan.principal_amount).toLocaleString()}</strong> ({pendingLoan.scheme_name}) has been received and is currently undergoing credit score and guarantor underwriting.
            </p>
            <div className="text-[11px] text-slate-500 font-mono mt-1">Ref: {pendingLoan.loan_ref} • Submitted on {new Date(pendingLoan.created_at).toLocaleDateString()}</div>
          </div>
        </div>
      )}

      {/* Active Loan Schedule & Repayment Desk */}
      {activeLoan && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{activeLoan.scheme_name}</h3>
                <Badge status={activeLoan.status} />
                {activeLoan.interest_rate === 0 && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">
                    Zero-Interest Soft Facility
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Loan Reference: <span className="font-mono font-bold text-slate-800">{activeLoan.loan_ref}</span></p>
            </div>

            <button
              onClick={() => {
                setSelectedLoan(activeLoan);
                setRepayAmount(String(activeLoan.monthly_installment));
                setIsRepayOpen(true);
              }}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Make Installment Repayment (₦{Number(activeLoan.monthly_installment).toLocaleString()})
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Principal Disbursed</span>
              <span className="font-black text-slate-900 text-sm">₦{Number(activeLoan.principal_amount).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Total Repayable</span>
              <span className="font-black text-slate-900 text-sm">₦{Number(activeLoan.total_repayable).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Total Repaid So Far</span>
              <span className="font-black text-emerald-600 text-sm">₦{Number(activeLoan.amount_repaid || 0).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Remaining Balance</span>
              <span className="font-black text-amber-700 text-sm">₦{Number(activeLoan.amount_outstanding || 0).toLocaleString()}</span>
            </div>
          </div>

          {/* Amortization Schedule Table */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-3">Installment Repayment Amortization Schedule</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                    <th className="pb-2.5 pl-2">Inst. #</th>
                    <th className="pb-2.5">Due Date</th>
                    <th className="pb-2.5 text-right">Principal Due</th>
                    <th className="pb-2.5 text-right">Interest</th>
                    <th className="pb-2.5 text-right">Total Installment</th>
                    <th className="pb-2.5 text-center">Status</th>
                    <th className="pb-2.5 text-right pr-2">Paid Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {schedules.map((sc) => (
                    <tr key={sc.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 pl-2 font-bold text-slate-700">Installment #{sc.installment_no}</td>
                      <td className="py-3 text-slate-600">{sc.due_date}</td>
                      <td className="py-3 text-right text-slate-700">₦{Number(sc.principal_due).toLocaleString()}</td>
                      <td className="py-3 text-right text-slate-700">₦{Number(sc.interest_due).toLocaleString()}</td>
                      <td className="py-3 text-right font-bold text-slate-900">₦{Number(sc.total_due).toLocaleString()}</td>
                      <td className="py-3 text-center">
                        <Badge status={sc.status} />
                      </td>
                      <td className="py-3 text-right pr-2 text-slate-500 font-mono text-[11px]">
                        {sc.payment_date || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* LOAN APPLICATION WIZARD MODAL */}
      <Modal isOpen={isApplyOpen} onClose={() => setIsApplyOpen(false)} title="Apply for Loan Facility" subtitle="Dynamic credit simulator & instant analysis" maxWidth="max-w-xl">
        <form onSubmit={handleApply} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Scheme</label>
            <select
              value={selectedSchemeId || (loanSchemes[0]?.id || '')}
              onChange={(e) => setSelectedSchemeId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              {loanSchemes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.has_interest ? `${s.interest_rate}% mthly rate` : '0% Zero-Interest Soft Loan'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Requested Principal (₦)</label>
              <input
                type="number"
                required
                min={currentScheme?.min_amount || 20000}
                max={currentScheme?.max_amount || 5000000}
                value={principalAmount}
                onChange={(e) => setPrincipalAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Duration (Months)</label>
              <input
                type="number"
                required
                min={currentScheme?.min_tenure_months || 1}
                max={currentScheme?.max_tenure_months || 12}
                value={durationMonths}
                onChange={(e) => setDurationMonths(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Dynamic Simulator Comparison Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="font-bold text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Calculator className="w-4 h-4 text-emerald-600" /> Amortization Simulator</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${hasInterest ? 'bg-indigo-100 text-indigo-800' : 'bg-teal-100 text-teal-800'}`}>
                {hasInterest ? `${interestRate}% Monthly Interest` : 'Zero Interest (₦0 Charge)'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px]">Monthly Payment</span>
                <span className="font-extrabold text-slate-900 text-sm">₦{monthlyInstallment.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Total Interest</span>
                <span className={`font-extrabold text-sm ${hasInterest ? 'text-indigo-700' : 'text-emerald-700'}`}>
                  ₦{totalInterest.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Total Repayable</span>
                <span className="font-extrabold text-slate-900 text-sm">₦{totalRepayable.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Loan Purpose & Business Utilization</label>
            <input
              type="text"
              required
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Retail inventory purchase, emergency operating expenses"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Guarantor Full Name</label>
              <input
                type="text"
                required
                value={guarantorName}
                onChange={(e) => setGuarantorName(e.target.value)}
                placeholder="Dr. Johnson Adeleke"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Guarantor Phone</label>
              <input
                type="tel"
                required
                value={guarantorPhone}
                onChange={(e) => setGuarantorPhone(e.target.value)}
                placeholder="+234 803 333 4444"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Collateral / Security Details</label>
            <input
              type="text"
              value={collateral}
              onChange={(e) => setCollateral(e.target.value)}
              placeholder="Personal Guarantee / Asset Receipt"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsApplyOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
            >
              {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </Modal>

      {/* REPAYMENT MODAL */}
      <Modal isOpen={isRepayOpen} onClose={() => setIsRepayOpen(false)} title="Submit Loan Repayment" subtitle="Accounting credit to repayment ledger">
        <form onSubmit={handleRepay} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Repayment Amount (₦)</label>
            <input
              type="number"
              required
              min="1000"
              value={repayAmount}
              onChange={(e) => setRepayAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
            <select
              value={repayMethod}
              onChange={(e) => setRepayMethod(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="BANK_TRANSFER">Bank Wire / Electronic Transfer</option>
              <option value="DEBIT_CARD">Debit Card (Instant Online Settlement)</option>
              <option value="CASH_DESK">Branch Cashier Deposit</option>
            </select>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
            <span className="font-bold text-slate-800">ABLE INVEST Collection Account:</span>
            <div className="text-slate-700 mt-1 font-mono">
              First Bank of Nigeria • 0123456789 (ABLE INVEST LTD)
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsRepayOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              {isSubmitting ? 'Confirming Repayment...' : 'Confirm Repayment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
