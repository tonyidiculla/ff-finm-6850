import { useState, useEffect, useCallback, useMemo } from 'react';
import { useFinanceContext } from '../context/FinanceContext';
import { financeConfig } from '../config/finance';

// Transaction Management Hook
export function useTransactions() {
  const { state, dispatch } = useFinanceContext();
  
  const createTransaction = useCallback(async (transactionData: any) => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'transactions', value: true } });
    
    try {
      const transaction = {
        id: `TXN-${Date.now()}`,
        ...transactionData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        tags: transactionData.tags || [],
        attachments: transactionData.attachments || [],
        metadata: transactionData.metadata || {},
      };
      
      // In real implementation, make API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: {
          id: `notif-${Date.now()}`,
          type: 'success',
          title: 'Transaction Created',
          message: `Transaction ${transaction.id} created successfully`,
          timestamp: new Date().toISOString(),
        }
      });
      
      return transaction;
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { key: 'transactions', value: `Failed to create transaction: ${error}` }
      });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'transactions', value: false } });
    }
  }, [dispatch]);
  
  const updateTransaction = useCallback(async (id: string, updates: any) => {
    try {
      dispatch({ type: 'UPDATE_TRANSACTION', payload: { id, updates } });
      
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: {
          id: `notif-${Date.now()}`,
          type: 'success',
          title: 'Transaction Updated',
          message: `Transaction ${id} updated successfully`,
          timestamp: new Date().toISOString(),
        }
      });
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { key: 'transactions', value: `Failed to update transaction: ${error}` }
      });
    }
  }, [dispatch]);
  
  const deleteTransaction = useCallback(async (id: string) => {
    try {
      dispatch({ type: 'DELETE_TRANSACTION', payload: id });
      
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: {
          id: `notif-${Date.now()}`,
          type: 'success',
          title: 'Transaction Deleted',
          message: `Transaction ${id} deleted successfully`,
          timestamp: new Date().toISOString(),
        }
      });
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { key: 'transactions', value: `Failed to delete transaction: ${error}` }
      });
    }
  }, [dispatch]);
  
  const approveTransaction = useCallback(async (id: string, approverId: string) => {
    try {
      await updateTransaction(id, { 
        status: 'approved', 
        approvedBy: approverId,
        approvedAt: new Date().toISOString()
      });
    } catch (error) {
      throw error;
    }
  }, [updateTransaction]);
  
  const filteredTransactions = useMemo(() => {
    let filtered = state.transactions;
    const filters = state.transactionFilters;
    
    if (filters.dateRange) {
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.date);
        const startDate = new Date(filters.dateRange!.start);
        const endDate = new Date(filters.dateRange!.end);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    }
    
    if (filters.types && filters.types.length > 0) {
      filtered = filtered.filter(t => filters.types!.includes(t.type));
    }
    
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(t => filters.status!.includes(t.status));
    }
    
    if (filters.minAmount !== undefined) {
      filtered = filtered.filter(t => t.amount >= filters.minAmount!);
    }
    
    if (filters.maxAmount !== undefined) {
      filtered = filtered.filter(t => t.amount <= filters.maxAmount!);
    }
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchTerm) ||
        t.reference?.toLowerCase().includes(searchTerm) ||
        t.id.toLowerCase().includes(searchTerm)
      );
    }
    
    return filtered;
  }, [state.transactions, state.transactionFilters]);
  
  return {
    transactions: filteredTransactions,
    selectedTransaction: state.selectedTransaction,
    loading: state.loading.transactions,
    error: state.errors.transactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    approveTransaction,
    selectTransaction: (transaction: any) => 
      dispatch({ type: 'SELECT_TRANSACTION', payload: transaction }),
    setFilters: (filters: any) => 
      dispatch({ type: 'SET_TRANSACTION_FILTERS', payload: filters }),
  };
}

// Account Management Hook
export function useAccounts() {
  const { state, dispatch } = useFinanceContext();
  
  const createAccount = useCallback(async (accountData: any) => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'accounts', value: true } });
    
    try {
      const account = {
        id: `ACC-${Date.now()}`,
        ...accountData,
        balance: accountData.balance || 0,
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      dispatch({ type: 'ADD_ACCOUNT', payload: account });
      return account;
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { key: 'accounts', value: `Failed to create account: ${error}` }
      });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'accounts', value: false } });
    }
  }, [dispatch]);
  
  const updateAccountBalance = useCallback(async (accountId: string, amount: number, type: 'debit' | 'credit') => {
    const account = state.accounts.find(a => a.id === accountId);
    if (!account) throw new Error('Account not found');
    
    const newBalance = type === 'credit' 
      ? account.balance + amount 
      : account.balance - amount;
    
    dispatch({ 
      type: 'UPDATE_ACCOUNT', 
      payload: { id: accountId, updates: { balance: newBalance } }
    });
  }, [state.accounts, dispatch]);
  
  const accountsByType = useMemo(() => {
    const grouped: { [key: string]: any[] } = {};
    
    state.accounts.forEach(account => {
      if (!grouped[account.type]) {
        grouped[account.type] = [];
      }
      grouped[account.type].push(account);
    });
    
    return grouped;
  }, [state.accounts]);
  
  return {
    accounts: state.accounts,
    accountsByType,
    loading: state.loading.accounts,
    error: state.errors.accounts,
    createAccount,
    updateAccount: (id: string, updates: any) => 
      dispatch({ type: 'UPDATE_ACCOUNT', payload: { id, updates } }),
    updateAccountBalance,
  };
}

// Budget Management Hook
export function useBudgets() {
  const { state, dispatch } = useFinanceContext();
  
  const createBudget = useCallback(async (budgetData: any) => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'budgets', value: true } });
    
    try {
      const budget = {
        id: `BUD-${Date.now()}`,
        ...budgetData,
        totalSpent: 0,
        status: 'draft',
        categories: budgetData.categories || [],
        createdAt: new Date().toISOString(),
      };
      
      await new Promise(resolve => setTimeout(resolve, 400));
      
      dispatch({ type: 'ADD_BUDGET', payload: budget });
      return budget;
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { key: 'budgets', value: `Failed to create budget: ${error}` }
      });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'budgets', value: false } });
    }
  }, [dispatch]);
  
  const calculateBudgetVariance = useCallback((budget: any) => {
    return budget.categories.map((category: any) => ({
      ...category,
      variance: category.allocated - category.spent,
      utilizationRate: category.allocated > 0 ? (category.spent / category.allocated) * 100 : 0,
    }));
  }, []);
  
  const budgetSummary = useMemo(() => {
    const totalAllocated = state.budgets.reduce((sum, b) => sum + b.totalAllocated, 0);
    const totalSpent = state.budgets.reduce((sum, b) => sum + b.totalSpent, 0);
    const variance = totalAllocated - totalSpent;
    const utilizationRate = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;
    
    return {
      totalAllocated,
      totalSpent,
      variance,
      utilizationRate,
      budgetCount: state.budgets.length,
    };
  }, [state.budgets]);
  
  return {
    budgets: state.budgets,
    selectedBudget: state.selectedBudget,
    budgetSummary,
    loading: state.loading.budgets,
    error: state.errors.budgets,
    createBudget,
    updateBudget: (id: string, updates: any) => 
      dispatch({ type: 'UPDATE_BUDGET', payload: { id, updates } }),
    selectBudget: (budget: any) => 
      dispatch({ type: 'SELECT_BUDGET', payload: budget }),
    calculateBudgetVariance,
  };
}

// Invoice Management Hook
export function useInvoices() {
  const { state, dispatch } = useFinanceContext();
  
  const createInvoice = useCallback(async (invoiceData: any) => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'invoices', value: true } });
    
    try {
      const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`;
      const invoice = {
        id: `INV-${Date.now()}`,
        invoiceNumber,
        ...invoiceData,
        status: 'draft',
        lineItems: invoiceData.lineItems || [],
        paymentHistory: [],
        createdAt: new Date().toISOString(),
      };
      
      // Calculate totals
      const subtotal = invoice.lineItems.reduce((sum: number, item: any) => sum + item.total, 0);
      const tax = subtotal * (financeConfig.compliance.taxSettings.vatRate || 0);
      invoice.amount = subtotal;
      invoice.tax = tax;
      invoice.totalAmount = subtotal + tax;
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      dispatch({ type: 'ADD_INVOICE', payload: invoice });
      return invoice;
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { key: 'invoices', value: `Failed to create invoice: ${error}` }
      });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'invoices', value: false } });
    }
  }, [dispatch]);
  
  const sendInvoice = useCallback(async (invoiceId: string) => {
    dispatch({ 
      type: 'UPDATE_INVOICE', 
      payload: { 
        id: invoiceId, 
        updates: { 
          status: 'sent' as const
        } 
      } 
    });
    
    dispatch({ 
      type: 'ADD_NOTIFICATION', 
      payload: {
        id: `notif-${Date.now()}`,
        type: 'success',
        title: 'Invoice Sent',
        message: `Invoice ${invoiceId} sent successfully`,
        timestamp: new Date().toISOString(),
      }
    });
  }, [dispatch]);
  
  const markInvoiceAsPaid = useCallback(async (invoiceId: string, paymentData: any) => {
    dispatch({ 
      type: 'UPDATE_INVOICE', 
      payload: { 
        id: invoiceId, 
        updates: { 
          status: 'paid',
          paymentHistory: [...(state.invoices.find(i => i.id === invoiceId)?.paymentHistory || []), paymentData]
        } 
      } 
    });
  }, [dispatch, state.invoices]);
  
  const invoiceMetrics = useMemo(() => {
    const totalInvoiced = state.invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalPaid = state.invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalOverdue = state.invoices
      .filter(inv => inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
    
    return {
      totalInvoiced,
      totalPaid,
      totalOverdue,
      totalOutstanding: totalInvoiced - totalPaid,
      invoiceCount: state.invoices.length,
      paidCount: state.invoices.filter(inv => inv.status === 'paid').length,
      overdueCount: state.invoices.filter(inv => inv.status === 'overdue').length,
    };
  }, [state.invoices]);
  
  return {
    invoices: state.invoices,
    selectedInvoice: state.selectedInvoice,
    invoiceMetrics,
    loading: state.loading.invoices,
    error: state.errors.invoices,
    createInvoice,
    updateInvoice: (id: string, updates: any) => 
      dispatch({ type: 'UPDATE_INVOICE', payload: { id, updates } }),
    sendInvoice,
    markInvoiceAsPaid,
    selectInvoice: (invoice: any) => 
      dispatch({ type: 'SELECT_INVOICE', payload: invoice }),
  };
}

// Payment Processing Hook
export function usePayments() {
  const { state, dispatch } = useFinanceContext();
  
  const processPayment = useCallback(async (paymentData: any) => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'payments', value: true } });
    
    try {
      const payment = {
        id: `PAY-${Date.now()}`,
        ...paymentData,
        status: 'processing',
        createdAt: new Date().toISOString(),
        fees: calculateProcessingFees(paymentData.amount, paymentData.method),
      };
      
      dispatch({ type: 'ADD_PAYMENT', payload: payment });
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update payment status
      dispatch({ 
        type: 'UPDATE_PAYMENT', 
        payload: { 
          id: payment.id, 
          updates: { 
            status: 'completed',
            processedAt: new Date().toISOString()
          } 
        } 
      });
      
      return payment;
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { key: 'payments', value: `Failed to process payment: ${error}` }
      });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'payments', value: false } });
    }
  }, [dispatch]);
  
  const refundPayment = useCallback(async (paymentId: string, amount?: number) => {
    const payment = state.payments.find(p => p.id === paymentId);
    if (!payment) throw new Error('Payment not found');
    
    const refundAmount = amount || payment.amount;
    
    dispatch({ 
      type: 'UPDATE_PAYMENT', 
      payload: { 
        id: paymentId, 
        updates: { 
          status: 'refunded' as const
        } 
      } 
    });
  }, [state.payments, dispatch]);
  
  const calculateProcessingFees = (amount: number, method: string) => {
    const paymentMethod = financeConfig.paymentMethods[method as keyof typeof financeConfig.paymentMethods];
    if (!paymentMethod) return 0;
    
    const fee = paymentMethod.processingFee;
    return typeof fee === 'number' && fee < 1 ? amount * fee : fee;
  };
  
  const paymentMetrics = useMemo(() => {
    const totalProcessed = state.payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const totalFees = state.payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.fees, 0);
    
    return {
      totalProcessed,
      totalFees,
      netAmount: totalProcessed - totalFees,
      paymentCount: state.payments.length,
      completedCount: state.payments.filter(p => p.status === 'completed').length,
      failedCount: state.payments.filter(p => p.status === 'failed').length,
    };
  }, [state.payments]);
  
  return {
    payments: state.payments,
    paymentMetrics,
    loading: state.loading.payments,
    error: state.errors.payments,
    processPayment,
    refundPayment,
    calculateProcessingFees,
  };
}

// Financial Reports Hook
export function useReports() {
  const { state, dispatch } = useFinanceContext();
  
  const generateReport = useCallback(async (reportType: string, period: any, parameters?: any) => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'reports', value: true } });
    
    try {
      const report = {
        id: `RPT-${Date.now()}`,
        type: reportType,
        name: `${reportType.replace('_', ' ').toUpperCase()} - ${period.label}`,
        period,
        data: await generateReportData(reportType, period, parameters),
        generatedAt: new Date().toISOString(),
        format: 'pdf' as const,
      };
      
      dispatch({ type: 'ADD_REPORT', payload: report });
      return report;
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { key: 'reports', value: `Failed to generate report: ${error}` }
      });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'reports', value: false } });
    }
  }, [dispatch]);
  
  const generateReportData = async (reportType: string, period: any, parameters?: any) => {
    // Simulate report data generation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    switch (reportType) {
      case 'balance_sheet':
        return generateBalanceSheetData(period);
      case 'income_statement':
        return generateIncomeStatementData(period);
      case 'cash_flow':
        return generateCashFlowData(period);
      default:
        return { message: 'Report data generated', period, parameters };
    }
  };
  
  const generateBalanceSheetData = (period: any) => ({
    assets: {
      current: 150000,
      fixed: 500000,
      total: 650000,
    },
    liabilities: {
      current: 75000,
      longTerm: 200000,
      total: 275000,
    },
    equity: {
      capital: 300000,
      retained: 75000,
      total: 375000,
    },
    period,
  });
  
  const generateIncomeStatementData = (period: any) => ({
    revenue: {
      patientServices: 500000,
      other: 50000,
      total: 550000,
    },
    expenses: {
      personnel: 275000,
      supplies: 110000,
      utilities: 44000,
      other: 66000,
      total: 495000,
    },
    netIncome: 55000,
    period,
  });
  
  const generateCashFlowData = (period: any) => ({
    operating: {
      netIncome: 55000,
      depreciation: 25000,
      workingCapitalChanges: -10000,
      total: 70000,
    },
    investing: {
      equipmentPurchases: -50000,
      total: -50000,
    },
    financing: {
      loanProceeds: 100000,
      loanPayments: -30000,
      total: 70000,
    },
    netCashFlow: 90000,
    period,
  });
  
  return {
    reports: state.reports,
    activeReport: state.activeReport,
    loading: state.loading.reports,
    error: state.errors.reports,
    generateReport,
    setActiveReport: (report: any) => 
      dispatch({ type: 'SET_ACTIVE_REPORT', payload: report }),
  };
}

// Financial Analytics Hook
export function useFinanceAnalytics() {
  const { state } = useFinanceContext();
  
  const getRevenueAnalytics = useMemo(() => {
    const revenueTransactions = state.transactions.filter(t => t.type === 'income');
    const totalRevenue = revenueTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Group by month
    const monthlyRevenue = revenueTransactions.reduce((acc, t) => {
      const month = new Date(t.date).toISOString().slice(0, 7);
      acc[month] = (acc[month] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalRevenue,
      monthlyRevenue,
      averageTransaction: revenueTransactions.length > 0 ? totalRevenue / revenueTransactions.length : 0,
      transactionCount: revenueTransactions.length,
    };
  }, [state.transactions]);
  
  const getExpenseAnalytics = useMemo(() => {
    const expenseTransactions = state.transactions.filter(t => t.type === 'expense');
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Group by category
    const expensesByCategory = expenseTransactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalExpenses,
      expensesByCategory,
      averageExpense: expenseTransactions.length > 0 ? totalExpenses / expenseTransactions.length : 0,
      transactionCount: expenseTransactions.length,
    };
  }, [state.transactions]);
  
  const getProfitability = useMemo(() => {
    const revenue = getRevenueAnalytics.totalRevenue;
    const expenses = getExpenseAnalytics.totalExpenses;
    const profit = revenue - expenses;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    
    return {
      revenue,
      expenses,
      profit,
      margin,
      breakEven: expenses,
    };
  }, [getRevenueAnalytics.totalRevenue, getExpenseAnalytics.totalExpenses]);
  
  return {
    revenueAnalytics: getRevenueAnalytics,
    expenseAnalytics: getExpenseAnalytics,
    profitability: getProfitability,
    invoiceMetrics: {
      totalInvoiced: state.invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
      totalPaid: state.invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.totalAmount, 0),
      outstandingAmount: state.receivables.reduce((sum, rec) => sum + rec.amount, 0),
    },
  };
}

export default {
  useTransactions,
  useAccounts,
  useBudgets,
  useInvoices,
  usePayments,
  useReports,
  useFinanceAnalytics,
};