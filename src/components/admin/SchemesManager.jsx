import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import { 
  Sliders, 
  Plus, 
  HandCoins, 
  TrendingUp, 
  PiggyBank, 
  ShieldCheck, 
  Check, 
  HelpCircle 
} from 'lucide-react';

export default function SchemesManager() {
  const { schemes, createScheme } = useData();

  const [activeCategory, setActiveCategory] = useState('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form State
  const [category, setCategory] = useState('LOAN');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [hasInterest, setHasInterest] = useState(true);
  const [interestRate, setInterestRate] = useState('3.5');
  const [interestType, setInterestType] = useState('FLAT_MONTHLY');
  const [minAmount, setMinAmount] = useState('50000');
  const [maxAmount, setMaxAmount] = useState('2000000');
  const [minTenure, setMinTenure] = useState('1');
  const [maxTenure, setMaxTenure] = useState('12');
  const [feePct, setFeePct] = useState('1.0');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredSchemes = schemes.filter(s => {
    if (activeCategory === 'ALL') return true;
    return s.category === activeCategory;
  });

  const handleCreateScheme = async (e) => {
    e.preventDefault();
    if (!name) return;

    setIsSubmitting(true);
    await createScheme({
      code: code || `SCH_${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      category,
      description,
      has_interest: hasInterest,
      interest_rate: hasInterest ? Number(interestRate) : 0,
      interest_type: hasInterest ? interestType : 'ZERO_INTEREST',
      min_amount: Number(minAmount) || 0,
      max_amount: Number(maxAmount) || 0,
      min_tenure_months: Number(minTenure) || 1,
      max_tenure_months: Number(maxTenure) || 12,
      processing_fee_pct: Number(feePct) || 0
    });

    setIsSubmitting(false);
    setIsCreateOpen(false);
    setName('');
    setDescription('');
    setCode('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Financial Scheme Configurator</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Interest & Zero-Interest Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure flexible lending, wealth creation, and target savings programs with automated interest or ethical 0% rules.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-600/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create New Scheme
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        {['ALL', 'LOAN', 'INVESTMENT', 'SAVINGS'].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeCategory === cat
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {cat === 'ALL' ? 'All Schemes' : `${cat} Schemes`}
          </button>
        ))}
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSchemes.map((scheme) => {
          const isZero = !scheme.has_interest || scheme.interest_type === 'ZERO_INTEREST' || scheme.interest_type === 'PROFIT_SHARE';

          return (
            <div key={scheme.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-slate-300 transition flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400">{scheme.code}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isZero ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  }`}>
                    {isZero ? '0% Ethical Zero-Interest' : `${scheme.interest_rate}% Interest Rate`}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  {scheme.category === 'LOAN' && <HandCoins className="w-4 h-4 text-amber-600" />}
                  {scheme.category === 'INVESTMENT' && <TrendingUp className="w-4 h-4 text-indigo-600" />}
                  {scheme.category === 'SAVINGS' && <PiggyBank className="w-4 h-4 text-emerald-600" />}
                  <h3 className="font-bold text-slate-900 text-sm">{scheme.name}</h3>
                </div>

                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {scheme.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Category:</span>
                    <span className="font-bold text-slate-800 uppercase">{scheme.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount Limits:</span>
                    <span className="font-bold text-slate-800">₦{Number(scheme.min_amount).toLocaleString()} - ₦{Number(scheme.max_amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration Range:</span>
                    <span className="font-bold text-slate-800">{scheme.min_tenure_months} - {scheme.max_tenure_months} Months</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Interest Model:</span>
                    <span className="font-bold text-slate-800 capitalize">{scheme.interest_type?.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Status: <strong className="text-emerald-700 font-semibold">Active</strong></span>
                <span className="font-mono text-[10px]">{scheme.id}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE SCHEME MODAL */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Configure New Financial Scheme" subtitle="Add customized interest or zero-interest financial product" maxWidth="max-w-xl">
        <form onSubmit={handleCreateScheme} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Product Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="LOAN">Loan Facility</option>
                <option value="INVESTMENT">Investment Instrument</option>
                <option value="SAVINGS">Savings Scheme</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Scheme Code (Unique)</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. LN_AGRI_01, INV_GREEN"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Scheme Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Agricultural Equipment Soft Loan, Ethical Halal Savings"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Specify terms, qualification criteria, and target audience..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Interest Toggle & Configuration */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Interest Model Type</span>
                <span className="text-[11px] text-slate-500">Toggle whether this product incurs/accrues interest or is strictly 0% zero-interest</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setHasInterest(!hasInterest)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    hasInterest ? 'bg-indigo-600' : 'bg-teal-500'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    hasInterest ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
                <span className="text-xs font-bold">
                  {hasInterest ? 'Standard Interest' : '0% Zero-Interest'}
                </span>
              </div>
            </div>

            {hasInterest ? (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Amortization Structure</label>
                  <select
                    value={interestType}
                    onChange={(e) => setInterestType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white"
                  >
                    <option value="FLAT_MONTHLY">Flat Monthly Rate</option>
                    <option value="REDUCING_BALANCE">Reducing Balance</option>
                    <option value="ANNUAL_FIXED">Annual Fixed Coupon</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-xs text-teal-800">
                ✓ <strong>Ethical Zero-Interest / Halal Protection:</strong> Strict ₦0 interest charge. Uses capital preservation, soft welfare underwriting, or Mudarabah profit dividends.
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Min Capital (₦)</label>
              <input
                type="number"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Max Capital (₦)</label>
              <input
                type="number"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Min Duration (Months)</label>
              <input
                type="number"
                value={minTenure}
                onChange={(e) => setMinTenure(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Max Duration (Months)</label>
              <input
                type="number"
                value={maxTenure}
                onChange={(e) => setMaxTenure(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
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
              {isSubmitting ? 'Saving Scheme...' : 'Save Scheme to Catalog'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
