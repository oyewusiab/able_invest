import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, localStore } from '../services/api';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export function DataProvider({ children }) {
  const { currentUser, isCompanyStaff } = useAuth();

  // Instant local-first initialization (0ms initial render)
  const [schemes, setSchemes] = useState(() => localStore.get('able_schemes') || []);
  const [savings, setSavings] = useState(() => {
    const all = localStore.get('able_savings') || [];
    return isCompanyStaff || !currentUser ? all : all.filter(s => s.user_id === currentUser.id);
  });
  const [investments, setInvestments] = useState(() => {
    const all = localStore.get('able_investments') || [];
    return isCompanyStaff || !currentUser ? all : all.filter(i => i.user_id === currentUser.id);
  });
  const [loans, setLoans] = useState(() => {
    const all = localStore.get('able_loans') || [];
    return isCompanyStaff || !currentUser ? all : all.filter(l => l.user_id === currentUser.id);
  });
  const [ledger, setLedger] = useState(() => {
    const all = localStore.get('able_ledger') || [];
    return isCompanyStaff || !currentUser ? all : all.filter(t => t.user_id === currentUser.id);
  });

  const [adminMetrics, setAdminMetrics] = useState({
    totalCustomers: 3,
    totalCustomerSavings: 970000,
    totalActiveInvestments: 750000,
    totalActiveLoansDisbursed: 650000,
    totalLoanRepaid: 100000,
    totalLoanOutstanding: 644500,
    pendingLoansCount: 1,
    pendingTxnsCount: 0,
    pendingKycCount: 0,
    liquidityReserve: 1170000
  });

  const [customerMetrics, setCustomerMetrics] = useState({
    totalSavings: 970000,
    totalInvestments: 750000,
    totalOutstandingLoan: 100000,
    netWorth: 1620000
  });

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const notify = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Immediate synchronous refresh from local store
  const refreshLocalState = useCallback(() => {
    const allSchemes = localStore.get('able_schemes');
    const allSavings = localStore.get('able_savings');
    const allInvestments = localStore.get('able_investments');
    const allLoans = localStore.get('able_loans');
    const allLedger = localStore.get('able_ledger');

    setSchemes(allSchemes);

    if (isCompanyStaff) {
      setSavings(allSavings);
      setInvestments(allInvestments);
      setLoans(allLoans);
      setLedger(allLedger.slice().reverse());

      const totalSav = allSavings.reduce((a, s) => a + (Number(s.current_balance) || 0), 0);
      const totalInv = allInvestments.filter(i => i.status === 'ACTIVE').reduce((a, i) => a + (Number(i.principal_amount) || 0), 0);
      const totalDisb = allLoans.filter(l => l.status === 'ACTIVE').reduce((a, l) => a + (Number(l.principal_amount) || 0), 0);
      const totalRepaid = allLoans.reduce((a, l) => a + (Number(l.amount_repaid) || 0), 0);
      const totalOut = allLoans.filter(l => l.status === 'ACTIVE').reduce((a, l) => a + (Number(l.amount_outstanding) || 0), 0);
      const pendingLoans = allLoans.filter(l => l.status === 'PENDING' || l.status === 'UNDER_REVIEW');

      setAdminMetrics({
        totalCustomers: localStore.get('able_users').filter(u => u.role === 'CUSTOMER').length,
        totalCustomerSavings: totalSav,
        totalActiveInvestments: totalInv,
        totalActiveLoansDisbursed: totalDisb,
        totalLoanRepaid,
        totalLoanOutstanding: totalOut,
        pendingLoansCount: pendingLoans.length,
        pendingTxnsCount: allLedger.filter(t => t.status === 'PENDING').length,
        pendingKycCount: 0,
        liquidityReserve: (totalSav + totalInv + totalRepaid) - totalDisb
      });
    } else if (currentUser) {
      const uSavings = allSavings.filter(s => s.user_id === currentUser.id);
      const uInvs = allInvestments.filter(i => i.user_id === currentUser.id);
      const uLoans = allLoans.filter(l => l.user_id === currentUser.id);
      const uLedger = allLedger.filter(t => t.user_id === currentUser.id);

      setSavings(uSavings);
      setInvestments(uInvs);
      setLoans(uLoans);
      setLedger(uLedger.slice().reverse());

      const totSav = uSavings.reduce((a, s) => a + (Number(s.current_balance) || 0), 0);
      const totInv = uInvs.filter(i => i.status === 'ACTIVE').reduce((a, i) => a + (Number(i.principal_amount) || 0), 0);
      const totOut = uLoans.filter(l => l.status === 'ACTIVE').reduce((a, l) => a + (Number(l.amount_outstanding) || 0), 0);

      setCustomerMetrics({
        totalSavings: totSav,
        totalInvestments: totInv,
        totalOutstandingLoan: totOut,
        netWorth: (totSav + totInv) - totOut
      });
    }
  }, [currentUser, isCompanyStaff]);

  // Parallel asynchronous background synchronization
  const loadData = useCallback(async () => {
    refreshLocalState();

    try {
      if (isCompanyStaff) {
        // Parallel fetch without sequential blocking
        const [schemesRes, metricsRes, loansRes, invsRes, savsRes, ledgerRes] = await Promise.allSettled([
          api.getSchemes('ALL'),
          api.getAdminDashboardMetrics(),
          api.getLoans(),
          api.getInvestments(),
          api.getSavingsAccounts(),
          api.getLedger()
        ]);

        if (schemesRes.status === 'fulfilled' && schemesRes.value?.data?.schemes) {
          setSchemes(schemesRes.value.data.schemes);
        }
        if (metricsRes.status === 'fulfilled' && metricsRes.value?.data?.metrics) {
          setAdminMetrics(metricsRes.value.data.metrics);
        }
        if (loansRes.status === 'fulfilled' && loansRes.value?.data?.loans) {
          setLoans(loansRes.value.data.loans);
        }
        if (invsRes.status === 'fulfilled' && invsRes.value?.data?.investments) {
          setInvestments(invsRes.value.data.investments);
        }
        if (savsRes.status === 'fulfilled' && savsRes.value?.data?.savings) {
          setSavings(savsRes.value.data.savings);
        }
        if (ledgerRes.status === 'fulfilled' && ledgerRes.value?.data?.transactions) {
          setLedger(ledgerRes.value.data.transactions);
        }
      } else if (currentUser) {
        const [schemesRes, custRes] = await Promise.allSettled([
          api.getSchemes('ALL'),
          api.getCustomerOverview(currentUser.id)
        ]);

        if (schemesRes.status === 'fulfilled' && schemesRes.value?.data?.schemes) {
          setSchemes(schemesRes.value.data.schemes);
        }
        if (custRes.status === 'fulfilled' && custRes.value?.data) {
          if (custRes.value.data.metrics) setCustomerMetrics(custRes.value.data.metrics);
          if (custRes.value.data.savings) setSavings(custRes.value.data.savings);
          if (custRes.value.data.investments) setInvestments(custRes.value.data.investments);
          if (custRes.value.data.loans) setLoans(custRes.value.data.loans);
          if (custRes.value.data.recentTransactions) setLedger(custRes.value.data.recentTransactions);
        }
      }
    } catch (err) {
      console.warn('Background sync note:', err.message);
    }
  }, [currentUser, isCompanyStaff, refreshLocalState]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // INSTANT OPTIMISTIC ACTIONS (0ms delay!)
  const applyForLoan = async (loanData) => {
    const res = await api.submitLoanApplication({
      ...loanData,
      user_id: currentUser.id,
      user_name: currentUser.full_name
    });
    refreshLocalState();
    notify('Loan application submitted for credit review!', 'success');
    return { success: true, loan: res.data?.loan };
  };

  const reviewLoan = async (loanId, action, reason = '') => {
    const res = await api.reviewLoanApplication({
      loan_id: loanId,
      review_action: action,
      reason,
      officer_id: currentUser.id,
      officer_name: currentUser.full_name
    });
    refreshLocalState();
    notify(`Loan ${action.toLowerCase()}ed successfully!`, 'success');
    return { success: true };
  };

  const repayLoan = async (loanId, amount, method = 'BANK_TRANSFER') => {
    const res = await api.submitLoanRepayment({
      loan_id: loanId,
      amount,
      payment_method: method,
      user_name: currentUser.full_name
    });
    refreshLocalState();
    notify(`Repayment of ₦${Number(amount).toLocaleString()} confirmed!`, 'success');
    return { success: true };
  };

  const createInvestment = async (invData) => {
    const res = await api.createInvestment({
      ...invData,
      user_id: currentUser.id,
      user_name: currentUser.full_name
    });
    refreshLocalState();
    notify('Investment successfully activated!', 'success');
    return { success: true, investment: res.data?.investment };
  };

  const createSavingsPlan = async (savingsData) => {
    const res = await api.createSavingsPlan({
      ...savingsData,
      user_id: currentUser.id,
      user_name: currentUser.full_name
    });
    refreshLocalState();
    notify('Savings plan successfully initiated!', 'success');
    return { success: true, savings: res.data?.savings };
  };

  const depositToSavings = async (savingsId, amount, method = 'BANK_TRANSFER') => {
    const res = await api.depositFunds({
      savings_id: savingsId,
      amount,
      payment_method: method,
      user_name: currentUser.full_name
    });
    refreshLocalState();
    notify(`Deposit of ₦${Number(amount).toLocaleString()} credited to ledger!`, 'success');
    return { success: true };
  };

  const withdrawFromSavings = async (savingsId, amount) => {
    const res = await api.requestWithdrawal({
      savings_id: savingsId,
      amount,
      user_name: currentUser.full_name
    });
    refreshLocalState();
    if (res.data?.status === 'success') {
      notify(`Withdrawal of ₦${Number(amount).toLocaleString()} processed successfully!`, 'success');
      return { success: true };
    }
    return { success: false, message: res.data?.message || 'Withdrawal rejected' };
  };

  const createScheme = async (schemeData) => {
    const res = await api.createScheme(schemeData);
    refreshLocalState();
    notify('New financial scheme successfully added to catalog!', 'success');
    return { success: true };
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
      refreshLocalState,
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
