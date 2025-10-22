'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Account, AccountType } from '@/types/accounting'
import { useAuth } from '../../context/AuthContext'

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<AccountType | 'all'>('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    loadAccounts()
  }, [])

  useEffect(() => {
    filterAccounts()
  }, [accounts, searchTerm, filterType])

  const loadAccounts = async () => {
    try {
      setLoading(true)
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('furfield_token='))
        ?.split('=')[1]

      const headers: HeadersInit = {}
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch('/api/accounts', { headers })
      
      if (!response.ok) {
        throw new Error('Failed to fetch accounts')
      }
      
      const accountsData = await response.json()
      setAccounts(accountsData)
    } catch (err) {
      setError('Failed to load accounts')
      console.error('Error loading accounts:', err)
    } finally {
      setLoading(false)
    }
  }

  const filterAccounts = () => {
    let filtered = accounts

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(account => 
        account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(account => account.type === filterType)
    }

    setFilteredAccounts(filtered)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getAccountTypeColor = (type: AccountType) => {
    const colors = {
      asset: 'bg-green-100 text-green-800',
      current_asset: 'bg-green-100 text-green-800',
      non_current_asset: 'bg-green-100 text-green-800',
      liability: 'bg-red-100 text-red-800',
      current_liability: 'bg-red-100 text-red-800',
      non_current_liability: 'bg-red-100 text-red-800',
      equity: 'bg-blue-100 text-blue-800',
      retained_earnings: 'bg-blue-100 text-blue-800',
      revenue: 'bg-purple-100 text-purple-800',
      income: 'bg-purple-100 text-purple-800',
      expense: 'bg-orange-100 text-orange-800',
      operating_expense: 'bg-orange-100 text-orange-800',
      non_operating_expense: 'bg-orange-100 text-orange-800',
      contra_asset: 'bg-gray-100 text-gray-800',
      contra_liability: 'bg-gray-100 text-gray-800',
      contra_income: 'bg-gray-100 text-gray-800',
      contra_expense: 'bg-gray-100 text-gray-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const accountTypes: Array<{ value: AccountType | 'all', label: string }> = [
    { value: 'all', label: 'All Types' },
    { value: 'asset', label: 'Assets' },
    { value: 'current_asset', label: 'Current Assets' },
    { value: 'non_current_asset', label: 'Non-Current Assets' },
    { value: 'liability', label: 'Liabilities' },
    { value: 'current_liability', label: 'Current Liabilities' },
    { value: 'non_current_liability', label: 'Non-Current Liabilities' },
    { value: 'equity', label: 'Equity' },
    { value: 'revenue', label: 'Revenue' },
    { value: 'expense', label: 'Expenses' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Chart of Accounts</h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage your accounting structure and account hierarchy
              </p>
            </div>
            <div className="flex space-x-3">
              <Link
                href="/"
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                ← Dashboard
              </Link>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                + New Account
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="flex-1">
                <label htmlFor="search" className="sr-only">Search accounts</label>
                <input
                  type="text"
                  id="search"
                  placeholder="Search accounts by name, code, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Type Filter */}
              <div className="w-full sm:w-48">
                <label htmlFor="type-filter" className="sr-only">Filter by type</label>
                <select
                  id="type-filter"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as AccountType | 'all')}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {accountTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Accounts Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">
                Accounts ({filteredAccounts.length})
              </h2>
              <div className="text-sm text-gray-500">
                Total Balance: {formatCurrency(filteredAccounts.reduce((sum, acc) => sum + acc.balance, 0))}
              </div>
            </div>
          </div>
          
          {filteredAccounts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-xl mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {accounts.length === 0 ? 'No accounts yet' : 'No accounts match your filters'}
              </h3>
              <p className="text-gray-600 mb-4">
                {accounts.length === 0 
                  ? 'Create your first account to get started' 
                  : 'Try adjusting your search or filter criteria'}
              </p>
              {accounts.length === 0 && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Create Account
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Normal Balance
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Balance
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAccounts.map((account) => (
                    <tr key={account.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900 mr-2">
                              {account.code}
                            </span>
                            <span className="text-sm text-gray-900">
                              {account.name}
                            </span>
                          </div>
                          {account.description && (
                            <div className="text-sm text-gray-500 mt-1">
                              {account.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAccountTypeColor(account.type)}`}>
                          {account.type.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`capitalize ${account.normalBalance === 'debit' ? 'text-green-600' : 'text-red-600'}`}>
                          {account.normalBalance}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-mono">
                        <span className={account.balance >= 0 ? 'text-gray-900' : 'text-red-600'}>
                          {formatCurrency(account.balance)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          account.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {account.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                          Edit
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Account Modal - placeholder for now */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">New Account</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Account creation form will be implemented next.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Create Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}