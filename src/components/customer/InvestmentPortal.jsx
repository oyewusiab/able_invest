import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import { 
  TrendingUp, 
  Award, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Calculator, 
  Sparkles, 
  ShieldCheck, 
  FileText,
  Printer
} from 'lucide-react';

export default function InvestmentPortal({ isInvestOpen, setIsInvestOpen }) {
  const { investments, schemes, createInvestment } = useData();
  const { currentUser } = useAuth();

  const [selectedSchemeId, setSelectedSchemeId] = useState('');
  const [principalAmount, setPrincipalAmount] = useState('250000');
  const [tenureMonths, setTenureMonths] = useState('12');
  const [payoutFrequency, setPayoutFrequency] = useState('AT_MATURITY');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeCert, setActiveCert] = useState(null);

  const investmentSchemes = schemes.filter(s => s.category === 'INVESTMENT');
  const currentScheme = schemes.find(s => s.id === selectedSchemeId) || investmentSchemes[0] || {};

  // Calculator logic
  const principal = Number(principalAmount) || 0;
  const tenure = Number(tenureMonths) || 12;
  const roiRate = currentScheme ? Number(currentScheme.interest_rate) : 18;
  const isHalal = currentScheme && (!currentScheme.has_interest || currentScheme.interest_type === 'PROFIT_SHARE');

  const calculatedRoi = isHalal ? 0 : Math.round(principal * (roiRate / 100) * (tenure / 12));
  const calculatedPayout = principal + calculatedRoi;

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!principal || principal < (currentScheme.min_amount || 25000)) return;

    setIsSubmitting(true);
    await createInvestment({
      scheme_id: currentScheme.id,
      principal_amount: principal,
      tenure_months: tenure,
      payout_frequency: payoutFrequency
    });
    setIsSubmitting(false);
    setIsInvestOpen(false);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Investment & Wealth Portfolios</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Fixed Yield & Halal Capital Growth
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Grow capital with institution-grade yield notes or participate in ethical zero-interest profit-sharing partnerships.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedSchemeId(investmentSchemes[0]?.id || '');
            setIsInvestOpen(true);
          }}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition self-start sm:self-auto"
        >
          <TrendingUp className="w-4 h-4" /> Start Investment
        </button>
      </div>

      {/* Available Investment Schemes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {investmentSchemes.map((scheme) => {
          const isEthical = !scheme.has_interest || scheme.interest_type === 'PROFIT_SHARE';
          return (
            <div key={scheme.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-indigo-300 transition flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{scheme.code}</span>
                  <Badge 
                    status={isEthical ? '0% Ethical Halal' : `${scheme.interest_rate}% p.a. ROI`} 
                    variant={isEthical ? 'zero-interest' : 'interest'}
                  />
                </div>
                <h3 className="font-bold text-slate-900 text-base mt-2">{scheme.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{scheme.description}</p>
                
                <div className="mt-4 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Minimum Principal:</span>
                    <span className="font-bold text-slate-900">₦{Number(scheme.min_amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tenure Range:</span>
                    <span className="font-bold text-slate-900">{scheme.min_tenure_months} - {scheme.max_tenure_months} Months</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Structure:</span>
                    <span className="font-bold text-indigo-700">{isEthical ? 'Shariah Mudarabah' : 'Guaranteed Fixed Coupon'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100">
                <button
                  onClick={() => {
                    setSelectedSchemeId(scheme.id);
                    setIsInvestOpen(true);
                  }}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition"
                >
                  Subscribe to Scheme &rarr;
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Investment Portfolios */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">Your Active Portfolios ({investments.length})</h2>

        {investments.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-200/80">
            <Award className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <h3 className="font-bold text-slate-700 text-sm">No active investments found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Explore ABLE INVEST high-yield notes and ethical funds to put your money to work today.
            </p>
            <button
              onClick={() => setIsInvestOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
            >
              Start Investing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {investments.map((inv) => (
              <div key={inv.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{inv.scheme_name}</h3>
                      <Badge status={inv.status} />
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">{inv.investment_ref}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-indigo-800">
                      ₦{Number(inv.principal_amount).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-bold">
                      {inv.expected_roi_pct > 0 ? `+${inv.expected_roi_pct}% p.a. ROI` : 'Quarterly Profit Dividend'}
                    </div>
                  </div>
                </div>

                {/* Details grid */}
                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Expected Payout</span>
                    <span className="font-extrabold text-slate-900">₦{Number(inv.expected_payout).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Maturity Date</span>
                    <span className="font-semibold text-slate-800">{inv.maturity_date}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Payout Mode</span>
                    <span className="font-semibold text-slate-800 capitalize">{inv.payout_frequency?.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Certificate No</span>
                    <span className="font-mono font-semibold text-slate-800 text-[11px]">{inv.certificate_no}</span>
                  </div>
                </div>

                {/* Action: View Certificate */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Certified Note
                  </span>
                  <button
                    onClick={() => setActiveCert(inv)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition"
                  >
                    <FileText className="w-3.5 h-3.5" /> View Certificate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SUBSCRIBE / CREATE INVESTMENT MODAL */}
      <Modal isOpen={isInvestOpen} onClose={() => setIsInvestOpen(false)} title="Subscribe to Investment Note" subtitle="Configure principal, tenure and expected yields">
        <form onSubmit={handleSubscribe} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Investment Scheme</label>
            <select
              value={selectedSchemeId || (investmentSchemes[0]?.id || '')}
              onChange={(e) => setSelectedSchemeId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {investmentSchemes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.has_interest ? `${s.interest_rate}% p.a. Fixed ROI` : '0% Ethical Halal Profit-Share'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Principal Amount (₦)</label>
            <input
              type="number"
              required
              min={currentScheme?.min_amount || 25000}
              value={principalAmount}
              onChange={(e) => setPrincipalAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">Minimum for this scheme: ₦{Number(currentScheme?.min_amount || 25000).toLocaleString()}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tenure (Months)</label>
              <select
                value={tenureMonths}
                onChange={(e) => setTenureMonths(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="3">3 Months</option>
                <option value="6">6 Months</option>
                <option value="12">12 Months (1 Year)</option>
                <option value="24">24 Months (2 Years)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payout Option</label>
              <select
                value={payoutFrequency}
                onChange={(e) => setPayoutFrequency(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="AT_MATURITY">Lump Sum at Maturity</option>
                <option value="QUARTERLY_DIVIDEND">Quarterly Dividend</option>
                <option value="MONTHLY_COUPON">Monthly Coupon</option>
              </select>
            </div>
          </div>

          {/* Dynamic Simulator Summary */}
          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs space-y-2">
            <div className="font-bold text-indigo-900 flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-indigo-600" /> Projected Yield Summary
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Principal Investment:</span>
              <span className="font-bold text-slate-800">₦{principal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Projected Yield / Profit:</span>
              <span className="font-bold text-emerald-700">
                {isHalal ? 'Variable Mudarabah Profit Share' : `+₦${calculatedRoi.toLocaleString()} (${roiRate}% p.a.)`}
              </span>
            </div>
            <div className="flex justify-between text-slate-800 pt-2 border-t border-indigo-200/70 text-sm font-extrabold">
              <span>Estimated Total Return:</span>
              <span className="text-indigo-900">₦{calculatedPayout.toLocaleString()}</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsInvestOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20"
            >
              {isSubmitting ? 'Issuing Note...' : 'Confirm & Invest'}
            </button>
          </div>
        </form>
      </Modal>

      {/* OFFICIAL INVESTMENT CERTIFICATE MODAL */}
      {activeCert && (
        <Modal isOpen={Boolean(activeCert)} onClose={() => setActiveCert(null)} title="Official Certificate of Investment" subtitle="Issued by ABLE INVEST LTD" maxWidth="max-w-lg">
          <div className="p-4 border-4 border-double border-indigo-200 rounded-2xl bg-gradient-to-b from-white to-slate-50 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>

            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400">Certificate of Holding</p>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">ABLE INVEST LTD</h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{activeCert.certificate_no}</p>
            </div>

            <div className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              This certifies that <strong className="text-slate-900">{currentUser?.full_name}</strong> is the registered holder of an active investment holding in:
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm max-w-sm mx-auto">
              <div className="text-sm font-bold text-slate-900">{activeCert.scheme_name}</div>
              <div className="text-2xl font-black text-indigo-700 mt-1">₦{Number(activeCert.principal_amount).toLocaleString()}</div>
              <div className="text-[11px] text-emerald-600 font-bold mt-0.5">
                {activeCert.expected_roi_pct > 0 ? `${activeCert.expected_roi_pct}% Annual Return` : 'Halal Profit Participation'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 max-w-sm mx-auto text-left">
              <div><strong>Effective Date:</strong> {activeCert.start_date}</div>
              <div><strong>Maturity Date:</strong> {activeCert.maturity_date}</div>
              <div><strong>Expected Payout:</strong> ₦{Number(activeCert.expected_payout).toLocaleString()}</div>
              <div><strong>Status:</strong> <span className="text-emerald-700 font-bold">AUTHENTIC & ACTIVE</span></div>
            </div>

            <div className="pt-3 border-t border-slate-200/80 flex items-center justify-center gap-6 text-[11px] text-slate-400">
              <div>
                <div className="font-script text-xs font-bold text-slate-700">A. B. Oyewusi</div>
                <div className="text-[9px] uppercase border-t border-slate-300 pt-0.5">Managing Director</div>
              </div>
              <div>
                <div className="font-script text-xs font-bold text-slate-700">Audit Desk</div>
                <div className="text-[9px] uppercase border-t border-slate-300 pt-0.5">Authorized Registrar</div>
              </div>
            </div>

            <div className="pt-2 flex justify-center gap-2 no-print">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-800"
              >
                <Printer className="w-4 h-4" /> Print Certificate
              </button>
              <button
                onClick={() => setActiveCert(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
