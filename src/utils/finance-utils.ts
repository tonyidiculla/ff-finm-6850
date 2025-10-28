// Date and Time Utilities for Finance
export function formatFinanceDate(date: string | Date, format: 'short' | 'long' | 'iso' | 'fiscal' = 'short'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    case 'long':
      return dateObj.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    case 'iso':
      return dateObj.toISOString().split('T')[0];
    case 'fiscal':
      return `FY ${getFiscalYear(dateObj)}`;
    default:
      return dateObj.toLocaleDateString();
  }
}

export function getFiscalYear(date: string | Date): number {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth(); // 0-based
  
  // Assuming fiscal year starts in January (month 0)
  // Adjust based on your organization's fiscal year
  return month >= 0 ? year : year - 1;
}

export function getFiscalQuarter(date: string | Date): number {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const month = dateObj.getMonth(); // 0-based
  
  // Assuming fiscal year starts in January
  return Math.floor(month / 3) + 1;
}

export function getBusinessDaysBetween(startDate: string | Date, endDate: string | Date): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  let businessDays = 0;
  const current = new Date(start);
  
  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
      businessDays++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return businessDays;
}

export function addBusinessDays(startDate: string | Date, days: number): Date {
  const date = typeof startDate === 'string' ? new Date(startDate) : new Date(startDate);
  let addedDays = 0;
  
  while (addedDays < days) {
    date.setDate(date.getDate() + 1);
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not weekend
      addedDays++;
    }
  }
  
  return date;
}

export function isPaymentDue(dueDate: string | Date, gracePeriod: number = 0): boolean {
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const gracePeriodEnd = new Date(due);
  gracePeriodEnd.setDate(gracePeriodEnd.getDate() + gracePeriod);
  
  return today > gracePeriodEnd;
}

// Currency and Number Formatting
export function formatCurrency(
  amount: number, 
  currency: string = 'USD', 
  locale: string = 'en-US',
  showSymbol: boolean = true
): string {
  const options: Intl.NumberFormatOptions = {
    style: showSymbol ? 'currency' : 'decimal',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };
  
  return new Intl.NumberFormat(locale, options).format(amount);
}

export function formatPercentage(value: number, decimals: number = 2, includeSymbol: boolean = true): string {
  const formatted = (value * 100).toFixed(decimals);
  return includeSymbol ? `${formatted}%` : formatted;
}

export function formatFinancialNumber(
  value: number, 
  notation: 'standard' | 'compact' | 'scientific' = 'standard'
): string {
  return new Intl.NumberFormat('en-US', {
    notation,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function parseFinancialAmount(input: string): number {
  // Remove currency symbols, commas, and whitespace
  const cleanedInput = input.replace(/[$,\s]/g, '');
  const amount = parseFloat(cleanedInput);
  
  return isNaN(amount) ? 0 : amount;
}

export function roundToDecimals(value: number, decimals: number = 2): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

// Financial Calculations
export function calculateTax(amount: number, rate: number): number {
  return roundToDecimals(amount * rate);
}

export function calculateDiscount(amount: number, discountRate: number, discountAmount?: number): number {
  if (discountAmount !== undefined) {
    return Math.min(discountAmount, amount);
  }
  return roundToDecimals(amount * discountRate);
}

export function calculateInterest(
  principal: number, 
  rate: number, 
  time: number, 
  compounding: 'simple' | 'compound' = 'simple'
): number {
  if (compounding === 'simple') {
    return roundToDecimals(principal * rate * time);
  } else {
    return roundToDecimals(principal * Math.pow(1 + rate, time) - principal);
  }
}

export function calculateROI(gain: number, cost: number): number {
  if (cost === 0) return 0;
  return roundToDecimals((gain - cost) / cost);
}

export function calculateMargin(revenue: number, costs: number): number {
  if (revenue === 0) return 0;
  return roundToDecimals((revenue - costs) / revenue);
}

export function calculateBreakEven(fixedCosts: number, pricePerUnit: number, variableCostPerUnit: number): number {
  const contributionMargin = pricePerUnit - variableCostPerUnit;
  if (contributionMargin <= 0) return Infinity;
  return Math.ceil(fixedCosts / contributionMargin);
}

// Account Number Utilities
export function generateAccountNumber(accountType: string, sequence?: number): string {
  const typeMap: { [key: string]: string } = {
    'cash': '1001',
    'accounts_receivable': '1200',
    'inventory': '1300',
    'equipment': '1500',
    'accounts_payable': '2001',
    'loans': '2100',
    'equity': '3000',
    'revenue': '4000',
    'expenses': '5000',
  };
  
  const baseCode = typeMap[accountType] || '9999';
  const seqNumber = sequence || Math.floor(Math.random() * 10000);
  
  return `${baseCode}${seqNumber.toString().padStart(4, '0')}`;
}

export function generateInvoiceNumber(prefix: string = 'INV', sequence?: number): string {
  const seq = sequence || Date.now();
  const paddedSeq = seq.toString().padStart(8, '0');
  return `${prefix}-${paddedSeq}`;
}

export function generateTransactionId(prefix: string = 'TXN'): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp.slice(-8)}-${random}`;
}

export function validateAccountNumber(accountNumber: string): boolean {
  // Basic validation - should be at least 4 digits
  const regex = /^\d{4,}$/;
  return regex.test(accountNumber);
}

// Aging Analysis
export function calculateAgingDays(dueDate: string | Date): number {
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const timeDiff = today.getTime() - due.getTime();
  return Math.max(0, Math.floor(timeDiff / (1000 * 60 * 60 * 24)));
}

export function getAgingCategory(agingDays: number): string {
  if (agingDays <= 0) return 'current';
  if (agingDays <= 30) return '1-30';
  if (agingDays <= 60) return '31-60';
  if (agingDays <= 90) return '61-90';
  if (agingDays <= 120) return '91-120';
  return 'over_120';
}

export function calculateAgingAnalysis(receivables: Array<{ amount: number; dueDate: string }>): Record<string, number> {
  const analysis: Record<string, number> = {
    'current': 0,
    '1-30': 0,
    '31-60': 0,
    '61-90': 0,
    '91-120': 0,
    'over_120': 0,
  };
  
  receivables.forEach(receivable => {
    const agingDays = calculateAgingDays(receivable.dueDate);
    const category = getAgingCategory(agingDays);
    analysis[category] += receivable.amount;
  });
  
  return analysis;
}

// Budget and Variance Analysis
export function calculateBudgetVariance(actual: number, budget: number): {
  variance: number;
  percentageVariance: number;
  favorableUnfavorable: 'favorable' | 'unfavorable' | 'neutral';
} {
  const variance = actual - budget;
  const percentageVariance = budget !== 0 ? (variance / budget) * 100 : 0;
  
  let favorableUnfavorable: 'favorable' | 'unfavorable' | 'neutral';
  if (Math.abs(variance) < 0.01) {
    favorableUnfavorable = 'neutral';
  } else if (variance > 0) {
    favorableUnfavorable = 'unfavorable'; // Assuming expenses
  } else {
    favorableUnfavorable = 'favorable';
  }
  
  return {
    variance: roundToDecimals(variance),
    percentageVariance: roundToDecimals(percentageVariance),
    favorableUnfavorable,
  };
}

export function calculateBudgetUtilization(spent: number, budget: number): number {
  if (budget === 0) return 0;
  return roundToDecimals((spent / budget) * 100);
}

// Data Validation Utilities
export function isValidFinancialAmount(amount: any): boolean {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return !isNaN(num) && isFinite(num) && num >= 0;
}

export function isValidAccountingDate(date: string): boolean {
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return false;
  
  // Check if date is not too far in the past or future
  const currentYear = new Date().getFullYear();
  const dateYear = dateObj.getFullYear();
  
  return dateYear >= (currentYear - 10) && dateYear <= (currentYear + 5);
}

export function validateCurrencyCode(code: string): boolean {
  const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR'];
  return validCurrencies.includes(code.toUpperCase());
}

// Financial Ratios and Analysis
export function calculateCurrentRatio(currentAssets: number, currentLiabilities: number): number {
  if (currentLiabilities === 0) return 0;
  return roundToDecimals(currentAssets / currentLiabilities);
}

export function calculateQuickRatio(
  currentAssets: number, 
  inventory: number, 
  currentLiabilities: number
): number {
  if (currentLiabilities === 0) return 0;
  return roundToDecimals((currentAssets - inventory) / currentLiabilities);
}

export function calculateDebtToEquityRatio(totalDebt: number, totalEquity: number): number {
  if (totalEquity === 0) return 0;
  return roundToDecimals(totalDebt / totalEquity);
}

export function calculateWorkingCapital(currentAssets: number, currentLiabilities: number): number {
  return roundToDecimals(currentAssets - currentLiabilities);
}

// Data Transformation Utilities
export function groupTransactionsByPeriod<T extends { date: string }>(
  transactions: T[],
  period: 'day' | 'week' | 'month' | 'quarter' | 'year'
): Record<string, T[]> {
  return transactions.reduce((groups, transaction) => {
    const date = new Date(transaction.date);
    let key: string;
    
    switch (period) {
      case 'day':
        key = date.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'quarter':
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        key = `${date.getFullYear()}-Q${quarter}`;
        break;
      case 'year':
        key = date.getFullYear().toString();
        break;
      default:
        key = date.toISOString().split('T')[0];
    }
    
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(transaction);
    
    return groups;
  }, {} as Record<string, T[]>);
}

export function calculateRunningBalance(
  transactions: Array<{ amount: number; type: 'debit' | 'credit' }>,
  startingBalance: number = 0
): number[] {
  const balances = [startingBalance];
  let currentBalance = startingBalance;
  
  transactions.forEach(transaction => {
    if (transaction.type === 'credit') {
      currentBalance += transaction.amount;
    } else {
      currentBalance -= transaction.amount;
    }
    balances.push(roundToDecimals(currentBalance));
  });
  
  return balances;
}

// Export and Import Utilities
export function formatForExport(data: any[], format: 'csv' | 'json' | 'excel'): string | any[] {
  switch (format) {
    case 'csv':
      if (data.length === 0) return '';
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(item => 
        Object.values(item).map(value => 
          typeof value === 'string' ? `"${value}"` : value
        ).join(',')
      );
      return [headers, ...rows].join('\n');
    
    case 'json':
      return JSON.stringify(data, null, 2);
    
    case 'excel':
      // Return data in a format suitable for Excel export libraries
      return data;
    
    default:
      return data;
  }
}

export function sanitizeForFinanceExport(data: any): any {
  // Remove sensitive fields before export
  const sensitiveFields = ['ssn', 'bankAccount', 'creditCard', 'password'];
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForFinanceExport(item));
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {};
    Object.keys(data).forEach(key => {
      if (!sensitiveFields.includes(key.toLowerCase())) {
        sanitized[key] = sanitizeForFinanceExport(data[key]);
      }
    });
    return sanitized;
  }
  
  return data;
}

// Performance Optimization Utilities
export function debounceFinanceOperation<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function memoizeFinancialCalculation<T extends (...args: any[]) => any>(
  fn: T
): T {
  const cache = new Map();
  
  return ((...args: any[]) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    // Clear cache if it gets too large
    if (cache.size > 1000) {
      cache.clear();
    }
    
    return result;
  }) as T;
}

export default {
  // Date utilities
  formatFinanceDate,
  getFiscalYear,
  getFiscalQuarter,
  getBusinessDaysBetween,
  addBusinessDays,
  isPaymentDue,
  
  // Currency utilities
  formatCurrency,
  formatPercentage,
  formatFinancialNumber,
  parseFinancialAmount,
  roundToDecimals,
  
  // Financial calculations
  calculateTax,
  calculateDiscount,
  calculateInterest,
  calculateROI,
  calculateMargin,
  calculateBreakEven,
  
  // Account utilities
  generateAccountNumber,
  generateInvoiceNumber,
  generateTransactionId,
  validateAccountNumber,
  
  // Aging analysis
  calculateAgingDays,
  getAgingCategory,
  calculateAgingAnalysis,
  
  // Budget analysis
  calculateBudgetVariance,
  calculateBudgetUtilization,
  
  // Validation
  isValidFinancialAmount,
  isValidAccountingDate,
  validateCurrencyCode,
  
  // Financial ratios
  calculateCurrentRatio,
  calculateQuickRatio,
  calculateDebtToEquityRatio,
  calculateWorkingCapital,
  
  // Data transformation
  groupTransactionsByPeriod,
  calculateRunningBalance,
  
  // Export utilities
  formatForExport,
  sanitizeForFinanceExport,
  
  // Performance utilities
  debounceFinanceOperation,
  memoizeFinancialCalculation,
};