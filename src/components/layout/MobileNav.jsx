import React from 'react';
import { 
  Home, 
  PiggyBank, 
  TrendingUp, 
  HandCoins, 
  ReceiptText 
} from 'lucide-react';

export default function MobileNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'overview', label: 'Home', icon: Home },
    { id: 'savings', label: 'Savings', icon: PiggyBank },
    { id: 'investments', label: 'Invest', icon: TrendingUp },
    { id: 'loans', label: 'Loans', icon: HandCoins },
    { id: 'statement', label: 'Ledger', icon: ReceiptText },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-2 flex items-center justify-around shadow-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
              isActive 
                ? 'text-emerald-600 scale-105' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className={`p-1 rounded-lg ${isActive ? 'bg-emerald-50' : ''}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className={`text-[10px] mt-0.5 font-bold ${isActive ? 'text-emerald-600' : 'text-slate-500'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
