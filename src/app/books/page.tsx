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
  const [entities, setEntities] = useState<any[]>([]) // Entity type from ff-orgn-6820
  const [loading, setLoading] = useState(true)
  const [entitiesLoading, setEntitiesLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [autoPopulated, setAutoPopulated] = useState({
    currency: false,
    accountingStandard: false
  })
  const [formData, setFormData] = useState({
    organizationPlatformId: orgId || '',
    entityPlatformId: '',
    entityName: '',
    entityType: 'hospital' as Book['entityType'],
    name: '',
    type: 'general-ledger' as Book['type'],
    countryCode: 'IN',
    currency: 'INR',
    fyStartMonth: 4,
    accountingStandard: 'GAAP' as Book['accountingStandard'],
    description: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  // Load entities when organization is selected
  useEffect(() => {
    if (formData.organizationPlatformId) {
      loadEntities(formData.organizationPlatformId)
    } else {
      setEntities([])
    }
  }, [formData.organizationPlatformId])

  async function loadData() {
    try {
      const [booksRes, orgsRes] = await Promise.all([
        fetch('/api/books'),
        fetch('/api/organizations')
      ])
      
      const booksData = await booksRes.json()
      const orgsData = await orgsRes.json()
      
      // Ensure we always have arrays
      setBooks(Array.isArray(booksData) ? booksData : [])
      setOrganizations(Array.isArray(orgsData) ? orgsData : [])
    } catch (error) {
      console.error('Failed to load data:', error)
      // Set empty arrays on error
      setBooks([])
      setOrganizations([])
    } finally {
      setLoading(false)
    }
  }

  async function loadEntities(organizationPlatformId: string) {
    try {
      setEntitiesLoading(true)
      const response = await fetch(`/api/entities?organizationPlatformId=${organizationPlatformId}`)
      const entitiesData = await response.json()
      setEntities(Array.isArray(entitiesData) ? entitiesData : [])
    } catch (error) {
      console.error('Failed to load entities:', error)
      setEntities([])
    } finally {
      setEntitiesLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    console.log('Form submitted with data:', formData)
    
    setSubmitting(true)
    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        console.log('Book created successfully')
        setFormData({
          organizationPlatformId: orgId || '',
          entityPlatformId: '',
          entityName: '',
          entityType: 'hospital' as Book['entityType'],
          name: '',
          type: 'general-ledger' as Book['type'],
          countryCode: 'IN',
          currency: 'INR',
          fyStartMonth: 4,
          accountingStandard: 'GAAP' as Book['accountingStandard'],
          description: ''
        })
        setAutoPopulated({
          currency: false,
          accountingStandard: false
        })
        setShowForm(false)
        loadData()
      } else {
        console.error('Failed to create book:', await response.text())
      }
    } catch (error) {
      console.error('Failed to create book:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const filteredBooks = orgId ? books.filter(book => book.organizationPlatformId === orgId) : books
  const getOrganizationName = (orgPlatformId: string) => {
    if (!Array.isArray(organizations)) {
      console.warn('Organizations is not an array:', organizations)
      return 'Unknown Organization'
    }
    const org = organizations.find(o => o.platformId === orgPlatformId)
    return org ? org.name : 'Unknown Organization'
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
              <Link href="/" className="text-xl font-bold text-gray-900">
                MYCE
              </Link>
              <div className="ml-10 flex space-x-8">
                <Link href="/books" className="text-blue-600 hover:text-blue-900 px-3 py-2 text-sm font-medium border-b-2 border-blue-600">
                  Books
                </Link>
                <Link href="/accounts" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
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
              Books {orgId && Array.isArray(organizations) && organizations.find(o => o.id === orgId) && 
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
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* Organization and Entity Selection - Side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="organizationId" className="block text-sm font-medium text-gray-700">
                      Organization
                    </label>
                    <select
                      id="organizationId"
                      required
                      value={formData.organizationPlatformId}
                      onChange={(e) => setFormData(prev => ({ ...prev, organizationPlatformId: e.target.value }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                    >
                      <option value="">Select Organization</option>
                      {organizations.map((org) => (
                        <option key={org.id} value={org.platformId}>{org.name}</option>
                      ))}
                    </select>
                    <p className="mt-1 text-sm text-gray-500">
                      Organizations are managed by the Organization Management service
                    </p>
                  </div>

                  {/* Entity Selection - Only show when organization is selected */}
                  {formData.organizationPlatformId && (
                    <div>
                      <label htmlFor="entitySelect" className="block text-sm font-medium text-gray-700">
                        Select Entity/Hospital
                      </label>
                      <select
                        id="entitySelect"
                        required
                        value={formData.entityPlatformId}
                        onChange={async (e) => {
                          const selectedEntity = entities.find(entity => entity.entityPlatformId === e.target.value)
                          if (selectedEntity) {
                            // Auto-populate based on entity country
                            let locationData = null
                            let autoPopulationFlags = {
                              currency: false,
                              accountingStandard: false
                            }

                            if (selectedEntity.country) {
                              try {
                                const response = await fetch(`/api/location-data?countryCode=${selectedEntity.country}`)
                                if (response.ok) {
                                  locationData = await response.json()
                                  autoPopulationFlags = {
                                    currency: true,
                                    accountingStandard: true
                                  }
                                }
                              } catch (error) {
                                console.error('Failed to fetch location data:', error)
                              }
                            }

                            setAutoPopulated(autoPopulationFlags)
                            setFormData(prev => ({ 
                              ...prev, 
                              entityPlatformId: selectedEntity.entityPlatformId,
                              entityName: selectedEntity.entityName,
                              entityType: selectedEntity.entityType,
                              // Auto-populate based on entity's country
                              countryCode: locationData ? locationData.countryCode : prev.countryCode,
                              currency: locationData ? locationData.currencyCode : prev.currency,
                              accountingStandard: locationData ? locationData.accountingStandard : prev.accountingStandard
                            }))
                          } else {
                            // Clear entity data when no entity is selected
                            setAutoPopulated({
                              currency: false,
                              accountingStandard: false
                            })
                            setFormData(prev => ({ 
                              ...prev, 
                              entityPlatformId: '',
                              entityName: '',
                              entityType: 'hospital' as Book['entityType']
                            }))
                          }
                        }}
                        disabled={entitiesLoading}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                      >
                        <option value="">
                          {entitiesLoading ? 'Loading entities...' : 'Select Entity/Hospital'}
                        </option>
                        {entities.map((entity) => (
                          <option key={entity.entityPlatformId} value={entity.entityPlatformId}>
                            {entity.entityName}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-sm text-gray-500">
                        Choose the hospital or business entity for this accounting book
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Selected Entity Information - Read-only display */}
                {formData.entityPlatformId && (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Entity Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Platform ID:</span>
                        <div className="font-mono text-gray-900">{formData.entityPlatformId}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Entity Name:</span>
                        <div className="font-medium text-gray-900">{formData.entityName}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Entity Type:</span>
                        <div className="font-medium text-gray-900 capitalize">{formData.entityType}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Country:</span>
                        <div className="font-medium text-gray-900">
                          {entities.find(e => e.entityPlatformId === formData.entityPlatformId)?.country || 'Not specified'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Book Details - Compact Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <label htmlFor="type" className="flex items-center text-sm font-medium text-gray-700">
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
                </div>

                {/* Configuration - Three columns for better space usage */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="accountingStandard" className="flex items-center text-sm font-medium text-gray-700">
                      Accounting Standard{autoPopulated.accountingStandard && <span className="text-blue-500">*</span>}
                      <InfoTooltip content="GAAP (Generally Accepted Accounting Principles) for US companies, IFRS (International Financial Reporting Standards) for international companies, or Other for local standards." />
                    </label>
                    <select
                      id="accountingStandard"
                      value={formData.accountingStandard}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, accountingStandard: e.target.value as Book['accountingStandard'] }))
                        // Clear auto-population flag when manually changed
                        setAutoPopulated(prev => ({ ...prev, accountingStandard: false }))
                      }}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                    >
                      <option value="GAAP">GAAP (US Standards)</option>
                      <option value="IFRS">IFRS (International Standards)</option>
                      <option value="Other">Other Standards</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                      Currency{autoPopulated.currency && <span className="text-blue-500">*</span>}
                    </label>
                    <select
                      id="currency"
                      value={formData.currency}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, currency: e.target.value }))
                        // Clear auto-population flag when manually changed
                        setAutoPopulated(prev => ({ ...prev, currency: false }))
                      }}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                    >
                      <option value="USD">US Dollar (USD)</option>
                      <option value="EUR">Euro (EUR)</option>
                      <option value="GBP">British Pound (GBP)</option>
                      <option value="INR">Indian Rupee (INR)</option>
                      <option value="LKR">Sri Lankan Rupee (LKR)</option>
                      <option value="AED">UAE Dirham (AED)</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="fyStartMonth" className="flex items-center text-sm font-medium text-gray-700">
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
                </div>

                {/* Description - Full width */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                    placeholder="Optional description of this book's purpose..."
                  />
                </div>
                
                {/* Auto-population explanation */}
                {(autoPopulated.currency || autoPopulated.accountingStandard) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="text-sm text-blue-700">
                      <span className="text-blue-500">*</span> Fields marked with an asterisk were auto-populated based on the selected entity's country. You can change these values if needed.
                    </p>
                  </div>
                )}
                
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={!formData.organizationPlatformId || !formData.entityPlatformId || !formData.name.trim() || submitting}
                    onClick={(e) => {
                      console.log('Create Book button clicked', {
                        disabled: !formData.organizationPlatformId || !formData.entityPlatformId || !formData.name.trim() || submitting,
                        formData: formData,
                        submitting: submitting
                      })
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Creating...' : 'Create Book'}
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
                        Country
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
                            {getOrganizationName(book.organizationPlatformId)}
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
                          {book.countryCode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getMonthName(book.fyStartMonth)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDisplayDate(book.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/accounts?bookId=${book.id}`}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Chart of Accounts
                          </Link>
                          <Link
                            href={`/books/${book.id}`}
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