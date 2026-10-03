import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { 
  Building2, 
  RefreshCw, 
  LogOut,
  ChevronDown
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const { currentUser, logout, isCompanyStaff } = useAuth();
  const { loadData, loading } = useData();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-navy-900 border-b border-navy-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-sky-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white">ABLE INVEST</span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {isCompanyStaff ? 'Management Platform' : 'Client PWA'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Loan, Investment & Savings Management Platform</p>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Refresh Data button */}
          <button
            onClick={() => loadData()}
            disabled={loading}
            title="Synchronize records"
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-navy-800 border border-navy-700 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          {/* User Profile & Session Logout */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-navy-800 hover:bg-navy-700 border border-navy-700 text-xs font-semibold transition"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                {currentUser?.full_name ? currentUser.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-white text-xs font-bold leading-tight">{currentUser?.full_name?.split(' ')[0]}</div>
                <div className="text-[10px] text-emerald-400 capitalize">{currentUser?.role?.replace('_', ' ').toLowerCase()}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Session</p>
                  <p className="text-sm font-bold text-slate-900">{currentUser?.full_name}</p>
                  <p className="text-xs text-slate-500">{currentUser?.email}</p>
                  <div className="mt-1">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {currentUser?.role?.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="px-4 py-2 text-xs text-slate-600">
                  <div className="text-[11px] text-slate-400">Account ID:</div>
                  <div className="font-mono text-slate-800 font-semibold">{currentUser?.id}</div>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out / Lock Session
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
