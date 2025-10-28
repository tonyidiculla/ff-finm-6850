'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { financeConfig } from '../config/finance';

// Finance State Types
interface FinanceState {
  // Financial Transactions
  transactions: Transaction[];
  selectedTransaction: Transaction | null;
  transactionFilters: TransactionFilters;
  
  // Accounts and Budgets
  accounts: Account[];
  budgets: Budget[];
  selectedBudget: Budget | null;
  
  // Invoicing and Billing
  invoices: Invoice[];
  selectedInvoice: Invoice | null;
  billingCycles: BillingCycle[];
  
  // Payments and Receivables
  payments: Payment[];
  receivables: Receivable[];
  payables: Payable[];
  
  // Financial Reports
  reports: FinancialReport[];
  activeReport: FinancialReport | null;
  
  // UI State
  loading: LoadingState;
  errors: ErrorState;
  notifications: Notification[];
}

interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  accountId: string;
  amount: number;
  description: string;
  category: string;
  subcategory?: string;
  reference?: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approvedBy?: string;
  createdBy: string;
  tags: string[];
  attachments: string[];
  metadata: Record<string, any>;
}

interface Account {
  id: string;
  name: string;
  type: string;
  accountNumber: string;
  balance: number;
  currency: string;
  status: 'active' | 'inactive' | 'frozen';
  parentAccount?: string;
  department?: string;
  budgetAllocated?: number;
}

interface Budget {
  id: string;
  name: string;
  fiscalYear: number;
  department?: string;
  totalAllocated: number;
  totalSpent: number;
  categories: BudgetCategory[];
  status: 'draft' | 'approved' | 'active' | 'closed';
  approvedBy?: string;
  createdAt: string;
}

interface BudgetCategory {
  category: string;
  allocated: number;
  spent: number;
  committed: number;
  variance: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId?: string;
  departmentId?: string;
  amount: number;
  tax: number;
  totalAmount: number;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  lineItems: InvoiceLineItem[];
  paymentHistory: PaymentHistory[];
  createdAt: string;
}

interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxable: boolean;
}

interface PaymentHistory {
  id: string;
  amount: number;
  method: string;
  reference?: string;
  processedAt: string;
}

interface Payment {
  id: string;
  invoiceId?: string;
  amount: number;
  method: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  reference?: string;
  processedAt?: string;
  fees: number;
}

interface Receivable {
  id: string;
  customerId: string;
  amount: number;
  dueDate: string;
  status: 'current' | 'overdue' | 'disputed' | 'written_off';
  agingDays: number;
}

interface Payable {
  id: string;
  vendorId: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'approved' | 'paid' | 'overdue';
  approvalStatus?: string;
}

interface BillingCycle {
  id: string;
  name: string;
  frequency: 'monthly' | 'quarterly' | 'annually';
  nextRunDate: string;
  isActive: boolean;
}

interface FinancialReport {
  id: string;
  type: string;
  name: string;
  period: ReportPeriod;
  data: Record<string, any>;
  generatedAt: string;
  format: 'pdf' | 'excel' | 'csv';
}

interface ReportPeriod {
  startDate: string;
  endDate: string;
  label: string;
}

interface TransactionFilters {
  dateRange?: { start: string; end: string };
  accountIds?: string[];
  categories?: string[];
  types?: string[];
  status?: string[];
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

interface LoadingState {
  transactions: boolean;
  accounts: boolean;
  budgets: boolean;
  invoices: boolean;
  payments: boolean;
  reports: boolean;
}

interface ErrorState {
  transactions?: string;
  accounts?: string;
  budgets?: string;
  invoices?: string;
  payments?: string;
  reports?: string;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
}

// Action Types
type FinanceAction =
  // Transaction Actions
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: { id: string; updates: Partial<Transaction> } }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'SELECT_TRANSACTION'; payload: Transaction | null }
  | { type: 'SET_TRANSACTION_FILTERS'; payload: TransactionFilters }
  
  // Account Actions
  | { type: 'SET_ACCOUNTS'; payload: Account[] }
  | { type: 'ADD_ACCOUNT'; payload: Account }
  | { type: 'UPDATE_ACCOUNT'; payload: { id: string; updates: Partial<Account> } }
  | { type: 'DELETE_ACCOUNT'; payload: string }
  
  // Budget Actions
  | { type: 'SET_BUDGETS'; payload: Budget[] }
  | { type: 'ADD_BUDGET'; payload: Budget }
  | { type: 'UPDATE_BUDGET'; payload: { id: string; updates: Partial<Budget> } }
  | { type: 'DELETE_BUDGET'; payload: string }
  | { type: 'SELECT_BUDGET'; payload: Budget | null }
  
  // Invoice Actions
  | { type: 'SET_INVOICES'; payload: Invoice[] }
  | { type: 'ADD_INVOICE'; payload: Invoice }
  | { type: 'UPDATE_INVOICE'; payload: { id: string; updates: Partial<Invoice> } }
  | { type: 'DELETE_INVOICE'; payload: string }
  | { type: 'SELECT_INVOICE'; payload: Invoice | null }
  
  // Payment Actions
  | { type: 'SET_PAYMENTS'; payload: Payment[] }
  | { type: 'ADD_PAYMENT'; payload: Payment }
  | { type: 'UPDATE_PAYMENT'; payload: { id: string; updates: Partial<Payment> } }
  
  // Receivables and Payables
  | { type: 'SET_RECEIVABLES'; payload: Receivable[] }
  | { type: 'SET_PAYABLES'; payload: Payable[] }
  | { type: 'UPDATE_RECEIVABLE'; payload: { id: string; updates: Partial<Receivable> } }
  | { type: 'UPDATE_PAYABLE'; payload: { id: string; updates: Partial<Payable> } }
  
  // Report Actions
  | { type: 'SET_REPORTS'; payload: FinancialReport[] }
  | { type: 'ADD_REPORT'; payload: FinancialReport }
  | { type: 'SET_ACTIVE_REPORT'; payload: FinancialReport | null }
  
  // UI Actions
  | { type: 'SET_LOADING'; payload: { key: keyof LoadingState; value: boolean } }
  | { type: 'SET_ERROR'; payload: { key: keyof ErrorState; value?: string } }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' };

// Initial State
const initialState: FinanceState = {
  transactions: [],
  selectedTransaction: null,
  transactionFilters: {},
  accounts: [],
  budgets: [],
  selectedBudget: null,
  invoices: [],
  selectedInvoice: null,
  billingCycles: [],
  payments: [],
  receivables: [],
  payables: [],
  reports: [],
  activeReport: null,
  loading: {
    transactions: false,
    accounts: false,
    budgets: false,
    invoices: false,
    payments: false,
    reports: false,
  },
  errors: {},
  notifications: [],
};

// Reducer Function
function financeReducer(state: FinanceState, action: FinanceAction): FinanceState {
  switch (action.type) {
    // Transaction Cases
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };
    
    case 'ADD_TRANSACTION':
      return { 
        ...state, 
        transactions: [action.payload, ...state.transactions] 
      };
    
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(transaction =>
          transaction.id === action.payload.id
            ? { ...transaction, ...action.payload.updates }
            : transaction
        ),
      };
    
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(t => t.id !== action.payload),
      };
    
    case 'SELECT_TRANSACTION':
      return { ...state, selectedTransaction: action.payload };
    
    case 'SET_TRANSACTION_FILTERS':
      return { ...state, transactionFilters: action.payload };

    // Account Cases
    case 'SET_ACCOUNTS':
      return { ...state, accounts: action.payload };
    
    case 'ADD_ACCOUNT':
      return { 
        ...state, 
        accounts: [action.payload, ...state.accounts] 
      };
    
    case 'UPDATE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.map(account =>
          account.id === action.payload.id
            ? { ...account, ...action.payload.updates }
            : account
        ),
      };
    
    case 'DELETE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.filter(a => a.id !== action.payload),
      };

    // Budget Cases
    case 'SET_BUDGETS':
      return { ...state, budgets: action.payload };
    
    case 'ADD_BUDGET':
      return { 
        ...state, 
        budgets: [action.payload, ...state.budgets] 
      };
    
    case 'UPDATE_BUDGET':
      return {
        ...state,
        budgets: state.budgets.map(budget =>
          budget.id === action.payload.id
            ? { ...budget, ...action.payload.updates }
            : budget
        ),
      };
    
    case 'SELECT_BUDGET':
      return { ...state, selectedBudget: action.payload };

    // Invoice Cases
    case 'SET_INVOICES':
      return { ...state, invoices: action.payload };
    
    case 'ADD_INVOICE':
      return { 
        ...state, 
        invoices: [action.payload, ...state.invoices] 
      };
    
    case 'UPDATE_INVOICE':
      return {
        ...state,
        invoices: state.invoices.map(invoice =>
          invoice.id === action.payload.id
            ? { ...invoice, ...action.payload.updates }
            : invoice
        ),
      };
    
    case 'SELECT_INVOICE':
      return { ...state, selectedInvoice: action.payload };

    // Payment Cases
    case 'SET_PAYMENTS':
      return { ...state, payments: action.payload };
    
    case 'ADD_PAYMENT':
      return { 
        ...state, 
        payments: [action.payload, ...state.payments] 
      };
    
    case 'UPDATE_PAYMENT':
      return {
        ...state,
        payments: state.payments.map(payment =>
          payment.id === action.payload.id
            ? { ...payment, ...action.payload.updates }
            : payment
        ),
      };

    // Receivables and Payables
    case 'SET_RECEIVABLES':
      return { ...state, receivables: action.payload };
    
    case 'SET_PAYABLES':
      return { ...state, payables: action.payload };

    // Report Cases
    case 'SET_REPORTS':
      return { ...state, reports: action.payload };
    
    case 'ADD_REPORT':
      return { 
        ...state, 
        reports: [action.payload, ...state.reports] 
      };
    
    case 'SET_ACTIVE_REPORT':
      return { ...state, activeReport: action.payload };

    // UI Cases
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value,
        },
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.key]: action.payload.value,
        },
      };
    
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
      };
    
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };
    
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };

    default:
      return state;
  }
}

// Context Creation
const FinanceContext = createContext<{
  state: FinanceState;
  dispatch: React.Dispatch<FinanceAction>;
} | undefined>(undefined);

// Provider Component
export function FinanceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(financeReducer, initialState);

  return (
    <FinanceContext.Provider value={{ state, dispatch }}>
      {children}
    </FinanceContext.Provider>
  );
}

// Custom Hook
export function useFinanceContext() {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinanceContext must be used within a FinanceProvider');
  }
  return context;
}

export default FinanceContext;