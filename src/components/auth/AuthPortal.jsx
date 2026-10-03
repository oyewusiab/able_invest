import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SPREADSHEET_URL } from '../../services/api';
import { 
  Building2, 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  CreditCard, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  ExternalLink,
  HelpCircle,
  PiggyBank,
  TrendingUp,
  HandCoins,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

export default function AuthPortal() {
  const { login, register, authError, syncStatus, syncLatency } = useAuth();

  // Mode: 'CLIENT' | 'STAFF'
  const [authMode, setAuthMode] = useState('CLIENT');
  // Client tab: 'SIGNIN' | 'SIGNUP'
  const [clientTab, setClientTab] = useState('SIGNIN');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [bvnNin, setBvnNin] = useState('');
  const [address, setAddress] = useState('');
  const [nextOfKin, setNextOfKin] = useState('');
  const [bankName, setBankName] = useState('Guaranty Trust Bank');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Client / Staff Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.message || 'Invalid credentials.');
    }
  };

  // Handle Client Sign Up
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!fullName || !email) {
      setErrorMsg('Please complete all required fields.');
      return;
    }
    setLoading(true);
    const res = await register({
      full_name: fullName,
      email,
      phone,
      bvn_nin: bvnNin,
      address,
      next_of_kin: nextOfKin,
      bank_name: bankName,
      account_number: accountNumber,
      account_name: accountName || fullName,
      role: 'CUSTOMER'
    });
    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.message || 'Registration failed.');
    }
  };

  // Auto-fill Helpers
  const fillStaffAdmin = () => {
    setAuthMode('STAFF');
    setEmail('admin@ableinvest.com');
    setPassword('admin123');
  };

  const fillStaffOfficer = () => {
    setAuthMode('STAFF');
    setEmail('officer@ableinvest.com');
    setPassword('officer123');
  };

  const fillClientDemo = () => {
    setAuthMode('CLIENT');
    setClientTab('SIGNIN');
    setEmail('customer@ableinvest.com');
    setPassword('customer123');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Top Corporate Navigation */}
      <header className="bg-navy-900 border-b border-navy-800 text-white py-3.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-sky-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white">ABLE INVEST</span>
              <p className="text-[11px] text-slate-400 hidden sm:block">Loan, Investment & Savings Management Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {/* Google Sheet Live Status */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-navy-800 border border-navy-700">
              <span className={`w-2 h-2 rounded-full ${syncStatus === 'cloud' ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-400'}`} />
              <span className="text-slate-300 font-medium">
                {syncStatus === 'cloud' 
                  ? `Live Google Sheet API (${syncLatency ? `${syncLatency}ms` : 'Connected'})`
                  : 'Google Sheet Active Sync'}
              </span>
            </div>

            <a
              href={SPREADSHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700 transition"
            >
              <span>Sheet Database</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Authentication & Welcome Area */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-4 sm:p-8 lg:p-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Column: Platform Showcase */}
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Enterprise Financial Core
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Transparent Loans, Yield Investments & Goal Savings
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl">
            Whether you require zero-interest soft emergency capital, structured commercial SME loans, high-yield fixed notes, or ethical Shariah Mudarabah funds, ABLE INVEST maintains strict accounting integrity backed by real-time ledger accounting.
          </p>

          {/* Core Feature Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
                <HandCoins className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-xs">Flexible Loans</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">0% Zero-interest soft facilities or structured business loans.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-xs">High-Yield Notes</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Up to 18% p.a. guaranteed fixed ROI or Halal profit-shares.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                <PiggyBank className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-xs">Target Savings</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Automated goal pots with safe discipline locks.</p>
            </div>
          </div>

          {/* Quick Staff Demo Login Links */}
          <div className="p-4 rounded-2xl bg-slate-100/80 border border-slate-200 text-xs space-y-2">
            <span className="font-bold text-slate-700 block">Default Company Staff Credentials:</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={fillStaffAdmin}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-[11px] transition flex items-center gap-1 shadow-xs"
              >
                <span>🔑 Super Admin: admin@ableinvest.com</span>
              </button>
              <button
                type="button"
                onClick={fillStaffOfficer}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-[11px] transition flex items-center gap-1 shadow-xs"
              >
                <span>🔑 Loan Officer: officer@ableinvest.com</span>
              </button>
              <button
                type="button"
                onClick={fillClientDemo}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-[11px] transition flex items-center gap-1 shadow-xs"
              >
                <span>👤 Client Demo: customer@ableinvest.com</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Portal Authentication Card */}
        <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl">
          
          {/* Pathway Selector: Client vs Staff Portal */}
          <div className="flex p-1 bg-slate-100 rounded-2xl mb-6">
            <button
              onClick={() => { setAuthMode('CLIENT'); setErrorMsg(''); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition ${
                authMode === 'CLIENT'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Client / Customer Portal
            </button>
            <button
              onClick={() => { setAuthMode('STAFF'); setErrorMsg(''); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition ${
                authMode === 'STAFF'
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Company Staff Portal
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* PATHWAY 1: CLIENT PORTAL */}
          {authMode === 'CLIENT' && (
            <div>
              {/* Sign In vs Sign Up Tabs */}
              <div className="flex border-b border-slate-200 pb-2 mb-5 gap-4">
                <button
                  onClick={() => { setClientTab('SIGNIN'); setErrorMsg(''); }}
                  className={`text-xs font-bold pb-2 transition border-b-2 -mb-2.5 ${
                    clientTab === 'SIGNIN'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Client Sign In
                </button>
                <button
                  onClick={() => { setClientTab('SIGNUP'); setErrorMsg(''); }}
                  className={`text-xs font-bold pb-2 transition border-b-2 -mb-2.5 ${
                    clientTab === 'SIGNUP'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Create New Account (Sign Up)
                </button>
              </div>

              {clientTab === 'SIGNIN' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. customer@ableinvest.com"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2"
                  >
                    {loading ? 'Authenticating...' : 'Sign In to Client Portal'} <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                /* CLIENT REGISTRATION FORM */
                <form onSubmit={handleRegisterSubmit} className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Full Legal Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Babatunde Adebayo"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Email Address</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@email.com"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+234..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">BVN or NIN</label>
                      <input
                        type="text"
                        value={bvnNin}
                        onChange={(e) => setBvnNin(e.target.value)}
                        placeholder="22114455..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Next of Kin</label>
                      <input
                        type="text"
                        value={nextOfKin}
                        onChange={(e) => setNextOfKin(e.target.value)}
                        placeholder="Full Name & Relation"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Residential Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Street, City, State"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Settlement Bank</label>
                      <input
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="Bank Name"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Account Number</label>
                      <input
                        type="text"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="10-digit number"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 mt-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2"
                  >
                    {loading ? 'Creating Account in Google Sheet...' : 'Register & Enter Client Portal'} <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* PATHWAY 2: COMPANY STAFF PORTAL */}
          {authMode === 'STAFF' && (
            <div className="space-y-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Authorized Personnel</span>
                <h3 className="text-base font-extrabold text-slate-900">Company Administration Login</h3>
                <p className="text-xs text-slate-500 mt-0.5">Access loan underwriting, ledger auditing, and executive controls.</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company Staff Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@ableinvest.com"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-navy-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Security Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-navy-900"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-navy-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                >
                  {loading ? 'Authenticating Staff...' : 'Sign In to Management Suite'} <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500">
                Staff accounts are verified directly against the <span className="font-semibold text-slate-700">Users</span> table in your Google Sheet.
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
