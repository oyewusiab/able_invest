import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import { 
  PiggyBank, 
  Plus, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Lock, 
  CheckCircle, 
  Calendar, 
  Sparkles,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function SavingsPortal({ isDepositOpen, setIsDepositOpen }) {
  const { savings, schemes, createSavingsPlan, depositToSavings, withdrawFromSavings } = useData();
  const { currentUser } = useAuth();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [selectedSavingsId, setSelectedSavingsId] = useState('');

  // Form states for creating a plan
  const [newTitle, setNewTitle] = useState('');
  const [selectedSchemeId, setSelectedSchemeId] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newInitialDeposit, setNewInitialDeposit] = useState('');
  const [newLockMonths, setNewLockMonths] = useState('3');

  // Form states for deposit/withdraw
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const savingsSchemes = schemes.filter(s => s.category === 'SAVINGS');
  const selectedScheme = schemes.find(s => s.id === selectedSchemeId) || savingsSchemes[0];

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    if (!newTitle) return;
    setIsSubmitting(true);
    await createSavingsPlan({
      title: newTitle,
      scheme_id: selectedSchemeId || (savingsSchemes[0] ? savingsSchemes[0].id : ''),
      target_amount: Number(newTarget) || 0,
      initial_deposit: Number(newInitialDeposit) || 0,
      lock_months: Number(newLockMonths) || 0,
      payment_method: paymentMethod
    });
    setIsSubmitting(false);
    setIsCreateOpen(false);
    setNewTitle('');
    setNewTarget('');
    setNewInitialDeposit('');
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    const targetId = selectedSavingsId || (savings[0] ? savings[0].id : '');
    if (!targetId || !amount || Number(amount) <= 0) return;

    setIsSubmitting(true);
    await depositToSavings(targetId, Number(amount), paymentMethod);
    setIsSubmitting(false);
    setIsDepositOpen(false);
    setAmount('');
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const targetId = selectedSavingsId || (savings[0] ? savings[0].id : '');
    if (!targetId || !amount || Number(amount) <= 0) return;

    setIsSubmitting(true);
    const res = await withdrawFromSavings(targetId, Number(amount));
    setIsSubmitting(false);
    if (res.success) {
      setIsWithdrawOpen(false);
      setAmount('');
    } else {
      setErrorMsg(res.message || 'Withdrawal could not be processed.');
    }
  };

  const totalSaved = savings.reduce((acc, s) => acc + (Number(s.current_balance) || 0), 0);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Savings & Goal Escrow</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Interest & Halal Schemes
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated disciplined savings, targeted emergency reserves, and ethical capital preservation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedSavingsId(savings[0]?.id || '');
              setIsDepositOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            <ArrowDownLeft className="w-4 h-4" /> Deposit
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
          >
            <Plus className="w-4 h-4" /> New Savings Plan
          </button>
        </div>
      </div>

      {/* Available Savings Schemes Highlight (Interest vs Zero-Interest) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {savingsSchemes.map((scheme) => (
          <div key={scheme.id} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:border-emerald-300 transition">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{scheme.code}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                scheme.has_interest ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-teal-50 text-teal-700 border border-teal-200'
              }`}>
                {scheme.has_interest ? `${scheme.interest_rate}% p.a. Accrual` : '0% Ethical Halal'}
              </span>
            </div>
            <h4 className="font-bold text-slate-900 text-sm mt-1">{scheme.name}</h4>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{scheme.description}</p>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
              <span>Min: ₦{Number(scheme.min_amount).toLocaleString()}</span>
              <button
                onClick={() => {
                  setSelectedSchemeId(scheme.id);
                  setIsCreateOpen(true);
                }}
                className="font-bold text-emerald-600 hover:text-emerald-700"
              >
                Choose Scheme &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* User's Active Savings Accounts */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold text-slate-900">Your Active Savings Pots ({savings.length})</h2>
          <span className="text-xs font-semibold text-slate-600">Total Saved: <span className="text-emerald-700 font-extrabold font-mono">₦{totalSaved.toLocaleString()}</span></span>
        </div>

        {savings.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-200/80">
            <PiggyBank className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <h3 className="font-bold text-slate-700 text-sm">No active savings plan yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Start building wealth with flexible daily thrift, goal savings, or 0% interest ethical capital preservation.
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
            >
              Create Your First Plan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savings.map((item) => {
              const target = Number(item.target_amount) || 0;
              const balance = Number(item.current_balance) || 0;
              const pct = target > 0 ? Math.min(100, Math.round((balance / target) * 100)) : 100;
              const isLocked = item.locked_until && new Date(item.locked_until) > new Date();

              return (
                <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                        <Badge status={item.status} />
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">{item.account_number}</span>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-black text-slate-900">
                        ₦{balance.toLocaleString()}
                      </div>
                      {target > 0 && (
                        <div className="text-[10px] text-slate-500 font-medium">
                          Goal: ₦{target.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar if goal */}
                  {target > 0 && (
                    <div className="mt-4">
                      <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                        <span>Savings Goal Progress</span>
                        <span className="font-bold text-emerald-700">{pct}% reached</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Lock Indicator */}
                  {item.locked_until && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Strict Lock until: {item.locked_until}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setSelectedSavingsId(item.id);
                        setIsWithdrawOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                    >
                      Withdraw
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSavingsId(item.id);
                        setIsDepositOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition shadow-sm"
                    >
                      + Add Funds
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE SAVINGS PLAN MODAL */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Savings Scheme Plan" subtitle="Set up a structured savings goal or lock fund">
        <form onSubmit={handleCreatePlan} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Plan Title</label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. House Rent 2027, Shop Expansion, Children School Fees"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Scheme Type</label>
            <select
              value={selectedSchemeId || (savingsSchemes[0]?.id || '')}
              onChange={(e) => setSelectedSchemeId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              {savingsSchemes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.has_interest ? `${s.interest_rate}% Interest p.a.` : '0% Zero-Interest Halal'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Amount (₦)</label>
              <input
                type="number"
                min="0"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                placeholder="e.g. 1000000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Initial Deposit (₦)</label>
              <input
                type="number"
                min="0"
                value={newInitialDeposit}
                onChange={(e) => setNewInitialDeposit(e.target.value)}
                placeholder="e.g. 50000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Discipline Lock Duration</label>
            <select
              value={newLockMonths}
              onChange={(e) => setNewLockMonths(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="0">Flexible (No Lock - Anytime Withdrawal)</option>
              <option value="3">3 Months Lock</option>
              <option value="6">6 Months Lock</option>
              <option value="12">12 Months Lock</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              {isSubmitting ? 'Creating...' : 'Initialize Savings Plan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DEPOSIT MODAL */}
      <Modal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} title="Deposit Funds to Savings" subtitle="Instant accounting credit to ledger">
        <form onSubmit={handleDeposit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Destination Savings Plan</label>
            <select
              value={selectedSavingsId || (savings[0]?.id || '')}
              onChange={(e) => setSelectedSavingsId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              {savings.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} (Bal: ₦{Number(s.current_balance).toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Deposit Amount (₦)</label>
            <input
              type="number"
              required
              min="500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 50000"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="BANK_TRANSFER">Bank Wire / Electronic Transfer</option>
              <option value="DEBIT_CARD">Debit Card (Mastercard / Visa / Verve)</option>
              <option value="CASH_DESK">Company Cashier Branch Deposit</option>
            </select>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold">Instant Double-Entry Settlement</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Funds deposited will immediately credit your target ledger and trigger an official voucher receipt.
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsDepositOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              {isSubmitting ? 'Processing...' : 'Confirm Deposit'}
            </button>
          </div>
        </form>
      </Modal>

      {/* WITHDRAW MODAL */}
      <Modal isOpen={isWithdrawOpen} onClose={() => setIsWithdrawOpen(false)} title="Withdraw Savings Funds" subtitle="Payout to your verified settlement account">
        <form onSubmit={handleWithdraw} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Source Savings Account</label>
            <select
              value={selectedSavingsId || (savings[0]?.id || '')}
              onChange={(e) => setSelectedSavingsId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              {savings.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} (Available: ₦{Number(s.current_balance).toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Withdrawal Amount (₦)</label>
            <input
              type="number"
              required
              min="100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 20000"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
            <span className="font-bold text-slate-800">Destination Settlement Account:</span>
            <div className="text-slate-700 mt-1 font-mono">
              {currentUser?.bank_name || 'Bank'} • {currentUser?.account_number || '0123456789'} ({currentUser?.account_name || currentUser?.full_name})
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsWithdrawOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
            >
              {isSubmitting ? 'Processing Payout...' : 'Confirm Withdrawal'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
