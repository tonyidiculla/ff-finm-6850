import { NextRequest, NextResponse } from 'next/server';
import { financeConfig } from '../config/finance';

interface FinanceRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: string;
    department?: string;
    permissions?: string[];
  };
}

export async function validateFinanceAccess(
  request: NextRequest,
  requiredPermission: string
): Promise<NextResponse | null> {
  try {
    // Get user from auth middleware (would be set by auth service)
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // In a real implementation, validate JWT token and get user info
    const user = await getUserFromToken(authHeader.replace('Bearer ', ''));
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    // Check if user has required permission
    const userPermissions = financeConfig.permissions[user.role as keyof typeof financeConfig.permissions] || [];
    
    if (!userPermissions.includes(requiredPermission)) {
      return NextResponse.json(
        { error: 'Insufficient permissions for finance operation' },
        { status: 403 }
      );
    }

    // Attach user to request
    (request as FinanceRequest).user = user;
    return null; // No error, proceed
  } catch (error) {
    return NextResponse.json(
      { error: 'Finance authentication error' },
      { status: 401 }
    );
  }
}

export function withFinanceAuth(
  handler: (req: FinanceRequest) => Promise<NextResponse> | NextResponse,
  requiredPermission: string
) {
  return async (request: NextRequest) => {
    const authError = await validateFinanceAccess(request, requiredPermission);
    if (authError) return authError;

    return handler(request as FinanceRequest);
  };
}

export function validateTransactionData(transactionData: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Required fields
  if (!transactionData.type) errors.push('Transaction type is required');
  if (!transactionData.accountId) errors.push('Account ID is required');
  if (!transactionData.amount) errors.push('Amount is required');
  if (!transactionData.description) errors.push('Description is required');
  if (!transactionData.date) errors.push('Transaction date is required');
  if (!transactionData.category) errors.push('Category is required');
  
  // Type validation
  if (transactionData.type && !['income', 'expense', 'transfer'].includes(transactionData.type)) {
    errors.push('Invalid transaction type');
  }
  
  // Amount validation
  if (transactionData.amount && (isNaN(transactionData.amount) || transactionData.amount <= 0)) {
    errors.push('Amount must be a positive number');
  }
  
  // Date validation
  if (transactionData.date && isNaN(Date.parse(transactionData.date))) {
    errors.push('Invalid transaction date');
  }
  
  // Future date check
  if (transactionData.date) {
    const transactionDate = new Date(transactionData.date);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    if (transactionDate > today) {
      errors.push('Transaction date cannot be in the future');
    }
  }
  
  // Category validation
  const validCategories = Object.keys(financeConfig.budgetCategories.expenses)
    .concat(Object.keys(financeConfig.budgetCategories.revenue));
  
  if (transactionData.category && !validCategories.includes(transactionData.category)) {
    errors.push('Invalid transaction category');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateInvoiceData(invoiceData: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Required fields
  if (!invoiceData.amount) errors.push('Invoice amount is required');
  if (!invoiceData.dueDate) errors.push('Due date is required');
  if (!invoiceData.lineItems || invoiceData.lineItems.length === 0) {
    errors.push('At least one line item is required');
  }
  
  // Amount validation
  if (invoiceData.amount && (isNaN(invoiceData.amount) || invoiceData.amount <= 0)) {
    errors.push('Amount must be a positive number');
  }
  
  // Date validation
  if (invoiceData.dueDate && isNaN(Date.parse(invoiceData.dueDate))) {
    errors.push('Invalid due date');
  }
  
  // Due date should be in the future
  if (invoiceData.dueDate) {
    const dueDate = new Date(invoiceData.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dueDate < today) {
      errors.push('Due date should be in the future');
    }
  }
  
  // Line items validation
  if (invoiceData.lineItems && Array.isArray(invoiceData.lineItems)) {
    invoiceData.lineItems.forEach((item: any, index: number) => {
      if (!item.description) errors.push(`Line item ${index + 1}: Description is required`);
      if (!item.quantity || item.quantity <= 0) errors.push(`Line item ${index + 1}: Quantity must be positive`);
      if (!item.unitPrice || item.unitPrice <= 0) errors.push(`Line item ${index + 1}: Unit price must be positive`);
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateBudgetData(budgetData: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Required fields
  if (!budgetData.name) errors.push('Budget name is required');
  if (!budgetData.fiscalYear) errors.push('Fiscal year is required');
  if (!budgetData.totalAllocated) errors.push('Total allocated amount is required');
  
  // Fiscal year validation
  const currentYear = new Date().getFullYear();
  if (budgetData.fiscalYear && (budgetData.fiscalYear < currentYear - 1 || budgetData.fiscalYear > currentYear + 5)) {
    errors.push('Fiscal year must be within reasonable range');
  }
  
  // Amount validation
  if (budgetData.totalAllocated && (isNaN(budgetData.totalAllocated) || budgetData.totalAllocated <= 0)) {
    errors.push('Total allocated amount must be positive');
  }
  
  // Categories validation
  if (budgetData.categories && Array.isArray(budgetData.categories)) {
    let totalCategoryAllocations = 0;
    
    budgetData.categories.forEach((category: any, index: number) => {
      if (!category.category) errors.push(`Category ${index + 1}: Category name is required`);
      if (!category.allocated || category.allocated <= 0) {
        errors.push(`Category ${index + 1}: Allocated amount must be positive`);
      } else {
        totalCategoryAllocations += category.allocated;
      }
    });
    
    // Check if category allocations match total
    if (Math.abs(totalCategoryAllocations - budgetData.totalAllocated) > 0.01) {
      errors.push('Sum of category allocations must equal total allocated amount');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validatePaymentData(paymentData: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Required fields
  if (!paymentData.amount) errors.push('Payment amount is required');
  if (!paymentData.method) errors.push('Payment method is required');
  
  // Amount validation
  if (paymentData.amount && (isNaN(paymentData.amount) || paymentData.amount <= 0)) {
    errors.push('Payment amount must be positive');
  }
  
  // Method validation
  const validMethods = Object.keys(financeConfig.paymentMethods);
  if (paymentData.method && !validMethods.includes(paymentData.method)) {
    errors.push('Invalid payment method');
  }
  
  // Invoice reference validation (if provided)
  if (paymentData.invoiceId && typeof paymentData.invoiceId !== 'string') {
    errors.push('Invalid invoice reference');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function checkFinancialDataAccess(
  user: any,
  dataType: string,
  action: string,
  targetData?: any
): boolean {
  // Admin can access all financial data
  if (user.role === 'admin') {
    return true;
  }
  
  // Finance Manager can access most financial data
  if (user.role === 'finance_manager') {
    // Can view all, but some restrictions on editing high-value transactions
    if (action === 'edit' && targetData?.amount > 50000) {
      return false; // Requires admin approval
    }
    return true;
  }
  
  // Accountant has limited access
  if (user.role === 'accountant') {
    const allowedActions = ['view', 'create', 'edit'];
    const restrictedData = ['budgets', 'high_value_transactions'];
    
    if (!allowedActions.includes(action)) return false;
    if (restrictedData.includes(dataType)) return false;
    if (targetData?.amount > 25000) return false;
    
    return true;
  }
  
  // Billing Staff - limited to billing operations
  if (user.role === 'billing_staff') {
    const allowedDataTypes = ['invoices', 'payments', 'patient_accounts'];
    const allowedActions = ['view', 'create', 'edit'];
    
    return allowedDataTypes.includes(dataType) && allowedActions.includes(action);
  }
  
  // Department Managers - only their department's budget
  if (user.role === 'department_manager') {
    if (dataType === 'budgets' && targetData?.department === user.department) {
      return ['view', 'create_expense_request'].includes(action);
    }
    return false;
  }
  
  // Employees - very limited access
  if (user.role === 'employee') {
    const allowedDataTypes = ['own_payroll', 'own_invoices', 'expense_claims'];
    return allowedDataTypes.includes(dataType) && action === 'view';
  }
  
  return false;
}

export function sanitizeFinancialData(data: any, userRole: string, dataType: string): any {
  const sensitiveFields = ['bankDetails', 'taxId', 'socialSecurityNumber', 'fullAccountNumber'];
  
  // Admin and Finance Manager can see all data
  if (userRole === 'admin' || userRole === 'finance_manager') {
    return data;
  }
  
  // Accountant can see most data but not personal details
  if (userRole === 'accountant') {
    const sanitized = { ...data };
    sensitiveFields.forEach(field => delete sanitized[field]);
    return sanitized;
  }
  
  // Billing Staff can see billing-related data only
  if (userRole === 'billing_staff') {
    const allowedFields = ['id', 'amount', 'status', 'dueDate', 'invoiceNumber', 'description'];
    const sanitized: any = {};
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        sanitized[field] = data[field];
      }
    });
    return sanitized;
  }
  
  // Default: minimal information
  return {
    id: data.id,
    status: data.status,
    amount: data.amount ? '***' : undefined,
  };
}

export function logFinanceActivity(
  action: string,
  userId: string,
  dataType: string,
  recordId?: string,
  details?: Record<string, any>
) {
  // In a real implementation, this would log to audit system
  console.log(`[FINANCE] ${action}`, {
    userId,
    dataType,
    recordId,
    timestamp: new Date().toISOString(),
    details,
  });
}

export function checkApprovalRequired(
  action: string,
  dataType: string,
  amount?: number,
  userRole?: string
): { required: boolean; approvers?: string[]; threshold?: string } {
  
  if (dataType === 'expense' && amount) {
    const workflows = financeConfig.approvalWorkflows.expenses;
    
    if (amount >= 25000) {
      return { 
        required: true, 
        approvers: workflows.threshold3.roles,
        threshold: 'threshold3'
      };
    } else if (amount >= 5000) {
      return { 
        required: true, 
        approvers: workflows.threshold2.roles,
        threshold: 'threshold2'
      };
    } else if (amount >= 1000) {
      return { 
        required: true, 
        approvers: workflows.threshold1.roles,
        threshold: 'threshold1'
      };
    }
  }
  
  if (dataType === 'budget' && action === 'edit') {
    return { 
      required: true, 
      approvers: ['finance_manager', 'admin'],
      threshold: 'budget_change'
    };
  }
  
  if (dataType === 'payment' && amount && amount >= 50000) {
    return { 
      required: true, 
      approvers: financeConfig.approvalWorkflows.payments.significant.roles,
      threshold: 'significant_payment'
    };
  }
  
  return { required: false };
}

export function calculateTaxes(amount: number, taxType: 'vat' | 'corporate' | 'withholding' = 'vat'): number {
  const rates = financeConfig.compliance.taxSettings;
  
  switch (taxType) {
    case 'vat':
      return amount * rates.vatRate;
    case 'corporate':
      return amount * rates.corporateTaxRate;
    case 'withholding':
      return amount * rates.withholdingTaxRate;
    default:
      return 0;
  }
}

export function formatFinancialAmount(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function validateBankAccount(accountNumber: string, routingNumber?: string): boolean {
  // Basic validation - in real implementation, use proper bank validation
  if (!accountNumber || accountNumber.length < 8 || accountNumber.length > 17) {
    return false;
  }
  
  if (routingNumber && routingNumber.length !== 9) {
    return false;
  }
  
  return /^\d+$/.test(accountNumber);
}

// Mock function - in real implementation, validate JWT and return user
async function getUserFromToken(token: string): Promise<any> {
  // This would integrate with the authentication service
  return {
    id: 'user-123',
    email: 'finance@hospital.com',
    role: 'finance_manager',
    department: 'finance',
    permissions: financeConfig.permissions.finance_manager,
  };
}

export default {
  validateFinanceAccess,
  withFinanceAuth,
  validateTransactionData,
  validateInvoiceData,
  validateBudgetData,
  validatePaymentData,
  checkFinancialDataAccess,
  sanitizeFinancialData,
  logFinanceActivity,
  checkApprovalRequired,
  calculateTaxes,
  formatFinancialAmount,
  validateBankAccount,
};