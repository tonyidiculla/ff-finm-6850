// Core Finance Types
export interface FinanceEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// Account Types
export interface Account extends FinanceEntity {
  accountNumber: string;
  name: string;
  type: AccountType;
  subtype?: string;
  balance: number;
  currency: string;
  status: AccountStatus;
  parentAccountId?: string;
  departmentId?: string;
  budgetAllocated?: number;
  budgetSpent?: number;
  isActive: boolean;
  description?: string;
  bankDetails?: BankDetails;
}

export type AccountType = 
  | 'assets' 
  | 'liabilities' 
  | 'equity' 
  | 'revenue' 
  | 'expenses' 
  | 'contra_asset' 
  | 'contra_liability' 
  | 'contra_equity';

export type AccountStatus = 'active' | 'inactive' | 'frozen' | 'closed';

export interface BankDetails {
  bankName: string;
  routingNumber: string;
  accountNumber: string;
  accountType: 'checking' | 'savings' | 'money_market';
  branch?: string;
}

// Transaction Types
export interface Transaction extends FinanceEntity {
  transactionNumber: string;
  type: TransactionType;
  accountId: string;
  amount: number;
  description: string;
  category: string;
  subcategory?: string;
  reference?: string;
  date: string;
  effectiveDate?: string;
  status: TransactionStatus;
  approvedBy?: string;
  approvedAt?: string;
  tags: string[];
  attachments: Attachment[];
  metadata: Record<string, any>;
  reconciled: boolean;
  reconciledAt?: string;
}

export type TransactionType = 'income' | 'expense' | 'transfer' | 'adjustment' | 'reversal';
export type TransactionStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';

export interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

// Budget Types
export interface Budget extends FinanceEntity {
  name: string;
  description?: string;
  fiscalYear: number;
  fiscalPeriod?: FiscalPeriod;
  departmentId?: string;
  totalAllocated: number;
  totalSpent: number;
  totalCommitted: number;
  totalRemaining: number;
  categories: BudgetCategory[];
  status: BudgetStatus;
  approvedBy?: string;
  approvedAt?: string;
  version: number;
  parentBudgetId?: string;
}

export type FiscalPeriod = 'annual' | 'quarterly' | 'monthly';
export type BudgetStatus = 'draft' | 'submitted' | 'approved' | 'active' | 'closed' | 'cancelled';

export interface BudgetCategory {
  id: string;
  category: string;
  subcategory?: string;
  allocated: number;
  spent: number;
  committed: number;
  remaining: number;
  variance: number;
  utilizationRate: number;
  notes?: string;
}

// Invoice Types
export interface Invoice extends FinanceEntity {
  invoiceNumber: string;
  customerId?: string;
  patientId?: string;
  departmentId?: string;
  issueDate: string;
  dueDate: string;
  terms: PaymentTerms;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  status: InvoiceStatus;
  lineItems: InvoiceLineItem[];
  payments: InvoicePayment[];
  notes?: string;
  internalNotes?: string;
  recurringInvoiceId?: string;
  currency: string;
  exchangeRate?: number;
}

export type PaymentTerms = 'net_15' | 'net_30' | 'net_45' | 'net_60' | 'due_on_receipt' | 'custom';
export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled' | 'refunded';

export interface InvoiceLineItem {
  id: string;
  description: string;
  serviceCode?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  taxRate?: number;
  total: number;
  accountId?: string;
}

export interface InvoicePayment {
  id: string;
  paymentId: string;
  amount: number;
  allocatedAt: string;
  notes?: string;
}

// Payment Types
export interface Payment extends FinanceEntity {
  paymentNumber: string;
  invoiceId?: string;
  customerId?: string;
  patientId?: string;
  amount: number;
  currency: string;
  exchangeRate?: number;
  method: PaymentMethod;
  status: PaymentStatus;
  reference?: string;
  gatewayTransactionId?: string;
  processingFees: number;
  netAmount: number;
  processedAt?: string;
  failureReason?: string;
  refunds: PaymentRefund[];
  metadata: Record<string, any>;
}

export type PaymentMethod = 
  | 'cash' 
  | 'check' 
  | 'credit_card' 
  | 'debit_card' 
  | 'bank_transfer' 
  | 'ach' 
  | 'wire' 
  | 'insurance' 
  | 'government' 
  | 'other';

export type PaymentStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'cancelled' 
  | 'refunded' 
  | 'partially_refunded';

export interface PaymentRefund {
  id: string;
  amount: number;
  reason: string;
  status: 'pending' | 'processed' | 'failed';
  processedAt?: string;
  gatewayRefundId?: string;
}

// Receivables and Payables Types
export interface Receivable extends FinanceEntity {
  invoiceId: string;
  customerId: string;
  originalAmount: number;
  remainingAmount: number;
  dueDate: string;
  status: ReceivableStatus;
  agingDays: number;
  agingCategory: AgingCategory;
  lastContactDate?: string;
  nextActionDate?: string;
  collectionNotes: string[];
}

export type ReceivableStatus = 'current' | 'overdue' | 'in_collection' | 'disputed' | 'written_off' | 'paid';
export type AgingCategory = 'current' | '1-30' | '31-60' | '61-90' | '91-120' | 'over_120';

export interface Payable extends FinanceEntity {
  vendorId: string;
  invoiceNumber?: string;
  originalAmount: number;
  remainingAmount: number;
  dueDate: string;
  status: PayableStatus;
  approvalStatus: ApprovalStatus;
  agingDays: number;
  discountAvailable?: number;
  discountDate?: string;
  paymentTerms: PaymentTerms;
}

export type PayableStatus = 'pending' | 'approved' | 'scheduled' | 'paid' | 'overdue' | 'disputed';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'requires_approval';

// Financial Report Types
export interface FinancialReport extends FinanceEntity {
  name: string;
  type: ReportType;
  period: ReportPeriod;
  parameters: ReportParameters;
  data: ReportData;
  format: ReportFormat;
  status: ReportStatus;
  generatedBy: string;
  scheduledReport?: boolean;
  nextRunDate?: string;
  recipients?: string[];
}

export type ReportType = 
  | 'balance_sheet' 
  | 'income_statement' 
  | 'cash_flow' 
  | 'trial_balance' 
  | 'accounts_receivable' 
  | 'accounts_payable' 
  | 'budget_variance' 
  | 'revenue_analysis' 
  | 'expense_analysis' 
  | 'profitability' 
  | 'custom';

export type ReportFormat = 'pdf' | 'excel' | 'csv' | 'json' | 'html';
export type ReportStatus = 'generating' | 'completed' | 'failed' | 'scheduled';

export interface ReportPeriod {
  startDate: string;
  endDate: string;
  label: string;
  fiscalYear?: number;
  fiscalQuarter?: number;
}

export interface ReportParameters {
  includeInactive?: boolean;
  consolidateSubsidiaries?: boolean;
  currency?: string;
  exchangeRateDate?: string;
  departmentIds?: string[];
  accountIds?: string[];
  customFilters?: Record<string, any>;
}

export interface ReportData {
  summary?: Record<string, number>;
  sections?: ReportSection[];
  totals?: Record<string, number>;
  metadata?: Record<string, any>;
  charts?: ChartData[];
}

export interface ReportSection {
  id: string;
  title: string;
  items: ReportItem[];
  subtotal?: number;
}

export interface ReportItem {
  id: string;
  label: string;
  value: number;
  percentage?: number;
  variance?: number;
  trend?: 'up' | 'down' | 'stable';
}

export interface ChartData {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'area';
  title: string;
  data: any[];
  options?: Record<string, any>;
}

// Customer and Vendor Types
export interface Customer extends FinanceEntity {
  customerNumber: string;
  name: string;
  type: CustomerType;
  status: CustomerStatus;
  contactInfo: ContactInfo;
  billingAddress: Address;
  shippingAddress?: Address;
  paymentTerms: PaymentTerms;
  creditLimit?: number;
  currentBalance: number;
  totalInvoiced: number;
  totalPaid: number;
  lastPaymentDate?: string;
  notes?: string;
}

export type CustomerType = 'individual' | 'corporate' | 'government' | 'insurance' | 'other';
export type CustomerStatus = 'active' | 'inactive' | 'suspended' | 'bad_debt';

export interface Vendor extends FinanceEntity {
  vendorNumber: string;
  name: string;
  type: VendorType;
  status: VendorStatus;
  contactInfo: ContactInfo;
  address: Address;
  paymentTerms: PaymentTerms;
  taxId?: string;
  w9OnFile?: boolean;
  currentBalance: number;
  totalInvoiced: number;
  totalPaid: number;
  lastPaymentDate?: string;
}

export type VendorType = 'supplier' | 'contractor' | 'service_provider' | 'utility' | 'other';
export type VendorStatus = 'active' | 'inactive' | 'suspended' | 'terminated';

export interface ContactInfo {
  primaryContact?: string;
  email?: string;
  phone?: string;
  fax?: string;
  website?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// Tax and Compliance Types
export interface TaxRate {
  id: string;
  name: string;
  type: TaxType;
  rate: number;
  effectiveDate: string;
  expiryDate?: string;
  jurisdiction: string;
  applicableAccountTypes: AccountType[];
  isActive: boolean;
}

export type TaxType = 'sales' | 'vat' | 'gst' | 'income' | 'property' | 'withholding' | 'other';

export interface ComplianceRecord {
  id: string;
  type: ComplianceType;
  period: string;
  status: ComplianceStatus;
  filingDate?: string;
  dueDate: string;
  amount?: number;
  filedBy?: string;
  confirmationNumber?: string;
  notes?: string;
}

export type ComplianceType = 'tax_return' | 'sales_tax' | 'payroll_tax' | 'audit' | 'regulatory_filing';
export type ComplianceStatus = 'pending' | 'filed' | 'overdue' | 'amended' | 'audited';

// Analytics and KPI Types
export interface FinancialMetrics {
  revenue: RevenueMetrics;
  expenses: ExpenseMetrics;
  profitability: ProfitabilityMetrics;
  cashFlow: CashFlowMetrics;
  receivables: ReceivableMetrics;
  payables: PayableMetrics;
  budget: BudgetMetrics;
}

export interface RevenueMetrics {
  totalRevenue: number;
  recurringRevenue: number;
  growthRate: number;
  seasonalityIndex: number;
  revenueBySource: Record<string, number>;
  averageTransactionValue: number;
}

export interface ExpenseMetrics {
  totalExpenses: number;
  fixedExpenses: number;
  variableExpenses: number;
  expenseGrowthRate: number;
  expenseByCategory: Record<string, number>;
  costPerPatient: number;
}

export interface ProfitabilityMetrics {
  grossProfit: number;
  grossMargin: number;
  netProfit: number;
  netMargin: number;
  ebitda: number;
  returnOnAssets: number;
  returnOnEquity: number;
}

export interface CashFlowMetrics {
  operatingCashFlow: number;
  investingCashFlow: number;
  financingCashFlow: number;
  freeCashFlow: number;
  cashConversionCycle: number;
  daysInCash: number;
}

export interface ReceivableMetrics {
  totalReceivables: number;
  averageCollectionPeriod: number;
  turnoverRatio: number;
  badDebtPercentage: number;
  agingAnalysis: Record<AgingCategory, number>;
}

export interface PayableMetrics {
  totalPayables: number;
  averagePaymentPeriod: number;
  turnoverRatio: number;
  discountsCaptured: number;
  discountsMissed: number;
}

export interface BudgetMetrics {
  budgetVariance: number;
  budgetUtilization: number;
  forecastAccuracy: number;
  categoryVariances: Record<string, number>;
}

// API and Filter Types
export interface FinanceApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  metadata?: {
    totalCount?: number;
    pageSize?: number;
    currentPage?: number;
    totalPages?: number;
  };
}

export interface PaginatedFinanceResponse<T> extends FinanceApiResponse<T[]> {
  pagination: {
    totalCount: number;
    pageSize: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface FinanceFilters {
  dateRange?: DateRange;
  amountRange?: AmountRange;
  status?: string[];
  accountIds?: string[];
  departmentIds?: string[];
  categories?: string[];
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface AmountRange {
  min?: number;
  max?: number;
}

// Audit and Security Types
export interface FinanceAuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: AuditAction;
  userId: string;
  userRole: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  notes?: string;
}

export type AuditAction = 
  | 'create' 
  | 'read' 
  | 'update' 
  | 'delete' 
  | 'approve' 
  | 'reject' 
  | 'cancel' 
  | 'export' 
  | 'import' 
  | 'login' 
  | 'logout';

export interface FinancePermission {
  id: string;
  name: string;
  description: string;
  module: FinanceModule;
  actions: string[];
  dataTypes: string[];
}

export type FinanceModule = 
  | 'accounts' 
  | 'transactions' 
  | 'budgets' 
  | 'invoices' 
  | 'payments' 
  | 'reports' 
  | 'analytics' 
  | 'compliance' 
  | 'administration';

// Form and Validation Types
export interface FinanceFormData {
  [key: string]: any;
}

export interface FinanceValidation {
  isValid: boolean;
  errors: string[];
  fieldErrors?: Record<string, string>;
  warnings?: string[];
}

// Notification Types
export interface FinanceNotification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  priority: NotificationPriority;
  targetUsers: string[];
  targetRoles?: string[];
  scheduledFor?: string;
  expiresAt?: string;
  actionRequired?: boolean;
  actionUrl?: string;
  data?: Record<string, any>;
  createdAt: string;
  readBy: string[];
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'alert';
export type NotificationCategory = 'transaction' | 'invoice' | 'payment' | 'budget' | 'report' | 'compliance' | 'system';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export default {
  // Re-export all types for easy importing
};