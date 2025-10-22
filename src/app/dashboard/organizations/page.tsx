'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Organization } from '@/types/accounting'
import { formatDisplayDate } from '@/lib/utils/date'
import InfoTooltip from '@/components/InfoTooltip'

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrganizations()
  }, [])

  async function loadOrganizations() {
    try {
      const response = await fetch('/api/organizations')
      const data = await response.json()
      setOrganizations(data)
    } catch (error) {
      console.error('Failed to load organizations:', error)
    } finally {
      setLoading(false)
    }
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
                <Link href="/dashboard/organizations" className="text-blue-600 hover:text-blue-900 px-3 py-2 text-sm font-medium border-b-2 border-blue-600">
                  Organizations
                </Link>
                <Link href="/dashboard/books" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
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
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              Organizations
              <InfoTooltip content="A legal entity or company. Organizations are the top-level structure that contain multiple accounting books for different business units, periods, or subsidiaries." />
            </h1>
            <p className="mt-2 text-gray-600">View organizations (managed by Organization Management service)</p>
          </div>
          
          {/* Info Banner */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Organizations are created and managed by the Organization Management service (ff-orgn-6820). 
                  This page shows read-only information for reference when creating accounting books.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Organizations List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {organizations.length > 0 ? (
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Country
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
                    {organizations.map((org) => (
                      <tr key={org.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {org.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {org.countryCode || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDisplayDate(org.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/dashboard/books?orgId=${org.id}`}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Manage Books
                          </Link>
                          <Link
                            href={`/dashboard/organizations/${org.id}`}
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
                <h3 className="mt-2 text-sm font-medium text-gray-900">No organizations available</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Organizations must be created through the Organization Management service.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}