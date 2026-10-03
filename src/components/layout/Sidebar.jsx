import React from 'react';
import { 
  LayoutDashboard, 
  HandCoins, 
  TrendingUp, 
  PiggyBank, 
  Receipt, 
  Sliders, 
  Users, 
  FileText,
  BadgeAlert
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { adminMetrics } = useData();

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { 
      id: 'loans', 
      label: 'Loan Desk', 
      icon: HandCoins, 
      badge: adminMetrics.pendingLoansCount > 0 ? adminMetrics.pendingLoansCount : null 
    },
    { id: 'investments', label: 'Investments', icon: TrendingUp },
    { id: 'savings', label: 'Savings Schemes', icon: PiggyBank },
    { 
      id: 'ledger', 
      label: 'Financial Ledger', 
      icon: Receipt,
      badge: adminMetrics.pendingTxnsCount > 0 ? adminMetrics.pendingTxnsCount : null
    },
    { id: 'schemes', label: 'Scheme Configurator', icon: Sliders },
    { id: 'users', label: 'Users & KYC', icon: Users, badge: adminMetrics.pendingKycCount > 0 ? adminMetrics.pendingKycCount : null },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 min-h-[calc(100vh-4rem)] p-4 hidden md:flex flex-col justify-between">
      <div className="space-y-6">
        <div>
          <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Company Administration
          </div>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive 
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white text-emerald-700' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick System Status Card */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs">
          <div className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping"></span>
            Accounting Ledger Status
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Double-entry transactions and interest accruals synchronized in real-time.
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center">
        ABLE INVEST System v1.0
      </div>
    </aside>
  );
}
