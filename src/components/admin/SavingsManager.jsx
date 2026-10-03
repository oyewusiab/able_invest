import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import Badge from '../common/Badge';
import { 
  PiggyBank, 
  Lock, 
  Search, 
  CheckCircle, 
  Download,
  RefreshCw 
} from 'lucide-react';

export default function SavingsManager() {
  const { savings, schemes, loadData, loading } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSavings = savings.filter((s) => {
    return (
      (s.account_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.user_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalBalance = savings.reduce((a, b) => a + (Number(b.current_balance) || 0), 0);
  const totalTarget = savings.reduce((a, b) => a + (Number(b.target_amount) || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Savings Scheme Accounts</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Customer Liabilities & Escrow
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track user target pots, strict lock maturities, and ethical capital safekeeping accounts.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={() => loadData()}
            disabled={loading}
            className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition flex items-center gap-1.5 font-bold"
            title="Synchronize savings records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Sync</span>
          </button>
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
            <span className="text-[10px] text-emerald-700 font-bold uppercase block">Total Deposits Held</span>
            <span className="text-base font-black text-emerald-900 font-mono">₦{totalBalance.toLocaleString()}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Target Capital Sum</span>
            <span className="text-base font-black text-slate-900 font-mono">₦{totalTarget.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by account number, title or saver..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase font-bold text-[11px]">
                <th className="py-3.5 pl-4">Account Number</th>
                <th className="py-3.5">Plan Title & Saver</th>
                <th className="py-3.5 text-right">Current Balance</th>
                <th className="py-3.5 text-right">Target Amount</th>
                <th className="py-3.5 text-center">Progress</th>
                <th className="py-3.5 text-center">Lock Status</th>
                <th className="py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSavings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-slate-400 text-xs">
                    No savings accounts found.
                  </td>
                </tr>
              ) : (
                filteredSavings.map((s) => {
                  const target = Number(s.target_amount) || 0;
                  const balance = Number(s.current_balance) || 0;
                  const pct = target > 0 ? Math.min(100, Math.round((balance / target) * 100)) : 100;
                  const isLocked = s.locked_until && new Date(s.locked_until) > new Date();

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 pl-4 font-mono font-bold text-slate-800">
                        {s.account_number}
                        <span className="block text-[10px] text-slate-400 font-sans">{new Date(s.created_at).toLocaleDateString()}</span>
                      </td>

                      <td className="py-3.5">
                        <div className="font-bold text-slate-900">{s.title}</div>
                        <div className="text-[10px] text-slate-500">{s.user_name || 'Customer Account'}</div>
                      </td>

                      <td className="py-3.5 text-right font-black text-emerald-700">
                        ₦{balance.toLocaleString()}
                      </td>

                      <td className="py-3.5 text-right font-medium text-slate-600">
                        {target > 0 ? `₦${target.toLocaleString()}` : 'Flexible'}
                      </td>

                      <td className="py-3.5 text-center">
                        <span className="font-bold text-slate-800">{pct}%</span>
                      </td>

                      <td className="py-3.5 text-center">
                        {isLocked ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800">
                            <Lock className="w-3 h-3" /> Locked: {s.locked_until}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">Flexible</span>
                        )}
                      </td>

                      <td className="py-3.5 text-center">
                        <Badge status={s.status} />
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
