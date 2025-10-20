import { JsonDataStore } from '@/lib/data-store'
import { Account, AccountType, NormalBalance } from '@/types/accounting'

export type ChartOfAccountsTemplate = {
  name: string
  description: string
  accounts: AccountTemplate[]
}

export type AccountTemplate = {
  code: string
  name: string
  type: AccountType
  normalBalance: NormalBalance
  parentCode?: string
  isPostable?: boolean
  gaapCategory?: 'balance_sheet' | 'income_statement' | 'cash_flow'
  reportingOrder?: number
  requiresDocumentation?: boolean
}

/**
 * Predefined Chart of Accounts templates for different business types
 */
export const COA_TEMPLATES: Record<string, ChartOfAccountsTemplate> = {
    'simple-business': {
    name: 'Simple Business (GAAP Compliant)',
    description: 'GAAP-compliant chart of accounts for small businesses',
    accounts: [
      // ASSETS - Current Assets
      { code: '1000', name: 'Cash and Cash Equivalents', type: 'current_asset', normalBalance: 'debit', gaapCategory: 'balance_sheet', reportingOrder: 100, requiresDocumentation: true },
      { code: '1100', name: 'Bank Account - Checking', type: 'current_asset', normalBalance: 'debit', gaapCategory: 'balance_sheet', reportingOrder: 110 },
      { code: '1200', name: 'Accounts Receivable', type: 'current_asset', normalBalance: 'debit', gaapCategory: 'balance_sheet', reportingOrder: 120, requiresDocumentation: true },
      { code: '1300', name: 'Allowance for Doubtful Accounts', type: 'contra_asset', normalBalance: 'credit', gaapCategory: 'balance_sheet', reportingOrder: 130 },
      { code: '1400', name: 'Inventory', type: 'current_asset', normalBalance: 'debit', gaapCategory: 'balance_sheet', reportingOrder: 140, requiresDocumentation: true },
      { code: '1500', name: 'Prepaid Expenses', type: 'current_asset', normalBalance: 'debit', gaapCategory: 'balance_sheet', reportingOrder: 150 },
      
      // ASSETS - Non-Current Assets  
      { code: '1700', name: 'Property, Plant & Equipment', type: 'non_current_asset', normalBalance: 'debit', gaapCategory: 'balance_sheet', reportingOrder: 170, requiresDocumentation: true },
      { code: '1800', name: 'Accumulated Depreciation', type: 'contra_asset', normalBalance: 'credit', gaapCategory: 'balance_sheet', reportingOrder: 180 },
      
      // LIABILITIES - Current Liabilities
      { code: '2000', name: 'Accounts Payable', type: 'current_liability', normalBalance: 'credit', gaapCategory: 'balance_sheet', reportingOrder: 200, requiresDocumentation: true },
      { code: '2100', name: 'Accrued Expenses', type: 'current_liability', normalBalance: 'credit', gaapCategory: 'balance_sheet', reportingOrder: 210 },
      { code: '2200', name: 'Short-term Notes Payable', type: 'current_liability', normalBalance: 'credit', gaapCategory: 'balance_sheet', reportingOrder: 220, requiresDocumentation: true },
      
      // LIABILITIES - Non-Current Liabilities
      { code: '2500', name: 'Long-term Debt', type: 'non_current_liability', normalBalance: 'credit', gaapCategory: 'balance_sheet', reportingOrder: 250, requiresDocumentation: true },
      
      // EQUITY
      { code: '3000', name: 'Owner\'s Equity', type: 'equity', normalBalance: 'credit', gaapCategory: 'balance_sheet', reportingOrder: 300 },
      { code: '3100', name: 'Retained Earnings', type: 'retained_earnings', normalBalance: 'credit', gaapCategory: 'balance_sheet', reportingOrder: 310, requiresDocumentation: true },
      
      // REVENUE
      { code: '4000', name: 'Sales Revenue', type: 'revenue', normalBalance: 'credit', gaapCategory: 'income_statement', reportingOrder: 400, requiresDocumentation: true },
      { code: '4100', name: 'Service Revenue', type: 'revenue', normalBalance: 'credit', gaapCategory: 'income_statement', reportingOrder: 410 },
      
      // EXPENSES - Operating Expenses
      { code: '5000', name: 'Cost of Goods Sold', type: 'operating_expense', normalBalance: 'debit', gaapCategory: 'income_statement', reportingOrder: 500, requiresDocumentation: true },
      { code: '5100', name: 'Salaries and Wages', type: 'operating_expense', normalBalance: 'debit', gaapCategory: 'income_statement', reportingOrder: 510, requiresDocumentation: true },
      { code: '5200', name: 'Office Expenses', type: 'operating_expense', normalBalance: 'debit', gaapCategory: 'income_statement', reportingOrder: 520 },
      { code: '5300', name: 'Depreciation Expense', type: 'operating_expense', normalBalance: 'debit', gaapCategory: 'income_statement', reportingOrder: 530, requiresDocumentation: true },
      
      // EXPENSES - Non-Operating
      { code: '6000', name: 'Interest Expense', type: 'non_operating_expense', normalBalance: 'debit', gaapCategory: 'income_statement', reportingOrder: 600, requiresDocumentation: true },
    ]
  },
  
  'retail': {
    name: 'Retail Business',
    description: 'Chart of accounts for retail businesses with inventory',
    accounts: [
      // Current Assets
      { code: '1000', name: 'Cash', type: 'asset', normalBalance: 'debit' },
      { code: '1050', name: 'Petty Cash', type: 'asset', normalBalance: 'debit' },
      { code: '1100', name: 'Checking Account', type: 'asset', normalBalance: 'debit' },
      { code: '1150', name: 'Savings Account', type: 'asset', normalBalance: 'debit' },
      { code: '1200', name: 'Accounts Receivable', type: 'asset', normalBalance: 'debit' },
      { code: '1250', name: 'Allowance for Bad Debts', type: 'contra_asset', normalBalance: 'credit' },
      { code: '1300', name: 'Inventory', type: 'asset', normalBalance: 'debit' },
      { code: '1400', name: 'Prepaid Expenses', type: 'asset', normalBalance: 'debit' },
      
      // Fixed Assets
      { code: '1500', name: 'Equipment', type: 'asset', normalBalance: 'debit' },
      { code: '1550', name: 'Accumulated Depreciation - Equipment', type: 'contra_asset', normalBalance: 'credit' },
      { code: '1600', name: 'Furniture & Fixtures', type: 'asset', normalBalance: 'debit' },
      { code: '1650', name: 'Accumulated Depreciation - Furniture', type: 'contra_asset', normalBalance: 'credit' },
      
      // Current Liabilities
      { code: '2000', name: 'Accounts Payable', type: 'liability', normalBalance: 'credit' },
      { code: '2100', name: 'Sales Tax Payable', type: 'liability', normalBalance: 'credit' },
      { code: '2200', name: 'Payroll Liabilities', type: 'liability', normalBalance: 'credit' },
      { code: '2300', name: 'Credit Card Payable', type: 'liability', normalBalance: 'credit' },
      
      // Long-term Liabilities
      { code: '2500', name: 'Long-term Debt', type: 'liability', normalBalance: 'credit' },
      
      // Equity
      { code: '3000', name: 'Owner\'s Capital', type: 'equity', normalBalance: 'credit' },
      { code: '3100', name: 'Owner\'s Draw', type: 'equity', normalBalance: 'debit' },
      { code: '3200', name: 'Retained Earnings', type: 'equity', normalBalance: 'credit' },
      
      // Revenue
      { code: '4000', name: 'Sales Revenue', type: 'income', normalBalance: 'credit' },
      { code: '4100', name: 'Sales Returns & Allowances', type: 'contra_income', normalBalance: 'debit' },
      { code: '4200', name: 'Sales Discounts', type: 'contra_income', normalBalance: 'debit' },
      
      // Cost of Goods Sold
      { code: '5000', name: 'Cost of Goods Sold', type: 'expense', normalBalance: 'debit' },
      { code: '5100', name: 'Purchases', type: 'expense', normalBalance: 'debit' },
      { code: '5200', name: 'Purchase Returns & Allowances', type: 'contra_expense', normalBalance: 'credit' },
      { code: '5300', name: 'Purchase Discounts', type: 'contra_expense', normalBalance: 'credit' },
      { code: '5400', name: 'Freight In', type: 'expense', normalBalance: 'debit' },
      
      // Operating Expenses
      { code: '6000', name: 'Advertising Expense', type: 'expense', normalBalance: 'debit' },
      { code: '6100', name: 'Rent Expense', type: 'expense', normalBalance: 'debit' },
      { code: '6200', name: 'Utilities Expense', type: 'expense', normalBalance: 'debit' },
      { code: '6300', name: 'Insurance Expense', type: 'expense', normalBalance: 'debit' },
      { code: '6400', name: 'Office Supplies', type: 'expense', normalBalance: 'debit' },
      { code: '6500', name: 'Professional Fees', type: 'expense', normalBalance: 'debit' },
      { code: '6600', name: 'Depreciation Expense', type: 'expense', normalBalance: 'debit' },
      { code: '6700', name: 'Bad Debt Expense', type: 'expense', normalBalance: 'debit' },
    ],
  },
  
  'service': {
    name: 'Service Business',
    description: 'Chart of accounts for service-based businesses',
    accounts: [
      // Assets
      { code: '1000', name: 'Cash', type: 'asset', normalBalance: 'debit' },
      { code: '1100', name: 'Business Checking', type: 'asset', normalBalance: 'debit' },
      { code: '1200', name: 'Accounts Receivable', type: 'asset', normalBalance: 'debit' },
      { code: '1300', name: 'Prepaid Expenses', type: 'asset', normalBalance: 'debit' },
      { code: '1500', name: 'Equipment', type: 'asset', normalBalance: 'debit' },
      { code: '1550', name: 'Accumulated Depreciation', type: 'contra_asset', normalBalance: 'credit' },
      
      // Liabilities
      { code: '2000', name: 'Accounts Payable', type: 'liability', normalBalance: 'credit' },
      { code: '2100', name: 'Income Tax Payable', type: 'liability', normalBalance: 'credit' },
      { code: '2200', name: 'Payroll Liabilities', type: 'liability', normalBalance: 'credit' },
      
      // Equity
      { code: '3000', name: 'Owner\'s Equity', type: 'equity', normalBalance: 'credit' },
      { code: '3100', name: 'Retained Earnings', type: 'equity', normalBalance: 'credit' },
      
      // Revenue
      { code: '4000', name: 'Service Revenue', type: 'income', normalBalance: 'credit' },
      { code: '4100', name: 'Consulting Revenue', type: 'income', normalBalance: 'credit' },
      
      // Expenses
      { code: '6000', name: 'Salaries Expense', type: 'expense', normalBalance: 'debit' },
      { code: '6100', name: 'Rent Expense', type: 'expense', normalBalance: 'debit' },
      { code: '6200', name: 'Office Expenses', type: 'expense', normalBalance: 'debit' },
      { code: '6300', name: 'Travel Expense', type: 'expense', normalBalance: 'debit' },
      { code: '6400', name: 'Professional Development', type: 'expense', normalBalance: 'debit' },
      { code: '6500', name: 'Software Subscriptions', type: 'expense', normalBalance: 'debit' },
      { code: '6600', name: 'Depreciation Expense', type: 'expense', normalBalance: 'debit' },
    ],
  },
}

export class ChartOfAccountsService {
  /**
   * Creates accounts from a template
   */
  static async createFromTemplate(
    bookId: string,
    templateKey: string
  ): Promise<void> {
    const template = COA_TEMPLATES[templateKey]
    if (!template) {
      throw new Error(`Template '${templateKey}' not found`)
    }

    // Create accounts
    for (const accountTemplate of template.accounts) {
      const account: Account = {
        id: JsonDataStore.generateId(),
        bookId,
        code: accountTemplate.code,
        name: accountTemplate.name,
        type: accountTemplate.type,
        normalBalance: accountTemplate.normalBalance,
        isPostable: accountTemplate.isPostable ?? true,
        isActive: true,
        balance: 0,
        gaapCategory: accountTemplate.gaapCategory,
        reportingOrder: accountTemplate.reportingOrder ?? 0,
        requiresDocumentation: accountTemplate.requiresDocumentation ?? false,
        createdAt: new Date(),
      }
      
      await JsonDataStore.create('accounts', account)
    }

    // Set up parent-child relationships in a second pass
    for (const accountTemplate of template.accounts) {
      if (accountTemplate.parentCode) {
        const accounts = await JsonDataStore.findMany<Account>(
          'accounts',
          account => account.bookId === bookId && account.code === accountTemplate.parentCode
        )
        
        const parent = accounts[0]
        if (parent) {
          const childAccounts = await JsonDataStore.findMany<Account>(
            'accounts',
            account => account.bookId === bookId && account.code === accountTemplate.code
          )
          
          const child = childAccounts[0]
          if (child) {
            await JsonDataStore.update('accounts', child.id, {
              parentId: parent.id,
            })
          }
        }
      }
    }
  }

  /**
   * Gets all available templates
   */
  static getAvailableTemplates(): Array<{
    key: string
    name: string
    description: string
    accountCount: number
  }> {
    return Object.entries(COA_TEMPLATES).map(([key, template]) => ({
      key,
      name: template.name,
      description: template.description,
      accountCount: template.accounts.length,
    }))
  }

  /**
   * Creates a standard tax account if it doesn't exist
   */
  static async createTaxAccount(
    bookId: string,
    taxName: string,
    isPayable: boolean = true
  ) {
    const code = isPayable ? '2150' : '1250' // Tax Payable or Tax Receivable
    const name = isPayable ? `${taxName} Payable` : `${taxName} Receivable`
    const type = isPayable ? 'liability' : 'asset'
    const normalBalance = isPayable ? 'credit' : 'debit'

    // Check if account already exists
    const existingAccounts = await JsonDataStore.findMany<Account>(
      'accounts',
      account => account.bookId === bookId && account.code === code
    )

    if (existingAccounts.length > 0) {
      return existingAccounts[0]
    }

    // Create new tax account
    const account: Account = {
      id: JsonDataStore.generateId(),
      bookId,
      code,
      name,
      type,
      normalBalance,
      isPostable: true,
      isActive: true,
      balance: 0,
      reportingOrder: 0,
      requiresDocumentation: false,
      createdAt: new Date(),
    }

    return await JsonDataStore.create('accounts', account)
  }
}