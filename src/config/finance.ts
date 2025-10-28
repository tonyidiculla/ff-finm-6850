// Finance Management System Configuration
export const financeConfig = {
  // Core Finance Settings
  system: {
    name: 'Furfield Finance Management System',
    version: '2.0.0',
    currency: 'USD',
    fiscalYear: {
      startMonth: 1, // January
      endMonth: 12,  // December
    },
    timezone: 'UTC',
    defaultPaymentTerms: 30, // days
  },

  // Chart of Accounts Structure
  accountTypes: {
    assets: {
      name: 'Assets',
      code: '1000',
      subcategories: {
        current: { name: 'Current Assets', code: '1100' },
        fixed: { name: 'Fixed Assets', code: '1200' },
        intangible: { name: 'Intangible Assets', code: '1300' },
        investments: { name: 'Long-term Investments', code: '1400' },
      },
    },
    liabilities: {
      name: 'Liabilities',
      code: '2000',
      subcategories: {
        current: { name: 'Current Liabilities', code: '2100' },
        longTerm: { name: 'Long-term Liabilities', code: '2200' },
        deferred: { name: 'Deferred Revenue', code: '2300' },
      },
    },
    equity: {
      name: 'Equity',
      code: '3000',
      subcategories: {
        capital: { name: 'Capital Stock', code: '3100' },
        retained: { name: 'Retained Earnings', code: '3200' },
        reserves: { name: 'Reserves', code: '3300' },
      },
    },
    revenue: {
      name: 'Revenue',
      code: '4000',
      subcategories: {
        patient: { name: 'Patient Services Revenue', code: '4100' },
        insurance: { name: 'Insurance Revenue', code: '4200' },
        government: { name: 'Government Revenue', code: '4300' },
        other: { name: 'Other Revenue', code: '4400' },
      },
    },
    expenses: {
      name: 'Expenses',
      code: '5000',
      subcategories: {
        personnel: { name: 'Personnel Expenses', code: '5100' },
        medical: { name: 'Medical Supplies', code: '5200' },
        utilities: { name: 'Utilities & Maintenance', code: '5300' },
        administrative: { name: 'Administrative Expenses', code: '5400' },
        depreciation: { name: 'Depreciation', code: '5500' },
      },
    },
  },

  // Budget Categories
  budgetCategories: {
    revenue: {
      patientCare: { name: 'Patient Care Revenue', target: 0.75 },
      emergency: { name: 'Emergency Services', target: 0.15 },
      outpatient: { name: 'Outpatient Services', target: 0.10 },
    },
    expenses: {
      salaries: { name: 'Salaries & Benefits', limit: 0.45 },
      supplies: { name: 'Medical Supplies', limit: 0.20 },
      equipment: { name: 'Equipment & Maintenance', limit: 0.10 },
      utilities: { name: 'Utilities', limit: 0.08 },
      administration: { name: 'Administration', limit: 0.12 },
      other: { name: 'Other Expenses', limit: 0.05 },
    },
  },

  // Payment Processing
  paymentMethods: {
    cash: { name: 'Cash', processingFee: 0, processingTime: 0 },
    check: { name: 'Check', processingFee: 0, processingTime: 2 },
    creditCard: { name: 'Credit Card', processingFee: 0.029, processingTime: 1 },
    debitCard: { name: 'Debit Card', processingFee: 0.015, processingTime: 1 },
    bankTransfer: { name: 'Bank Transfer', processingFee: 5, processingTime: 3 },
    insurance: { name: 'Insurance', processingFee: 0, processingTime: 30 },
    government: { name: 'Government', processingFee: 0, processingTime: 45 },
  },

  // Billing Configuration
  billing: {
    cycles: ['monthly', 'quarterly', 'annually'],
    defaultCycle: 'monthly',
    gracePeriod: 30, // days
    lateFeeRate: 0.05, // 5% monthly
    autoReminders: {
      enabled: true,
      intervals: [7, 3, 1], // days before due date
    },
    invoiceSettings: {
      prefix: 'INV',
      numberLength: 8,
      includeQR: true,
      includePaymentLink: true,
    },
  },

  // Financial Reporting
  reports: {
    standard: [
      'balance_sheet',
      'income_statement',
      'cash_flow',
      'accounts_receivable',
      'accounts_payable',
      'budget_variance',
      'revenue_analysis',
      'expense_analysis',
    ],
    frequencies: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
    defaultFrequency: 'monthly',
    autoGeneration: true,
  },

  // Compliance and Regulations
  compliance: {
    taxSettings: {
      vatRate: 0.10, // 10% VAT
      corporateTaxRate: 0.21, // 21% Corporate Tax
      withholdingTaxRate: 0.15, // 15% Withholding Tax
      taxYear: 'calendar', // or 'fiscal'
    },
    auditRequirements: {
      retentionPeriod: 7, // years
      digitalSignatures: true,
      blockchainVerification: false,
      regulatoryReporting: true,
    },
    healthcareCompliance: {
      hipaaCompliant: true,
      hitech: true,
      medicareCompliance: true,
      medicaidCompliance: true,
    },
  },

  // Integration Settings
  integrations: {
    bankingAPI: {
      enabled: true,
      providers: ['Chase', 'Bank of America', 'Wells Fargo'],
      reconciliationFrequency: 'daily',
    },
    paymentGateways: {
      stripe: { enabled: true, publicKey: '', secretKey: '' },
      paypal: { enabled: true, clientId: '', clientSecret: '' },
      square: { enabled: false, applicationId: '', accessToken: '' },
    },
    accounting: {
      quickbooks: { enabled: true, clientId: '', clientSecret: '' },
      xero: { enabled: false, clientId: '', clientSecret: '' },
    },
    hrms: {
      enabled: true,
      payrollIntegration: true,
      expenseReimbursement: true,
    },
  },

  // Security and Permissions
  permissions: {
    admin: [
      'finance.view_all',
      'finance.edit_all',
      'finance.delete_all',
      'finance.approve_all',
      'finance.configure_system',
      'finance.view_reports',
      'finance.export_data',
      'finance.manage_users',
    ],
    finance_manager: [
      'finance.view_all',
      'finance.edit_transactions',
      'finance.approve_payments',
      'finance.view_reports',
      'finance.create_budgets',
      'finance.reconcile_accounts',
    ],
    accountant: [
      'finance.view_transactions',
      'finance.edit_transactions',
      'finance.create_invoices',
      'finance.process_payments',
      'finance.view_reports',
    ],
    billing_staff: [
      'finance.view_billing',
      'finance.create_invoices',
      'finance.process_payments',
      'finance.update_patient_accounts',
    ],
    department_manager: [
      'finance.view_department_budget',
      'finance.create_expense_requests',
      'finance.view_department_reports',
    ],
    employee: [
      'finance.view_own_payroll',
      'finance.submit_expense_claims',
      'finance.view_own_invoices',
    ],
  },

  // Workflow Configuration
  approvalWorkflows: {
    expenses: {
      threshold1: { amount: 1000, approvers: 1, roles: ['department_manager'] },
      threshold2: { amount: 5000, approvers: 1, roles: ['finance_manager'] },
      threshold3: { amount: 25000, approvers: 2, roles: ['finance_manager', 'admin'] },
    },
    budgetChanges: {
      minor: { percentage: 0.05, approvers: 1, roles: ['finance_manager'] },
      major: { percentage: 0.15, approvers: 2, roles: ['finance_manager', 'admin'] },
    },
    payments: {
      routine: { amount: 10000, autoApproval: true },
      significant: { amount: 50000, approvers: 2, roles: ['finance_manager', 'admin'] },
    },
  },

  // Automation Rules
  automation: {
    recurringTransactions: {
      enabled: true,
      maxDuration: 12, // months
      approvalRequired: false,
    },
    autoReconciliation: {
      enabled: true,
      tolerance: 0.01, // $0.01 variance tolerance
      manualReviewThreshold: 100, // transactions
    },
    latePaymentReminders: {
      enabled: true,
      intervals: [7, 14, 30], // days after due date
      escalationRules: true,
    },
  },

  // API Configuration
  api: {
    version: 'v1',
    baseUrl: '/api/finance',
    rateLimit: {
      requests: 1000,
      window: 3600, // 1 hour
    },
    caching: {
      enabled: true,
      ttl: 300, // 5 minutes
    },
  },

  // UI/UX Settings
  ui: {
    dateFormat: 'MM/DD/YYYY',
    currencyFormat: {
      locale: 'en-US',
      style: 'currency',
      currency: 'USD',
    },
    theme: {
      primaryColor: '#1E40AF', // Blue
      successColor: '#059669', // Green
      warningColor: '#D97706', // Orange
      errorColor: '#DC2626',   // Red
    },
    pagination: {
      defaultPageSize: 25,
      options: [10, 25, 50, 100],
    },
  },
};

// Export specific configurations for easy access
export const { accountTypes, budgetCategories, paymentMethods, billing, reports, compliance, permissions } = financeConfig;

export default financeConfig;