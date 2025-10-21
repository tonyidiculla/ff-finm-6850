'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Account, Book } from '@/types/accounting'
import InfoTooltip from '@/components/InfoTooltip'

function AccountsPageContent() {
  const searchParams = useSearchParams()
  const bookId = searchParams.get('bookId')
  
  const [accounts, setAccounts] = useState<Account[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showTemplateForm, setShowTemplateForm] = useState(false)
  const [formData, setFormData] = useState({
    bookId: bookId || '',
    name: '',
    type: 'asset' as Account['type'],
    code: '',
    parentId: ''
  })
  const [templateForm, setTemplateForm] = useState({
    bookId: bookId || '',
    template: 'simple-business'
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [accountsRes, booksRes] = await Promise.all([
        fetch('/api/accounts'),
        fetch('/api/books')
      ])
      
      const accountsData = await accountsRes.json()
      const booksData = await booksRes.json()
      
      setAccounts(accountsData)
      setBooks(booksData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({
          bookId: bookId || '',
          name: '',
          type: 'asset',
          code: '',
          parentId: ''
        })
        setShowForm(false)
        loadData()
      }
    } catch (error) {
      console.error('Failed to create account:', error)
    }
  }

  async function handleTemplateSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const response = await fetch('/api/accounts/from-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateForm),
      })

      if (response.ok) {
        setShowTemplateForm(false)
        loadData()
      }
    } catch (error) {
      console.error('Failed to create accounts from template:', error)
    }
  }

  const filteredAccounts = bookId ? accounts.filter(account => account.bookId === bookId) : accounts
  const getBookName = (bookId: string) => {
    const book = books.find(b => b.id === bookId)
    return book?.name || 'Unknown'
  }

  const accountsByType = filteredAccounts.reduce((acc, account) => {
    if (!acc[account.type]) acc[account.type] = []
    acc[account.type].push(account)
    return acc
  }, {} as Record<string, Account[]>)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-gray-900">
                MYCE
              </Link>
              <div className="ml-10 flex space-x-8">
                <Link href="/dashboard/books" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Books
                </Link>
                <Link href="/dashboard/accounts" className="text-blue-600 hover:text-blue-900 px-3 py-2 text-sm font-medium border-b-2 border-blue-600">
                  Chart of Accounts
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              Chart of Accounts {bookId && books.find(b => b.id === bookId) && 
                `for ${books.find(b => b.id === bookId)?.name}`}
              <InfoTooltip content="Chart of Accounts (COA) is a complete list of all accounts used in your accounting system. It includes Assets, Liabilities, Equity, Revenue, and Expense accounts with unique codes and balances." />
            </h1>
            <p className="mt-2 text-gray-600">Manage your accounts and account structure</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowTemplateForm(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              From Template
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              New Account
            </button>
          </div>
        </div>

        {/* Template Form */}
        {showTemplateForm && (
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Create Chart of Accounts from Template</h3>
              <form onSubmit={handleTemplateSubmit} className="space-y-4">
                <div>
                  <label htmlFor="templateBookId" className="block text-sm font-medium text-gray-700">
                    Book
                  </label>
                  <select
                    id="templateBookId"
                    required
                    value={templateForm.bookId}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, bookId: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                  >
                    <option value="">Select Book</option>
                    {books.map((book) => (
                      <option key={book.id} value={book.id}>{book.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="template" className="block text-sm font-medium text-gray-700">
                    Template
                  </label>
                  <select
                    id="template"
                    value={templateForm.template}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, template: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                  >
                    <option value="simple-business">Simple Business</option>
                    <option value="retail">Retail</option>
                    <option value="service">Service Business</option>
                  </select>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Create from Template
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTemplateForm(false)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Manual Account Form */}
        {showForm && (
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Create New Account</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="bookId" className="block text-sm font-medium text-gray-700">
                    Book
                  </label>
                  <select
                    id="bookId"
                    required
                    value={formData.bookId}
                    onChange={(e) => setFormData(prev => ({ ...prev, bookId: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                  >
                    <option value="">Select Book</option>
                    {books.map((book) => (
                      <option key={book.id} value={book.id}>{book.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                    Account Code
                  </label>
                  <input
                    type="text"
                    id="code"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                  />
                </div>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Account Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                  />
                </div>
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                    Account Type
                  </label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Account['type'] }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                  >
                    <option value="asset">Asset</option>
                    <option value="liability">Liability</option>
                    <option value="equity">Equity</option>
                    <option value="revenue">Revenue</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Create Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Accounts List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {filteredAccounts.length > 0 ? (
              <div>
                {Object.entries(accountsByType).map(([type, typeAccounts]) => (
                  <div key={type} className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 capitalize">
                      {type} Accounts ({typeAccounts.length})
                    </h3>
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Code
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            {!bookId && (
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Book
                              </th>
                            )}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Balance
                            </th>
                            <th className="relative px-6 py-3">
                              <span className="sr-only">Actions</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {typeAccounts.map((account) => (
                            <tr key={account.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                {account.code}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {account.name}
                              </td>
                              {!bookId && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {getBookName(account.bookId)}
                                </td>
                              )}
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {account.balance?.toFixed(2) || '0.00'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Link
                                  href={`/dashboard/accounts/${account.id}`}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  View
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="mt-2 text-sm font-medium text-gray-900">No accounts</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating accounts or using a template.</p>
                <div className="mt-6 flex justify-center space-x-3">
                  <button
                    onClick={() => setShowTemplateForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    From Template
                  </button>
                  <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Create Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AccountsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <AccountsPageContent />
    </Suspense>
  )
}