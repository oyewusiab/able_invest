import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { SPREADSHEET_URL } from '../../services/api';
import { 
  Building2, 
  ExternalLink, 
  RefreshCw, 
  UserCheck, 
  ShieldCheck, 
  ChevronDown, 
  LogOut,
  Smartphone,
  Laptop,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const { currentUser, switchRole, logout, syncStatus, isCompanyStaff } = useAuth();
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
                {isCompanyStaff ? 'Company Suite' : 'Customer PWA'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Loan, Investment & Savings Scheme Platform</p>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Google Sheet Direct Link */}
          <a
            href={SPREADSHEET_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="Open connected Google Sheets database"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-navy-800 hover:bg-navy-700 text-slate-300 border border-navy-700 transition"
          >
            <span>Google Sheet DB</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>

          {/* Refresh Data button */}
          <button
            onClick={() => loadData()}
            disabled={loading}
            title="Synchronize records with Google Sheet"
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-navy-800 border border-navy-700 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          {/* Cloud Sync Status Indicator */}
          <div 
            title={syncStatus === 'cloud' ? 'Connected to Google Apps Script' : 'Operating in High-Speed Local Ledger Sync'}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-navy-800/80 border border-navy-700"
          >
            <span className={`w-2 h-2 rounded-full ${syncStatus === 'cloud' ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-400'}`} />
            <span className="text-slate-300 text-[11px]">
              {syncStatus === 'cloud' ? 'Sheet Connected' : 'Auto-Sync Active'}
            </span>
          </div>

          {/* Role Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-navy-800 hover:bg-navy-700 border border-navy-700 text-xs font-semibold transition"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                {currentUser?.role === 'SUPER_ADMIN' ? 'A' : currentUser?.role === 'LOAN_OFFICER' ? 'O' : 'C'}
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
                  <p className="text-xs text-slate-400 font-medium">Logged in as</p>
                  <p className="text-sm font-bold text-slate-900">{currentUser?.full_name}</p>
                  <p className="text-xs text-slate-500">{currentUser?.email}</p>
                </div>

                <div className="px-3 py-2">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">Switch Platform View</p>
                  
                  <button
                    onClick={() => { switchRole('SUPER_ADMIN'); setDropdownOpen(false); setActiveTab('overview'); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition ${currentUser?.role === 'SUPER_ADMIN' ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-slate-50 text-slate-700'}`}
                  >
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-bold">Super Admin (Company)</div>
                      <div className="text-[10px] text-slate-500">Full Web Management Suite</div>
                    </div>
                  </button>

                  <button
                    onClick={() => { switchRole('LOAN_OFFICER'); setDropdownOpen(false); setActiveTab('loans'); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition ${currentUser?.role === 'LOAN_OFFICER' ? 'bg-sky-50 text-sky-700' : 'hover:bg-slate-50 text-slate-700'}`}
                  >
                    <ShieldCheck className="w-4 h-4 text-sky-600" />
                    <div>
                      <div className="font-bold">Loan Analyst Desk</div>
                      <div className="text-[10px] text-slate-500">Credit Score & Approval</div>
                    </div>
                  </button>

                  <button
                    onClick={() => { switchRole('CUSTOMER'); setDropdownOpen(false); setActiveTab('overview'); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition ${currentUser?.role === 'CUSTOMER' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-700'}`}
                  >
                    <Smartphone className="w-4 h-4 text-indigo-600" />
                    <div>
                      <div className="font-bold">Customer Portal (PWA)</div>
                      <div className="text-[10px] text-slate-500">Savings, Loans & Investment</div>
                    </div>
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={() => { logout(); setDropdownOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                  >
                    <LogOut className="w-4 h-4" /> Reset / Logout
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
