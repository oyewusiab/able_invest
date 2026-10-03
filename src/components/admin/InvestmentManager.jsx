import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import Badge from '../common/Badge';
import { 
  TrendingUp, 
  Award, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Search, 
  Filter, 
  Download,
  RefreshCw 
} from 'lucide-react';

export default function InvestmentManager() {
  const { investments, loadData, loading } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredInvs = investments.filter((inv) => {
    const matchesSearch = 
      (inv.investment_ref || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.scheme_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.user_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.certificate_no || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && inv.status === statusFilter;
  });

  const totalPrincipal = investments.filter(i => i.status === 'ACTIVE').reduce((a, b) => a + (Number(b.principal_amount) || 0), 0);
  const totalPayout = investments.filter(i => i.status === 'ACTIVE').reduce((a, b) => a + (Number(b.expected_payout) || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Investment Portfolios & Liquidity Desk</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Institutional Asset Oversight
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Monitor investor notes, track maturity schedules, and oversee returns for fixed-yield and Shariah-compliant funds.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={() => loadData()}
            disabled={loading}
            className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition flex items-center gap-1.5 font-bold"
            title="Synchronize investment records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            <span>Sync</span>
          </button>
          <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
            <span className="text-[10px] text-indigo-700 font-bold uppercase block">Total Managed Principal</span>
            <span className="text-base font-black text-indigo-900 font-mono">₦{totalPrincipal.toLocaleString()}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Maturity Liabilities</span>
            <span className="text-base font-black text-slate-900 font-mono">₦{totalPayout.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by investment ref, certificate number, or scheme..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active (Accruing)</option>
            <option value="MATURED">Matured</option>
            <option value="LIQUIDATED">Liquidated</option>
          </select>
        </div>
      </div>

      {/* Investment Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase font-bold text-[11px]">
                <th className="py-3.5 pl-4">Note Reference</th>
                <th className="py-3.5">Scheme & Type</th>
                <th className="py-3.5">Certificate No.</th>
                <th className="py-3.5 text-right">Principal</th>
                <th className="py-3.5 text-right">Expected Payout</th>
                <th className="py-3.5">Maturity Date</th>
                <th className="py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-slate-400 text-xs">
                    No investment notes found.
                  </td>
                </tr>
              ) : (
                filteredInvs.map((inv) => {
                  const isHalal = Number(inv.expected_roi_pct) === 0;
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 pl-4 font-mono font-bold text-slate-800">
                        {inv.investment_ref}
                        <span className="block text-[10px] text-slate-400 font-sans">{inv.start_date}</span>
                      </td>

                      <td className="py-3.5">
                        <div className="font-bold text-slate-900">{inv.scheme_name}</div>
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          isHalal ? 'bg-teal-50 text-teal-700' : 'bg-indigo-50 text-indigo-700'
                        }`}>
                          {isHalal ? '0% Halal Profit Share' : `${inv.expected_roi_pct}% p.a. Fixed`} • {inv.payout_frequency?.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 font-mono text-[11px] text-slate-600">
                        {inv.certificate_no}
                      </td>

                      <td className="py-3.5 text-right font-black text-indigo-900">
                        ₦{Number(inv.principal_amount).toLocaleString()}
                      </td>

                      <td className="py-3.5 text-right font-black text-slate-900">
                        ₦{Number(inv.expected_payout).toLocaleString()}
                      </td>

                      <td className="py-3.5 font-medium text-slate-700">
                        {inv.maturity_date}
                      </td>

                      <td className="py-3.5 text-center">
                        <Badge status={inv.status} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
