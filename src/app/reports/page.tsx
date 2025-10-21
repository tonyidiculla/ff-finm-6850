'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '../../context/AuthContext'

type ReportType = 'trial-balance' | 'balance-sheet' | 'income-statement' | null

interface TrialBalanceAccount {
  accountId: string
  accountCode: string
  accountName: string
  accountType: string
  normalBalance: string
  balance: number
  debitBalance: number
  creditBalance: number
}

interface TrialBalanceData {
  reportName: string
  asOfDate: string
  accounts: TrialBalanceAccount[]
  totals: {
    totalDebits: number
    totalCredits: number
    isBalanced: boolean
  }
}

interface BalanceSheetData {
  reportName: string
  asOfDate: string
  balanceSheet: {
    assets: {
      currentAssets: { accounts: any[], total: number }
      nonCurrentAssets: { accounts: any[], total: number }
      totalAssets: number
    }
    liabilities: {
      currentLiabilities: { accounts: any[], total: number }
      nonCurrentLiabilities: { accounts: any[], total: number }
      totalLiabilities: number
    }
    equity: {
      accounts: any[]
      totalEquity: number
    }
    totalLiabilitiesAndEquity: number
  }
  isBalanced: boolean
}

interface IncomeStatementData {
  reportName: string
  periodStart: string
  periodEnd: string
  incomeStatement: {
    revenue: {
      accounts: any[]
      totalRevenue: number
    }
    expenses: {
      operatingExpenses: { accounts: any[], total: number }
      nonOperatingExpenses: { accounts: any[], total: number }
      totalExpenses: number
    }
    profitMetrics: {
      grossProfit: number
      operatingIncome: number
      netIncome: number
      grossProfitMargin: number
      operatingMargin: number
      netProfitMargin: number
    }
  }
}

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<ReportType>(null)
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Start of year
    endDate: new Date().toISOString().split('T')[0] // Today
  })
  const { user } = useAuth()

  const generateReport = async (reportType: ReportType) => {
    if (!reportType) return

    setLoading(true)
    setError('')
    setSelectedReport(reportType)

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('furfield_token='))
        ?.split('=')[1]

      const headers: HeadersInit = {}
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      let url = `/api/reports/${reportType}?bookId=default`
      
      if (reportType === 'income-statement') {
        url += `&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
      } else {
        url += `&asOfDate=${dateRange.endDate}`
      }

      const response = await fetch(url, { headers })
      
      if (!response.ok) {
        throw new Error('Failed to generate report')
      }
      
      const data = await response.json()
      setReportData(data)
    } catch (err) {
      setError('Failed to generate report')
      console.error('Error generating report:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const renderTrialBalance = (data: TrialBalanceData) => (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">{data.reportName}</h3>
        <p className="text-sm text-gray-600">As of {formatDate(data.asOfDate)}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Debit</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Credit</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.accounts.map((account) => (
              <tr key={account.accountId}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{account.accountCode}</div>
                  <div className="text-sm text-gray-500">{account.accountName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-mono">
                  {account.debitBalance > 0 ? formatCurrency(account.debitBalance) : '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-mono">
                  {account.creditBalance > 0 ? formatCurrency(account.creditBalance) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr className="font-semibold">
              <td className="px-6 py-4 text-sm text-gray-900">TOTALS</td>
              <td className="px-6 py-4 text-right text-sm font-mono text-gray-900">
                {formatCurrency(data.totals.totalDebits)}
              </td>
              <td className="px-6 py-4 text-right text-sm font-mono text-gray-900">
                {formatCurrency(data.totals.totalCredits)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="px-6 py-4 bg-gray-50">
        <div className={`text-sm font-medium ${data.totals.isBalanced ? 'text-green-600' : 'text-red-600'}`}>
          {data.totals.isBalanced ? '✓ Trial Balance is balanced' : '⚠ Trial Balance is not balanced'}
        </div>
      </div>
    </div>
  )

  const renderBalanceSheet = (data: BalanceSheetData) => (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">{data.reportName}</h3>
        <p className="text-sm text-gray-600">As of {formatDate(data.asOfDate)}</p>
      </div>
      <div className="p-6 space-y-6">
        {/* Assets */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">ASSETS</h4>
          
          {/* Current Assets */}
          <div className="mb-4">
            <h5 className="text-md font-medium text-gray-700 mb-2">Current Assets</h5>
            {data.balanceSheet.assets.currentAssets.accounts.map((account: any) => (
              <div key={account.id} className="flex justify-between py-1 text-sm">
                <span className="text-gray-600">{account.code} - {account.name}</span>
                <span className="font-mono">{formatCurrency(account.balance)}</span>
              </div>
            ))}
            <div className="flex justify-between py-2 border-t border-gray-200 font-medium">
              <span>Total Current Assets</span>
              <span className="font-mono">{formatCurrency(data.balanceSheet.assets.currentAssets.total)}</span>
            </div>
          </div>

          {/* Non-Current Assets */}
          <div className="mb-4">
            <h5 className="text-md font-medium text-gray-700 mb-2">Non-Current Assets</h5>
            {data.balanceSheet.assets.nonCurrentAssets.accounts.map((account: any) => (
              <div key={account.id} className="flex justify-between py-1 text-sm">
                <span className="text-gray-600">{account.code} - {account.name}</span>
                <span className="font-mono">{formatCurrency(account.balance)}</span>
              </div>
            ))}
            <div className="flex justify-between py-2 border-t border-gray-200 font-medium">
              <span>Total Non-Current Assets</span>
              <span className="font-mono">{formatCurrency(data.balanceSheet.assets.nonCurrentAssets.total)}</span>
            </div>
          </div>

          <div className="flex justify-between py-3 border-t-2 border-gray-300 font-bold text-lg">
            <span>TOTAL ASSETS</span>
            <span className="font-mono">{formatCurrency(data.balanceSheet.assets.totalAssets)}</span>
          </div>
        </div>

        {/* Liabilities */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">LIABILITIES</h4>
          
          {/* Current Liabilities */}
          <div className="mb-4">
            <h5 className="text-md font-medium text-gray-700 mb-2">Current Liabilities</h5>
            {data.balanceSheet.liabilities.currentLiabilities.accounts.map((account: any) => (
              <div key={account.id} className="flex justify-between py-1 text-sm">
                <span className="text-gray-600">{account.code} - {account.name}</span>
                <span className="font-mono">{formatCurrency(account.balance)}</span>
              </div>
            ))}
            <div className="flex justify-between py-2 border-t border-gray-200 font-medium">
              <span>Total Current Liabilities</span>
              <span className="font-mono">{formatCurrency(data.balanceSheet.liabilities.currentLiabilities.total)}</span>
            </div>
          </div>

          <div className="flex justify-between py-3 border-t border-gray-200 font-bold">
            <span>TOTAL LIABILITIES</span>
            <span className="font-mono">{formatCurrency(data.balanceSheet.liabilities.totalLiabilities)}</span>
          </div>
        </div>

        {/* Equity */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">EQUITY</h4>
          {data.balanceSheet.equity.accounts.map((account: any) => (
            <div key={account.id} className="flex justify-between py-1 text-sm">
              <span className="text-gray-600">{account.code} - {account.name}</span>
              <span className="font-mono">{formatCurrency(account.balance)}</span>
            </div>
          ))}
          <div className="flex justify-between py-3 border-t border-gray-200 font-bold">
            <span>TOTAL EQUITY</span>
            <span className="font-mono">{formatCurrency(data.balanceSheet.equity.totalEquity)}</span>
          </div>
        </div>

        <div className="flex justify-between py-3 border-t-2 border-gray-300 font-bold text-lg">
          <span>TOTAL LIABILITIES & EQUITY</span>
          <span className="font-mono">{formatCurrency(data.balanceSheet.totalLiabilitiesAndEquity)}</span>
        </div>

        <div className={`text-sm font-medium ${data.isBalanced ? 'text-green-600' : 'text-red-600'}`}>
          {data.isBalanced ? '✓ Balance Sheet is balanced' : '⚠ Balance Sheet is not balanced'}
        </div>
      </div>
    </div>
  )

  const renderIncomeStatement = (data: IncomeStatementData) => (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">{data.reportName}</h3>
        <p className="text-sm text-gray-600">
          {formatDate(data.periodStart)} to {formatDate(data.periodEnd)}
        </p>
      </div>
      <div className="p-6 space-y-6">
        {/* Revenue */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">REVENUE</h4>
          {data.incomeStatement.revenue.accounts.map((account: any) => (
            <div key={account.id} className="flex justify-between py-1 text-sm">
              <span className="text-gray-600">{account.code} - {account.name}</span>
              <span className="font-mono">{formatCurrency(account.balance)}</span>
            </div>
          ))}
          <div className="flex justify-between py-3 border-t border-gray-200 font-bold">
            <span>TOTAL REVENUE</span>
            <span className="font-mono">{formatCurrency(data.incomeStatement.revenue.totalRevenue)}</span>
          </div>
        </div>

        {/* Expenses */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">EXPENSES</h4>
          
          {/* Operating Expenses */}
          <div className="mb-4">
            <h5 className="text-md font-medium text-gray-700 mb-2">Operating Expenses</h5>
            {data.incomeStatement.expenses.operatingExpenses.accounts.map((account: any) => (
              <div key={account.id} className="flex justify-between py-1 text-sm">
                <span className="text-gray-600">{account.code} - {account.name}</span>
                <span className="font-mono">{formatCurrency(account.balance)}</span>
              </div>
            ))}
            <div className="flex justify-between py-2 border-t border-gray-200 font-medium">
              <span>Total Operating Expenses</span>
              <span className="font-mono">{formatCurrency(data.incomeStatement.expenses.operatingExpenses.total)}</span>
            </div>
          </div>

          <div className="flex justify-between py-3 border-t border-gray-200 font-bold">
            <span>TOTAL EXPENSES</span>
            <span className="font-mono">{formatCurrency(data.incomeStatement.expenses.totalExpenses)}</span>
          </div>
        </div>

        {/* Profit Metrics */}
        <div className="border-t-2 border-gray-300 pt-4">
          <div className="space-y-2">
            <div className="flex justify-between py-2 font-medium">
              <span>Operating Income</span>
              <span className={`font-mono ${data.incomeStatement.profitMetrics.operatingIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(data.incomeStatement.profitMetrics.operatingIncome)}
              </span>
            </div>
            <div className="flex justify-between py-3 border-t border-gray-200 font-bold text-lg">
              <span>NET INCOME</span>
              <span className={`font-mono ${data.incomeStatement.profitMetrics.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(data.incomeStatement.profitMetrics.netIncome)}
              </span>
            </div>
          </div>

          {/* Profit Margins */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h5 className="text-sm font-medium text-gray-700 mb-3">Profit Margins</h5>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Operating Margin</span>
                <div className="font-mono font-medium">{data.incomeStatement.profitMetrics.operatingMargin.toFixed(1)}%</div>
              </div>
              <div>
                <span className="text-gray-600">Net Profit Margin</span>
                <div className="font-mono font-medium">{data.incomeStatement.profitMetrics.netProfitMargin.toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
              <p className="mt-2 text-sm text-gray-600">
                Generate and view key financial statements
              </p>
            </div>
            <Link
              href="/dashboard"
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              ← Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Report Selection and Controls */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Generate Report</h2>
            
            {/* Date Range Controls */}
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
              <div>
                <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  id="start-date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  id="end-date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Report Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => generateReport('trial-balance')}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {loading && selectedReport === 'trial-balance' ? 'Generating...' : 'Trial Balance'}
              </button>
              <button
                onClick={() => generateReport('balance-sheet')}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {loading && selectedReport === 'balance-sheet' ? 'Generating...' : 'Balance Sheet'}
              </button>
              <button
                onClick={() => generateReport('income-statement')}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {loading && selectedReport === 'income-statement' ? 'Generating...' : 'Income Statement'}
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Report Display */}
        {reportData && (
          <div>
            {selectedReport === 'trial-balance' && renderTrialBalance(reportData)}
            {selectedReport === 'balance-sheet' && renderBalanceSheet(reportData)}
            {selectedReport === 'income-statement' && renderIncomeStatement(reportData)}
          </div>
        )}

        {/* No Report Selected */}
        {!reportData && !loading && (
          <div className="bg-white shadow rounded-lg">
            <div className="text-center py-12">
              <div className="text-gray-400 text-xl mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a report to generate</h3>
              <p className="text-gray-600">Choose from Trial Balance, Balance Sheet, or Income Statement</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}