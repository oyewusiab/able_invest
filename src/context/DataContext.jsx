import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export function DataProvider({ children }) {
  const { currentUser, isCompanyStaff } = useAuth();

  const [schemes, setSchemes] = useState([]);
  const [savings, setSavings] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [loans, setLoans] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [adminMetrics, setAdminMetrics] = useState({
    totalCustomers: 0,
    totalCustomerSavings: 0,
    totalActiveInvestments: 0,
    totalActiveLoansDisbursed: 0,
    totalLoanRepaid: 0,
    totalLoanOutstanding: 0,
    pendingLoansCount: 0,
    pendingTxnsCount: 0,
    liquidityReserve: 0
  });
  const [customerMetrics, setCustomerMetrics] = useState({
    totalSavings: 0,
    totalInvestments: 0,
    totalOutstandingLoan: 0,
    netWorth: 0
  });

  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const notify = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Schemes
      const schemesRes = await api.getSchemes('ALL');
      if (schemesRes.data?.schemes) {
        setSchemes(schemesRes.data.schemes);
      }

      // 2. Admin or Customer specific datasets
      if (isCompanyStaff) {
        const metricsRes = await api.getAdminDashboardMetrics();
        if (metricsRes.data?.metrics) {
          setAdminMetrics(metricsRes.data.metrics);
        }

        const allLoansRes = await api.getLoans();
        if (allLoansRes.data?.loans) {
          setLoans(allLoansRes.data.loans);
        }

        const allInvsRes = await api.getInvestments();
        if (allInvsRes.data?.investments) {
          setInvestments(allInvsRes.data.investments);
        }

        const allSavingsRes = await api.getSavingsAccounts();
        if (allSavingsRes.data?.savings) {
          setSavings(allSavingsRes.data.savings);
        }

        const allLedgerRes = await api.getLedger();
        if (allLedgerRes.data?.transactions) {
          setLedger(allLedgerRes.data.transactions);
        }
      } else if (currentUser) {
        const custRes = await api.getCustomerOverview(currentUser.id);
        if (custRes.data) {
          setCustomerMetrics(custRes.data.metrics || {
            totalSavings: 0,
            totalInvestments: 0,
            totalOutstandingLoan: 0,
            netWorth: 0
          });
          setSavings(custRes.data.savings || []);
          setInvestments(custRes.data.investments || []);
          setLoans(custRes.data.loans || []);
          setLedger(custRes.data.recentTransactions || []);
        }
      }
    } catch (err) {
      console.error('Data load failed:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser, isCompanyStaff]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Actions
  const applyForLoan = async (loanData) => {
    const res = await api.submitLoanApplication({
      ...loanData,
      user_id: currentUser.id,
      user_name: currentUser.full_name
    });
    if (res.data?.status === 'success') {
      notify('Loan application submitted for credit review!', 'success');
      await loadData();
      return { success: true, loan: res.data.loan };
    }
    notify(res.data?.message || 'Application failed', 'error');
    return { success: false };
  };

  const reviewLoan = async (loanId, action, reason = '') => {
    const res = await api.reviewLoanApplication({
      loan_id: loanId,
      review_action: action,
      reason,
      officer_id: currentUser.id,
      officer_name: currentUser.full_name
    });
    if (res.data?.status === 'success') {
      notify(`Loan ${action.toLowerCase()}ed successfully!`, 'success');
      await loadData();
      return { success: true };
    }
    notify(res.data?.message || 'Action failed', 'error');
    return { success: false };
  };

  const repayLoan = async (loanId, amount, method = 'BANK_TRANSFER') => {
    const res = await api.submitLoanRepayment({
      loan_id: loanId,
      amount,
      payment_method: method,
      user_name: currentUser.full_name
    });
    if (res.data?.status === 'success') {
      notify(`Repayment of ₦${Number(amount).toLocaleString()} confirmed!`, 'success');
      await loadData();
      return { success: true };
    }
    notify(res.data?.message || 'Repayment failed', 'error');
    return { success: false };
  };

  const createInvestment = async (invData) => {
    const res = await api.createInvestment({
      ...invData,
      user_id: currentUser.id,
      user_name: currentUser.full_name
    });
    if (res.data?.status === 'success') {
      notify('Investment successfully activated!', 'success');
      await loadData();
      return { success: true, investment: res.data.investment };
    }
    notify(res.data?.message || 'Investment failed', 'error');
    return { success: false };
  };

  const createSavingsPlan = async (savingsData) => {
    const res = await api.createSavingsPlan({
      ...savingsData,
      user_id: currentUser.id,
      user_name: currentUser.full_name
    });
    if (res.data?.status === 'success') {
      notify('Savings plan successfully initiated!', 'success');
      await loadData();
      return { success: true, savings: res.data.savings };
    }
    notify(res.data?.message || 'Failed to create plan', 'error');
    return { success: false };
  };

  const depositToSavings = async (savingsId, amount, method = 'BANK_TRANSFER') => {
    const res = await api.depositFunds({
      savings_id: savingsId,
      amount,
      payment_method: method,
      user_name: currentUser.full_name
    });
    if (res.data?.status === 'success') {
      notify(`Deposit of ₦${Number(amount).toLocaleString()} credited to ledger!`, 'success');
      await loadData();
      return { success: true };
    }
    notify(res.data?.message || 'Deposit failed', 'error');
    return { success: false };
  };

  const withdrawFromSavings = async (savingsId, amount) => {
    const res = await api.requestWithdrawal({
      savings_id: savingsId,
      amount,
      user_name: currentUser.full_name
    });
    if (res.data?.status === 'success') {
      notify(`Withdrawal of ₦${Number(amount).toLocaleString()} processed successfully!`, 'success');
      await loadData();
      return { success: true };
    }
    notify(res.data?.message || 'Withdrawal failed', 'error');
    return { success: false };
  };

  const createScheme = async (schemeData) => {
    const res = await api.createScheme(schemeData);
    if (res.data?.status === 'success') {
      notify('New financial scheme successfully added to catalog!', 'success');
      await loadData();
      return { success: true };
    }
    notify(res.data?.message || 'Failed to create scheme', 'error');
    return { success: false };
  };

  return (
    <DataContext.Provider value={{
      schemes,
      savings,
      investments,
      loans,
      ledger,
      adminMetrics,
      customerMetrics,
      loading,
      notification,
      notify,
      loadData,
      applyForLoan,
      reviewLoan,
      repayLoan,
      createInvestment,
      createSavingsPlan,
      depositToSavings,
      withdrawFromSavings,
      createScheme
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
