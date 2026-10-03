import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';

// Layout Components
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import MobileNav from './components/layout/MobileNav';

// Customer Components
import CustomerDashboard from './components/customer/CustomerDashboard';
import SavingsPortal from './components/customer/SavingsPortal';
import InvestmentPortal from './components/customer/InvestmentPortal';
import LoanPortal from './components/customer/LoanPortal';
import TransactionHistory from './components/customer/TransactionHistory';
import ProfileKYC from './components/customer/ProfileKYC';

// Company / Admin Components
import AdminDashboard from './components/admin/AdminDashboard';
import LoanReviewDesk from './components/admin/LoanReviewDesk';
import InvestmentManager from './components/admin/InvestmentManager';
import SavingsManager from './components/admin/SavingsManager';
import LedgerReconciliation from './components/admin/LedgerReconciliation';
import SchemesManager from './components/admin/SchemesManager';
import UserRegistry from './components/admin/UserRegistry';

// Common
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

function AppContent() {
  const { isCompanyStaff } = useAuth();
  const { notification } = useData();

  const [adminTab, setAdminTab] = useState('overview');
  const [customerTab, setCustomerTab] = useState('overview');

  // Customer quick modals triggered from dashboard
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isApplyLoanOpen, setIsApplyLoanOpen] = useState(false);
  const [isInvestOpen, setIsInvestOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* Top Navbar */}
      <Navbar 
        activeTab={isCompanyStaff ? adminTab : customerTab} 
        setActiveTab={isCompanyStaff ? setAdminTab : setCustomerTab} 
      />

      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top duration-300">
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold ${
            notification.type === 'error' 
              ? 'bg-rose-50 text-rose-800 border-rose-200' 
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}>
            {notification.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main View Container */}
      <div className="flex-1 flex overflow-hidden">
        {isCompanyStaff ? (
          /* COMPANY / ADMIN SUITE */
          <>
            <Sidebar activeTab={adminTab} setActiveTab={setAdminTab} />
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
              {adminTab === 'overview' && <AdminDashboard setActiveTab={setAdminTab} />}
              {adminTab === 'loans' && <LoanReviewDesk />}
              {adminTab === 'investments' && <InvestmentManager />}
              {adminTab === 'savings' && <SavingsManager />}
              {adminTab === 'ledger' && <LedgerReconciliation />}
              {adminTab === 'schemes' && <SchemesManager />}
              {adminTab === 'users' && <UserRegistry />}
            </main>
          </>
        ) : (
          /* CUSTOMER PWA PLATFORM */
          <>
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-5xl mx-auto w-full">
              {/* Desktop Sub-navigation for Customer */}
              <div className="hidden md:flex items-center gap-2 mb-6 border-b border-slate-200 pb-3">
                {[
                  { id: 'overview', label: 'My Dashboard' },
                  { id: 'savings', label: 'Savings Schemes' },
                  { id: 'investments', label: 'Investments' },
                  { id: 'loans', label: 'Loans & Amortization' },
                  { id: 'statement', label: 'Ledger Statement' },
                  { id: 'profile', label: 'KYC Profile' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setCustomerTab(t.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                      customerTab === t.id
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-200/60'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {customerTab === 'overview' && (
                <CustomerDashboard
                  setActiveTab={setCustomerTab}
                  onOpenDeposit={() => {
                    setCustomerTab('savings');
                    setIsDepositOpen(true);
                  }}
                  onOpenApplyLoan={() => {
                    setCustomerTab('loans');
                    setIsApplyLoanOpen(true);
                  }}
                  onOpenInvest={() => {
                    setCustomerTab('investments');
                    setIsInvestOpen(true);
                  }}
                />
              )}
              {customerTab === 'savings' && (
                <SavingsPortal
                  isDepositOpen={isDepositOpen}
                  setIsDepositOpen={setIsDepositOpen}
                />
              )}
              {customerTab === 'investments' && (
                <InvestmentPortal
                  isInvestOpen={isInvestOpen}
                  setIsInvestOpen={setIsInvestOpen}
                />
              )}
              {customerTab === 'loans' && (
                <LoanPortal
                  isApplyOpen={isApplyLoanOpen}
                  setIsApplyOpen={setIsApplyLoanOpen}
                />
              )}
              {customerTab === 'statement' && <TransactionHistory />}
              {customerTab === 'profile' && <ProfileKYC />}
            </main>

            {/* Mobile Bottom PWA Nav */}
            <div className="md:hidden">
              <MobileNav activeTab={customerTab} setActiveTab={setCustomerTab} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}
