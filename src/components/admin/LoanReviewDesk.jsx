import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { api } from '../../services/api';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import confetti from 'canvas-confetti';
import { 
  HandCoins, 
  CheckCircle, 
  XCircle, 
  Send, 
  Search, 
  Filter, 
  UserCheck, 
  ShieldCheck, 
  Calendar, 
  AlertTriangle,
  FileText
} from 'lucide-react';

export default function LoanReviewDesk() {
  const { loans, schemes, reviewLoan } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Robust enrichment: ensures scheme_name and user_name are always available
  const enrichedLoans = (loans || []).map((ln) => {
    const matchedScheme = schemes.find(s => s.id === ln.scheme_id);
    return {
      ...ln,
      scheme_name: ln.scheme_name || (matchedScheme ? matchedScheme.name : 'Credit Scheme'),
      user_name: ln.user_name || 'Registered Client'
    };
  });

  const filteredLoans = enrichedLoans.filter((ln) => {
    const matchesSearch = 
      (ln.loan_ref || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ln.user_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ln.scheme_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ln.purpose || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ln.guarantor_name || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && ln.status === statusFilter;
  });

  const handleApprove = async (loanId) => {
    setIsSubmitting(true);
    await reviewLoan(loanId, 'APPROVE');
    setIsSubmitting(false);
  };

  const handleDisburse = async (loanId) => {
    setIsSubmitting(true);
    const res = await reviewLoan(loanId, 'DISBURSE');
    setIsSubmitting(false);
    if (res.success) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) { /* ignore */ }
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!selectedLoan) return;
    setIsSubmitting(true);
    await reviewLoan(selectedLoan.id, 'REJECT', rejectReason);
    setIsSubmitting(false);
    setIsRejectOpen(false);
    setRejectReason('');
  };

  const openSchedule = async (loan) => {
    setSelectedLoan(loan);
    const res = await api.getSchedules(loan.id);
    if (res.data?.schedules) {
      setSchedules(res.data.schedules);
    } else {
      setSchedules([]);
    }
    setIsScheduleOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Loan Underwriting & Credit Desk</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              Risk Analysis & Approval
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Analyze credit ratings, review collateral & guarantors, approve facilities, and execute automated loan disbursements.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold">
            Total Facility Volume: <span className="text-emerald-700 font-mono">₦{enrichedLoans.reduce((a, b) => a + (Number(b.principal_amount) || 0), 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by loan ref, borrower name or business purpose..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="APPROVED">Approved (Awaiting Disbursement)</option>
            <option value="ACTIVE">Active (Disbursed)</option>
            <option value="REPAID">Fully Repaid</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Loan Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase font-bold text-[11px]">
                <th className="py-3.5 pl-4">Loan Reference</th>
                <th className="py-3.5">Borrower Details</th>
                <th className="py-3.5">Scheme & Rate</th>
                <th className="py-3.5 text-right">Principal</th>
                <th className="py-3.5 text-right">Total Repayable</th>
                <th className="py-3.5 text-center">Credit Score</th>
                <th className="py-3.5 text-center">Status</th>
                <th className="py-3.5 text-right pr-4">Underwriting Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-slate-400 text-xs">
                    No loan applications match this filter.
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan) => {
                  const isZeroInterest = Number(loan.interest_rate) === 0;
                  return (
                    <tr key={loan.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 pl-4 font-mono font-bold text-slate-800">
                        {loan.loan_ref}
                        <span className="block text-[10px] text-slate-400 font-sans">{new Date(loan.created_at).toLocaleDateString()}</span>
                      </td>

                      <td className="py-3.5">
                        <div className="font-bold text-slate-900">{loan.user_name || 'Customer'}</div>
                        <div className="text-[10px] text-slate-500 max-w-xs truncate">{loan.purpose}</div>
                        <div className="text-[10px] text-slate-400">Guarantor: {loan.guarantor_name || 'N/A'} ({loan.guarantor_phone})</div>
                      </td>

                      <td className="py-3.5">
                        <div className="font-semibold text-slate-800">{loan.scheme_name}</div>
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          isZeroInterest ? 'bg-teal-50 text-teal-700' : 'bg-indigo-50 text-indigo-700'
                        }`}>
                          {isZeroInterest ? '0% Zero Interest' : `${loan.interest_rate}% Interest`} • {loan.duration_months} Mos
                        </span>
                      </td>

                      <td className="py-3.5 text-right font-black text-slate-900">
                        ₦{Number(loan.principal_amount).toLocaleString()}
                      </td>

                      <td className="py-3.5 text-right">
                        <div className="font-extrabold text-slate-900">₦{Number(loan.total_repayable).toLocaleString()}</div>
                        <div className="text-[10px] text-slate-500">₦{Number(loan.monthly_installment).toLocaleString()} /mo</div>
                      </td>

                      <td className="py-3.5 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                          (loan.credit_score || 720) > 740 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          (loan.credit_score || 720) > 680 ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {loan.credit_score || 720} ({loan.risk_level || 'LOW'})
                        </span>
                      </td>

                      <td className="py-3.5 text-center">
                        <Badge status={loan.status} />
                      </td>

                      <td className="py-3.5 text-right pr-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {loan.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApprove(loan.id)}
                                disabled={isSubmitting}
                                title="Approve Loan Application"
                                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedLoan(loan);
                                  setIsRejectOpen(true);
                                }}
                                disabled={isSubmitting}
                                title="Reject Application"
                                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {loan.status === 'APPROVED' && (
                            <button
                              onClick={() => handleDisburse(loan.id)}
                              disabled={isSubmitting}
                              className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
                            >
                              <Send className="w-3.5 h-3.5" /> Disburse Funds
                            </button>
                          )}

                          {(loan.status === 'ACTIVE' || loan.status === 'REPAID') && (
                            <button
                              onClick={() => openSchedule(loan)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition"
                            >
                              <FileText className="w-3.5 h-3.5" /> Schedules
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REJECTION REASON MODAL */}
      <Modal isOpen={isRejectOpen} onClose={() => setIsRejectOpen(false)} title="Reject Loan Application" subtitle="Provide underwriting rationale for audit trail">
        <form onSubmit={handleReject} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Rejection</label>
            <textarea
              required
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Debt-to-income ratio exceeds allowable limits, collateral insufficient..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsRejectOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
            >
              Confirm Rejection
            </button>
          </div>
        </form>
      </Modal>

      {/* REPAYMENT SCHEDULE MODAL FOR ADMIN */}
      {selectedLoan && (
        <Modal isOpen={isScheduleOpen} onClose={() => setIsScheduleOpen(false)} title={`Repayment Amortization: ${selectedLoan.loan_ref}`} subtitle={`Borrower: ${selectedLoan.user_name || 'Customer'} • Total: ₦${Number(selectedLoan.total_repayable).toLocaleString()}`} maxWidth="max-w-2xl">
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold">
                    <th className="pb-2.5 pl-2">#</th>
                    <th className="pb-2.5">Due Date</th>
                    <th className="pb-2.5 text-right">Principal</th>
                    <th className="pb-2.5 text-right">Interest</th>
                    <th className="pb-2.5 text-right">Total Installment</th>
                    <th className="pb-2.5 text-center">Status</th>
                    <th className="pb-2.5 text-right pr-2">Payment Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {schedules.map((sc) => (
                    <tr key={sc.id} className="hover:bg-slate-50">
                      <td className="py-2.5 pl-2 font-bold text-slate-700">Inst. #{sc.installment_no}</td>
                      <td className="py-2.5 text-slate-600">{sc.due_date}</td>
                      <td className="py-2.5 text-right text-slate-700">₦{Number(sc.principal_due).toLocaleString()}</td>
                      <td className="py-2.5 text-right text-slate-700">₦{Number(sc.interest_due).toLocaleString()}</td>
                      <td className="py-2.5 text-right font-bold text-slate-900">₦{Number(sc.total_due).toLocaleString()}</td>
                      <td className="py-2.5 text-center">
                        <Badge status={sc.status} />
                      </td>
                      <td className="py-2.5 text-right pr-2 font-mono text-[11px] text-slate-500">
                        {sc.payment_date || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
