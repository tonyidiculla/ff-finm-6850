'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Journal, Account } from '@/types/accounting'
import { useAuth } from '../../context/AuthContext'
import JournalEntryForm from '@/components/JournalEntryForm'

interface JournalWithEntries extends Journal {
  entries: Array<{
    id: string
    accountId: string
    accountName: string
    accountCode: string
    description: string
    amountDc: number
  }>
  totalDebit: number
  totalCredit: number
}

export default function TransactionsPage() {
  const [journals, setJournals] = useState<JournalWithEntries[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    loadJournals()
  }, [])

  const loadJournals = async () => {
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

      const response = await fetch('/api/journals', { headers })
      
      if (!response.ok) {
        throw new Error('Failed to fetch journals')
      }
      
      const data = await response.json()
      setJournals(data.journals || [])
    } catch (err) {
      setError('Failed to load transactions')
      console.error('Error loading journals:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount))
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Journal Entries</h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage financial transactions and journal entries
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
                + New Journal Entry
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

        {/* Journal Entries List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Transactions</h2>
          </div>
          
          {journals.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No journal entries yet</h3>
              <p className="text-gray-600 mb-4">Create your first journal entry to get started</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Create Journal Entry
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {journals.map((journal) => (
                <div key={journal.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {journal.docType.toUpperCase()}
                        </span>
                        {journal.docNo && (
                          <span className="text-sm font-medium text-gray-900">
                            #{journal.docNo}
                          </span>
                        )}
                        <span className="text-sm text-gray-500">
                          {formatDate(journal.docDate)}
                        </span>
                      </div>
                      
                      {journal.narration && (
                        <p className="text-sm text-gray-700 mb-3">{journal.narration}</p>
                      )}
                      
                      {/* Journal Entries */}
                      <div className="space-y-1">
                        {journal.entries.map((entry) => (
                          <div key={entry.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-3">
                              <span className="font-medium text-gray-900 min-w-0 flex-1">
                                {entry.accountCode} - {entry.accountName}
                              </span>
                              {entry.description && (
                                <span className="text-gray-500">
                                  {entry.description}
                                </span>
                              )}
                            </div>
                            <div className="flex space-x-4 font-mono text-sm">
                              <span className={`w-20 text-right ${entry.amountDc > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                {entry.amountDc > 0 ? formatCurrency(entry.amountDc) : '—'}
                              </span>
                              <span className={`w-20 text-right ${entry.amountDc < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                                {entry.amountDc < 0 ? formatCurrency(entry.amountDc) : '—'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="ml-6 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(journal.totalDebit)}
                        </div>
                        <div className="text-xs text-gray-500">Total Amount</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Journal Entry Modal */}
      {showCreateForm && (
        <JournalEntryForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false)
            loadJournals() // Reload journals after successful creation
          }}
        />
      )}
    </div>
  )
}