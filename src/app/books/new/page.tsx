'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Book, Organization } from '@/types/accounting'
import InfoTooltip from '@/components/InfoTooltip'

export default function NewBookPage() {
  const router = useRouter()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [entities, setEntities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [entitiesLoading, setEntitiesLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [autoPopulated, setAutoPopulated] = useState({
    currency: false,
    accountingStandard: false
  })
  const [formData, setFormData] = useState({
    organizationPlatformId: '',
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
    loadOrganizations()
  }, [])

  useEffect(() => {
    if (formData.organizationPlatformId) {
      loadEntities(formData.organizationPlatformId)
    } else {
      setEntities([])
    }
  }, [formData.organizationPlatformId])

  async function loadOrganizations() {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('furfield_token='))
        ?.split('=')[1]

      const headers: HeadersInit = {}
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const orgsRes = await fetch('/api/organizations', { headers })
      if (!orgsRes.ok) throw new Error('Failed to fetch organizations')
      
      const orgsData = await orgsRes.json()
      setOrganizations(orgsData)
    } catch (error) {
      console.error('Failed to load organizations:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadEntities(orgPlatformId: string) {
    try {
      setEntitiesLoading(true)
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('furfield_token='))
        ?.split('=')[1]

      const headers: HeadersInit = {}
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`/api/entities?organizationId=${orgPlatformId}`, { headers })
      if (!response.ok) throw new Error('Failed to fetch entities')
      
      const data = await response.json()
      setEntities(data)
    } catch (error) {
      console.error('Failed to load entities:', error)
      setEntities([])
    } finally {
      setEntitiesLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('furfield_token='))
        ?.split('=')[1]

      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      }
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch('/api/books', {
        method: 'POST',
        headers,
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create book')
      }

      router.push('/books')
    } catch (error) {
      console.error('Failed to create book:', error)
      alert(error instanceof Error ? error.message : 'Failed to create book')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                MYCE
              </Link>
              <div className="ml-10 flex space-x-8">
                <Link href="/books" className="text-blue-600 hover:text-blue-800 px-3 py-2 text-sm font-medium">
                  ← Back to Books
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Book</h1>
          <p className="mt-2 text-gray-600">
            Set up a new accounting book for an entity
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="organizationId" className="block text-sm font-medium text-gray-700">
                  Organization *
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
              </div>

              {formData.organizationPlatformId && (
                <div>
                  <label htmlFor="entitySelect" className="block text-sm font-medium text-gray-700">
                    Select Entity/Hospital *
                  </label>
                  <select
                    id="entitySelect"
                    required
                    value={formData.entityPlatformId}
                    onChange={async (e) => {
                      const selectedEntity = entities.find(entity => entity.entityPlatformId === e.target.value)
                      if (selectedEntity) {
                        let autoPopulationFlags = {
                          currency: false,
                          accountingStandard: false
                        }

                        if (selectedEntity.country) {
                          try {
                            const response = await fetch(`/api/location-data?countryCode=${selectedEntity.country}`)
                            if (response.ok) {
                              const locationData = await response.json()
                              autoPopulationFlags = {
                                currency: true,
                                accountingStandard: true
                              }
                              
                              setFormData(prev => ({
                                ...prev,
                                entityPlatformId: e.target.value,
                                entityName: selectedEntity.entityName,
                                countryCode: selectedEntity.country,
                                currency: locationData.currency || 'INR',
                                accountingStandard: locationData.accountingStandard || 'GAAP',
                                fyStartMonth: locationData.fyStartMonth || 4
                              }))
                            }
                          } catch (error) {
                            console.error('Failed to fetch location data:', error)
                            setFormData(prev => ({
                              ...prev,
                              entityPlatformId: e.target.value,
                              entityName: selectedEntity.entityName,
                              countryCode: selectedEntity.country
                            }))
                          }
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            entityPlatformId: e.target.value,
                            entityName: selectedEntity.entityName
                          }))
                        }
                        
                        setAutoPopulated(autoPopulationFlags)
                      }
                    }}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                    disabled={entitiesLoading}
                  >
                    <option value="">
                      {entitiesLoading ? 'Loading entities...' : 'Select Entity'}
                    </option>
                    {entities.map((entity) => (
                      <option key={entity.entityPlatformId} value={entity.entityPlatformId}>
                        {entity.entityName}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Book Name *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                placeholder="e.g., Main Ledger 2024-2025"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 flex items-center">
                  Book Type *
                  <InfoTooltip content="General Ledger is for standard double-entry bookkeeping. Project-based is for tracking specific projects or cost centers." />
                </label>
                <select
                  id="type"
                  required
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Book['type'] }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                >
                  <option value="general-ledger">General Ledger</option>
                  <option value="project-based">Project-Based</option>
                </select>
              </div>

              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                  Currency * {autoPopulated.currency && <span className="text-xs text-green-600">(Auto-populated)</span>}
                </label>
                <select
                  id="currency"
                  required
                  value={formData.currency}
                  onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fyStartMonth" className="block text-sm font-medium text-gray-700">
                  Fiscal Year Start Month *
                </label>
                <select
                  id="fyStartMonth"
                  required
                  value={formData.fyStartMonth}
                  onChange={(e) => setFormData(prev => ({ ...prev, fyStartMonth: parseInt(e.target.value) }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <option key={month} value={month}>
                      {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="accountingStandard" className="block text-sm font-medium text-gray-700">
                  Accounting Standard * {autoPopulated.accountingStandard && <span className="text-xs text-green-600">(Auto-populated)</span>}
                </label>
                <select
                  id="accountingStandard"
                  required
                  value={formData.accountingStandard}
                  onChange={(e) => setFormData(prev => ({ ...prev, accountingStandard: e.target.value as Book['accountingStandard'] }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                >
                  <option value="GAAP">GAAP</option>
                  <option value="IFRS">IFRS</option>
                  <option value="IndAS">IndAS</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                placeholder="Optional description for this book"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Link
                href="/books"
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
              >
                {submitting ? 'Creating...' : 'Create Book'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
