import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { api, localStore } from '../services/api';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export function DataProvider({ children }) {
  const { currentUser, isCompanyStaff } = useAuth();

  // Instant local-first initialization (0ms initial render)
  const [rawSchemes, setRawSchemes] = useState(() => localStore.get('able_schemes') || []);
  const [rawUsers, setRawUsers] = useState(() => localStore.get('able_users') || []);
  const [rawSavings, setRawSavings] = useState(() => {
    const all = localStore.get('able_savings') || [];
    return isCompanyStaff || !currentUser ? all : all.filter(s => s.user_id === currentUser.id);
  });
  const [rawInvestments, setRawInvestments] = useState(() => {
    const all = localStore.get('able_investments') || [];
    return isCompanyStaff || !currentUser ? all : all.filter(i => i.user_id === currentUser.id);
  });
  const [rawLoans, setRawLoans] = useState(() => {
    const all = localStore.get('able_loans') || [];
    return isCompanyStaff || !currentUser ? all : all.filter(l => l.user_id === currentUser.id);
  });
  const [rawLedger, setRawLedger] = useState(() => {
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

  // Cross-entity enrichment: guarantees scheme_name and user_name are always properly populated
  const users = rawUsers;
  const schemes = rawSchemes;

  const userMap = useMemo(() => {
    const map = new Map();
    (rawUsers || []).forEach(u => map.set(u.id, u));
    return map;
  }, [rawUsers]);

  const schemeMap = useMemo(() => {
    const map = new Map();
    (rawSchemes || []).forEach(s => map.set(s.id, s));
    return map;
  }, [rawSchemes]);

  const loans = useMemo(() => {
    return (rawLoans || []).map(l => {
      const u = userMap.get(l.user_id);
      const s = schemeMap.get(l.scheme_id);
      return {
        ...l,
        scheme_name: l.scheme_name || (s ? s.name : 'Credit Scheme'),
        user_name: l.user_name || (u ? u.full_name : 'Registered Client')
      };
    });
  }, [rawLoans, userMap, schemeMap]);

  const savings = useMemo(() => {
    return (rawSavings || []).map(s => {
      const u = userMap.get(s.user_id);
      const sch = schemeMap.get(s.scheme_id);
      return {
        ...s,
        scheme_name: s.scheme_name || (sch ? sch.name : 'Savings Scheme'),
        user_name: s.user_name || (u ? u.full_name : 'Customer Account')
      };
    });
  }, [rawSavings, userMap, schemeMap]);

  const investments = useMemo(() => {
    return (rawInvestments || []).map(i => {
      const u = userMap.get(i.user_id);
      const s = schemeMap.get(i.scheme_id);
      return {
        ...i,
        scheme_name: i.scheme_name || (s ? s.name : 'Investment Note'),
        user_name: i.user_name || (u ? u.full_name : 'Portfolio Investor')
      };
    });
  }, [rawInvestments, userMap, schemeMap]);

  const ledger = useMemo(() => {
    return (rawLedger || []).map(t => {
      const u = userMap.get(t.user_id);
      return {
        ...t,
        user_name: t.user_name || (u ? u.full_name : 'Customer')
      };
    });
  }, [rawLedger, userMap]);

  // Recalculate metrics from local state
  const refreshLocalState = useCallback(() => {
    const allSchemes = localStore.get('able_schemes') || [];
    const allUsers = localStore.get('able_users') || [];
    const allSavings = localStore.get('able_savings') || [];
    const allInvestments = localStore.get('able_investments') || [];
    const allLoans = localStore.get('able_loans') || [];
    const allLedger = localStore.get('able_ledger') || [];

    setRawSchemes(allSchemes);
    setRawUsers(allUsers);

    if (isCompanyStaff) {
      setRawSavings(allSavings);
      setRawInvestments(allInvestments);
      setRawLoans(allLoans);
      setRawLedger(allLedger.slice().reverse());

      const totalSav = allSavings.reduce((a, s) => a + (Number(s.current_balance) || 0), 0);
      const totalInv = allInvestments.filter(i => i.status === 'ACTIVE').reduce((a, i) => a + (Number(i.principal_amount) || 0), 0);
      const totalDisb = allLoans.filter(l => l.status === 'ACTIVE').reduce((a, l) => a + (Number(l.principal_amount) || 0), 0);
      const totalRepaid = allLoans.reduce((a, l) => a + (Number(l.amount_repaid) || 0), 0);
      const totalOut = allLoans.filter(l => l.status === 'ACTIVE').reduce((a, l) => a + (Number(l.amount_outstanding) || 0), 0);
      const pendingLoans = allLoans.filter(l => l.status === 'PENDING' || l.status === 'UNDER_REVIEW');

      setAdminMetrics({
        totalCustomers: allUsers.filter(u => u.role === 'CUSTOMER').length || 1,
        totalCustomerSavings: totalSav,
        totalActiveInvestments: totalInv,
        totalActiveLoansDisbursed: totalDisb,
        totalLoanRepaid,
        totalLoanOutstanding: totalOut,
        pendingLoansCount: pendingLoans.length,
        pendingTxnsCount: allLedger.filter(t => t.status === 'PENDING').length,
        pendingKycCount: allUsers.filter(u => u.kyc_status === 'PENDING').length,
        liquidityReserve: (totalSav + totalInv + totalRepaid) - totalDisb
      });
    } else if (currentUser) {
      const uSavings = allSavings.filter(s => s.user_id === currentUser.id);
      const uInvs = allInvestments.filter(i => i.user_id === currentUser.id);
      const uLoans = allLoans.filter(l => l.user_id === currentUser.id);
      const uLedger = allLedger.filter(t => t.user_id === currentUser.id);

      setRawSavings(uSavings);
      setRawInvestments(uInvs);
      setRawLoans(uLoans);
      setRawLedger(uLedger.slice().reverse());

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

  // Robust Synchronization Engine:
  // Tries consolidated getCompanyData first; falls back to throttled sequential queries
  // to avoid Google Apps Script concurrency rate limits (404 HTML errors).
  const loadData = useCallback(async () => {
    setLoading(true);
    refreshLocalState();

    try {
      if (isCompanyStaff) {
        // Attempt 1: Consolidated single roundtrip (fastest & cleanest)
        const companyRes = await api.getCompanyData();
        if (companyRes?.data && companyRes.data.status === 'success' && companyRes.data.loans) {
          const d = companyRes.data;
          if (d.schemes) {
            setRawSchemes(d.schemes);
            localStore.set('able_schemes', d.schemes);
          }
          if (d.loans) {
            setRawLoans(d.loans);
            localStore.set('able_loans', d.loans);
          }
          if (d.savings) {
            setRawSavings(d.savings);
            localStore.set('able_savings', d.savings);
          }
          if (d.investments) {
            setRawInvestments(d.investments);
            localStore.set('able_investments', d.investments);
          }
          if (d.ledger) {
            setRawLedger(d.ledger);
            localStore.set('able_ledger', d.ledger);
          }
          if (d.users) {
            setRawUsers(d.users);
            localStore.set('able_users', d.users);
          }
          if (d.metrics) {
            setAdminMetrics(d.metrics);
          }
        } else {
          // Attempt 2: Sequential fetch (1-by-1) to avoid Google Apps Script concurrency throttling
          const schemesRes = await api.getSchemes('ALL');
          if (schemesRes?.data?.schemes) {
            setRawSchemes(schemesRes.data.schemes);
            localStore.set('able_schemes', schemesRes.data.schemes);
          }

          const loansRes = await api.getLoans();
          if (loansRes?.data?.loans) {
            setRawLoans(loansRes.data.loans);
            localStore.set('able_loans', loansRes.data.loans);
          }

          const savsRes = await api.getSavingsAccounts();
          if (savsRes?.data?.savings) {
            setRawSavings(savsRes.data.savings);
            localStore.set('able_savings', savsRes.data.savings);
          }

          const invsRes = await api.getInvestments();
          if (invsRes?.data?.investments) {
            setRawInvestments(invsRes.data.investments);
            localStore.set('able_investments', invsRes.data.investments);
          }

          const ledgerRes = await api.getLedger();
          if (ledgerRes?.data?.transactions) {
            setRawLedger(ledgerRes.data.transactions);
            localStore.set('able_ledger', ledgerRes.data.transactions);
          }

          const usersRes = await api.getUsers();
          if (usersRes?.data?.users) {
            setRawUsers(usersRes.data.users);
            localStore.set('able_users', usersRes.data.users);
          }

          refreshLocalState();
        }
      } else if (currentUser) {
        // Customer queries: Sequential
        const schemesRes = await api.getSchemes('ALL');
        if (schemesRes?.data?.schemes) {
          setRawSchemes(schemesRes.data.schemes);
        }

        const custRes = await api.getCustomerOverview(currentUser.id);
        if (custRes?.data) {
          if (custRes.data.metrics) setCustomerMetrics(custRes.data.metrics);
          if (custRes.data.savings) setRawSavings(custRes.data.savings);
          if (custRes.data.investments) setRawInvestments(custRes.data.investments);
          if (custRes.data.loans) setRawLoans(custRes.data.loans);
          if (custRes.data.recentTransactions) setRawLedger(custRes.data.recentTransactions);
        }
      }
    } catch (err) {
      console.warn('Sync note:', err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser, isCompanyStaff, refreshLocalState]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // MUTATION HANDLERS (Optimistic local + background cloud commit + automatic reload)
  const applyForLoan = async (loanData) => {
    const res = await api.submitLoanApplication({
      ...loanData,
      user_id: currentUser.id,
      user_name: currentUser.full_name
    });
    refreshLocalState();
    notify('Loan application submitted for credit review!', 'success');
    // Reload live data in background after submission
    setTimeout(() => loadData(), 2000);
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
    setTimeout(() => loadData(), 2000);
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
    setTimeout(() => loadData(), 2000);
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
    setTimeout(() => loadData(), 2000);
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
    setTimeout(() => loadData(), 2000);
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
    setTimeout(() => loadData(), 2000);
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
      setTimeout(() => loadData(), 2000);
      return { success: true };
    }
    return { success: false, message: res.data?.message || 'Withdrawal rejected' };
  };

  const createScheme = async (schemeData) => {
    const res = await api.createScheme(schemeData);
    refreshLocalState();
    notify('New financial scheme successfully added to catalog!', 'success');
    setTimeout(() => loadData(), 2000);
    return { success: true };
  };

  const verifyKyc = async (userId) => {
    await api.updateKyc({
      user_id: userId,
      kyc_status: 'VERIFIED',
      officer_id: currentUser?.id,
      officer_name: currentUser?.full_name
    });
    setRawUsers(prev => {
      const updated = prev.map(u => u.id === userId ? { ...u, kyc_status: 'VERIFIED' } : u);
      localStore.set('able_users', updated);
      return updated;
    });
    notify('User identity and KYC verified successfully!', 'success');
    setTimeout(() => loadData(), 2000);
    return { success: true };
  };

  return (
    <DataContext.Provider value={{
      schemes,
      users,
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
      createScheme,
      verifyKyc
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
