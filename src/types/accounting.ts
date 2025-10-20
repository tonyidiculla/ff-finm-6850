// Core domain types for the accounting system
export type Organization = {
  id: string
  name: string
  countryCode?: string
  createdAt: Date
}

export type Book = {
  id: string
  organizationId: string
  name: string
  type: 'general-ledger' | 'subsidiary' | 'cash-basis' | 'accrual-basis' | 'consolidation' | 'budget' | 'statistical'
  baseCurrency: string // ISO 4217
  fyStartMonth: number // 1-12
  lockDate?: Date
  accountingStandard: 'GAAP' | 'IFRS' | 'Other'
  isActive: boolean
  description?: string
  createdAt: Date
}

export type User = {
  id: string
  email: string
  name?: string
  createdAt: Date
}

export type OrganizationMembership = {
  id: string
  organizationId: string
  userId: string
  role: 'owner' | 'admin' | 'accountant' | 'viewer'
  createdAt: Date
}

export type AccountType = 
  // Assets (GAAP compliant categories)
  | 'current_asset' 
  | 'non_current_asset'
  | 'asset' // General asset category
  // Liabilities
  | 'current_liability'
  | 'non_current_liability' 
  | 'liability' // General liability category
  // Equity
  | 'equity' 
  | 'retained_earnings'
  // Revenue/Income
  | 'revenue'
  | 'income' 
  // Expenses
  | 'operating_expense'
  | 'non_operating_expense'
  | 'expense' // General expense category
  // Contra accounts
  | 'contra_asset' 
  | 'contra_liability' 
  | 'contra_income' 
  | 'contra_expense'

export type NormalBalance = 'debit' | 'credit'

export type Account = {
  id: string
  bookId: string
  code: string
  name: string
  type: AccountType
  normalBalance: NormalBalance
  isPostable: boolean
  parentId?: string
  taxCode?: string
  isActive: boolean
  balance: number
  // GAAP compliance fields
  gaapCategory?: 'balance_sheet' | 'income_statement' | 'cash_flow'
  reportingOrder: number // For financial statement ordering
  description?: string
  requiresDocumentation: boolean // For audit trails
  createdAt: Date
}

export type Tax = {
  id: string
  bookId: string
  name: string
  rate: number // 0.1800 for 18%
  accountId?: string
  isCompound: boolean
  createdAt: Date
}

export type ContactKind = 'customer' | 'supplier' | 'both'

export type Contact = {
  id: string
  bookId: string
  kind: ContactKind
  displayName: string
  email?: string
  phone?: string
  gstVatId?: string
  isActive: boolean
  createdAt: Date
}

export type Item = {
  id: string
  bookId: string
  sku?: string
  name: string
  description?: string
  sellPrice?: number
  buyPrice?: number
  incomeAccountId?: string
  expenseAccountId?: string
  taxId?: string
  createdAt: Date
}

export type DocType = 'manual' | 'invoice' | 'bill' | 'payment' | 'bank' | 'adjustment'

export type Journal = {
  id: string
  bookId: string
  docType: DocType
  docNo?: string
  docDate: Date
  currency: string
  narration?: string
  postedAt?: Date
  createdBy?: string
  reversalOf?: string
  createdAt: Date
}

export type LedgerEntry = {
  id: string
  journalId: string
  lineNo: number
  accountId: string
  contactId?: string
  description?: string
  amountDc: number // Positive for debit, negative for credit
  amountTxn?: number
  fxRate?: number
  createdAt: Date
}

export type DocStatus = 'draft' | 'approved' | 'part_paid' | 'paid' | 'void'

export type Invoice = {
  id: string
  bookId: string
  contactId: string
  invoiceNo?: string
  invoiceDate: Date
  dueDate?: Date
  currency: string
  status: DocStatus
  totalTxn: number
  totalTaxTxn: number
  totalDc: number
  createdAt: Date
}

export type InvoiceLine = {
  id: string
  invoiceId: string
  lineNo: number
  itemId?: string
  description?: string
  qty: number
  unitPrice: number
  taxId?: string
  accountId?: string
  amountTxn: number
  taxAmountTxn: number
}

export type Bill = {
  id: string
  bookId: string
  contactId: string
  billNo?: string
  billDate: Date
  dueDate?: Date
  currency: string
  status: DocStatus
  totalTxn: number
  totalTaxTxn: number
  totalDc: number
  createdAt: Date
}

export type BillLine = {
  id: string
  billId: string
  lineNo: number
  itemId?: string
  description?: string
  qty: number
  unitPrice: number
  taxId?: string
  accountId?: string
  amountTxn: number
  taxAmountTxn: number
}

export type PaymentDirection = 'incoming' | 'outgoing'

export type Payment = {
  id: string
  bookId: string
  contactId?: string
  direction: PaymentDirection
  docNo?: string
  docDate: Date
  currency: string
  amountTxn: number
  method?: string // cash/bank/upi/card
  createdAt: Date
}

export type PaymentApplication = {
  id: string
  paymentId: string
  invoiceId?: string
  billId?: string
  amountTxn: number
}

export type BankAccount = {
  id: string
  bookId: string
  name: string
  institution?: string
  currency: string
  glAccountId: string
  createdAt: Date
}

export type BankTransaction = {
  id: string
  bankAccountId: string
  txnDate: Date
  description: string
  amount: number
  balance?: number
  reference?: string
  isReconciled: boolean
  createdAt: Date
}