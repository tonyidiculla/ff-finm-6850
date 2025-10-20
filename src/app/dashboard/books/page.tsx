'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Book, Organization } from '@/types/accounting'
import { formatDisplayDate, getMonthName } from '@/lib/utils/date'
import InfoTooltip from '@/components/InfoTooltip'

function BooksPageContent() {
  const searchParams = useSearchParams()
  const orgId = searchParams.get('orgId')
  
  const [books, setBooks] = useState<Book[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    organizationId: orgId || '',
    name: '',
    type: 'general-ledger' as Book['type'],
    baseCurrency: 'INR',
    fyStartMonth: 4,
    accountingStandard: 'GAAP' as Book['accountingStandard'],
    description: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [booksRes, orgsRes] = await Promise.all([
        fetch('/api/books'),
        fetch('/api/organizations')
      ])
      
      const booksData = await booksRes.json()
      const orgsData = await orgsRes.json()
      
      setBooks(booksData)
      setOrganizations(orgsData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({
          organizationId: orgId || '',
          name: '',
          type: 'general-ledger' as Book['type'],
          baseCurrency: 'INR',
          fyStartMonth: 4,
          accountingStandard: 'GAAP' as Book['accountingStandard'],
          description: ''
        })
        setShowForm(false)
        loadData()
      }
    } catch (error) {
      console.error('Failed to create book:', error)
    }
  }

  const filteredBooks = orgId ? books.filter(book => book.organizationId === orgId) : books
  const getOrganizationName = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId)
    return org?.name || 'Unknown'
  }

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
                <Link href="/dashboard/organizations" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Organizations
                </Link>
                <Link href="/dashboard/books" className="text-blue-600 hover:text-blue-900 px-3 py-2 text-sm font-medium border-b-2 border-blue-600">
                  Books
                </Link>
                <Link href="/dashboard/accounts" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
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
              Books {orgId && organizations.find(o => o.id === orgId) && 
                `for ${organizations.find(o => o.id === orgId)?.name}`}
              <InfoTooltip content="An accounting book is a complete set of financial records for a specific period or business unit. Each book has its own base currency, fiscal year settings, and chart of accounts." />
            </h1>
            <p className="mt-2 text-gray-600">Manage accounting books and fiscal configurations</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            New Book
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Create New Book</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="organizationId" className="block text-sm font-medium text-gray-700">
                    Organization
                  </label>
                  <select
                    id="organizationId"
                    required
                    value={formData.organizationId}
                    onChange={(e) => setFormData(prev => ({ ...prev, organizationId: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                  >
                    <option value="">Select Organization</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Book Name
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
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 flex items-center">
                    Book Type
                    <InfoTooltip content="Type of accounting book: General Ledger (main books), Subsidiary (departmental), Cash/Accrual basis, Consolidation (group companies), Budget, or Statistical (non-financial data)." />
                  </label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Book['type'] }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                  >
                    <option value="general-ledger">General Ledger</option>
                    <option value="subsidiary">Subsidiary Ledger</option>
                    <option value="cash-basis">Cash Basis</option>
                    <option value="accrual-basis">Accrual Basis</option>
                    <option value="consolidation">Consolidation</option>
                    <option value="budget">Budget</option>
                    <option value="statistical">Statistical</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="accountingStandard" className="block text-sm font-medium text-gray-700 flex items-center">
                    Accounting Standard
                    <InfoTooltip content="GAAP (Generally Accepted Accounting Principles) for US companies, IFRS (International Financial Reporting Standards) for international companies, or Other for local standards." />
                  </label>
                  <select
                    id="accountingStandard"
                    value={formData.accountingStandard}
                    onChange={(e) => setFormData(prev => ({ ...prev, accountingStandard: e.target.value as Book['accountingStandard'] }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                  >
                    <option value="GAAP">GAAP (US Standards)</option>
                    <option value="IFRS">IFRS (International Standards)</option>
                    <option value="Other">Other Standards</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                    placeholder="Optional description of this book's purpose..."
                  />
                </div>
                <div>
                  <label htmlFor="baseCurrency" className="block text-sm font-medium text-gray-700">
                    Base Currency
                  </label>
                  <select
                    id="baseCurrency"
                    value={formData.baseCurrency}
                    onChange={(e) => setFormData(prev => ({ ...prev, baseCurrency: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="INR">INR - Indian Rupee</option>
                    <option value="LKR">LKR - Sri Lankan Rupee</option>
                    <option value="AED">AED - UAE Dirham</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="fyStartMonth" className="block text-sm font-medium text-gray-700 flex items-center">
                    Fiscal Year Start Month
                    <InfoTooltip content="The month when your company's financial year begins. Common choices: January (calendar year), April (many countries including India), or July (some businesses). This affects financial reporting periods." />
                  </label>
                  <select
                    id="fyStartMonth"
                    value={formData.fyStartMonth}
                    onChange={(e) => setFormData(prev => ({ ...prev, fyStartMonth: parseInt(e.target.value) }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <option key={month} value={month}>
                        {getMonthName(month)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Create Book
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

        {/* Books List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {filteredBooks.length > 0 ? (
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      {!orgId && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Organization
                        </th>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Standard
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Currency
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center">
                        FY Start
                        <InfoTooltip content="Financial Year start month for this book. Determines reporting periods and fiscal calendar." />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBooks.map((book) => (
                      <tr key={book.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {book.name}
                        </td>
                        {!orgId && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {getOrganizationName(book.organizationId)}
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {book.type?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'General Ledger'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {book.accountingStandard || 'GAAP'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {book.baseCurrency}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getMonthName(book.fyStartMonth)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDisplayDate(book.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/dashboard/accounts?bookId=${book.id}`}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Chart of Accounts
                          </Link>
                          <Link
                            href={`/dashboard/books/${book.id}`}
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
            ) : (
              <div className="text-center py-12">
                <h3 className="mt-2 text-sm font-medium text-gray-900">No books</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating your first accounting book.</p>
                <div className="mt-6">
                  <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Create Book
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

export default function BooksPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <BooksPageContent />
    </Suspense>
  )
}