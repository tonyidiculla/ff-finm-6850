'use client'

import { useState, useEffect } from 'react'

interface Book {
  id: string
  name: string
  entityName: string
  countryCode: string
  type: string
}

interface Account {
  id: string
  code: string
  name: string
  type: string
  normalBalance: 'debit' | 'credit'
}

interface EntryLine {
  id: string
  accountId: string
  accountCode: string
  accountName: string
  description: string
  debit: string
  credit: string
}

interface JournalEntryFormProps {
  onClose: () => void
  onSuccess: () => void
}

export default function JournalEntryForm({ onClose, onSuccess }: JournalEntryFormProps) {
  const [books, setBooks] = useState<Book[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Form fields
  const [selectedBookId, setSelectedBookId] = useState('')
  const [docDate, setDocDate] = useState(new Date().toISOString().split('T')[0])
  const [narration, setNarration] = useState('')
  const [entries, setEntries] = useState<EntryLine[]>([
    { id: '1', accountId: '', accountCode: '', accountName: '', description: '', debit: '', credit: '' },
    { id: '2', accountId: '', accountCode: '', accountName: '', description: '', debit: '', credit: '' }
  ])

  // Load books on mount
  useEffect(() => {
    loadBooks()
  }, [])

  // Load accounts when book is selected
  useEffect(() => {
    if (selectedBookId) {
      loadAccounts(selectedBookId)
    }
  }, [selectedBookId])

  const loadBooks = async () => {
    try {
      const response = await fetch('/api/books')
      if (!response.ok) throw new Error('Failed to load books')
      const data = await response.json()
      
      // API returns array directly, not { books: [...] }
      const booksList = Array.isArray(data) ? data : []
      setBooks(booksList)
      
      // Auto-select first book if available
      if (booksList.length > 0) {
        setSelectedBookId(booksList[0].id)
      }
    } catch (err) {
      console.error('Error loading books:', err)
      setError('Failed to load books')
    }
  }

  const loadAccounts = async (bookId: string) => {
    try {
      const response = await fetch(`/api/accounts?bookId=${bookId}`)
      if (!response.ok) throw new Error('Failed to load accounts')
      const data = await response.json()
      setAccounts(data || [])
    } catch (err) {
      console.error('Error loading accounts:', err)
      setError('Failed to load accounts')
    }
  }

  const handleAccountSelect = (index: number, accountId: string) => {
    const account = accounts.find(a => a.id === accountId)
    if (!account) return

    const newEntries = [...entries]
    newEntries[index] = {
      ...newEntries[index],
      accountId: account.id,
      accountCode: account.code,
      accountName: account.name
    }
    setEntries(newEntries)
  }

  const handleDebitChange = (index: number, value: string) => {
    const newEntries = [...entries]
    newEntries[index].debit = value
    if (value) {
      newEntries[index].credit = '' // Clear credit if debit is entered
    }
    setEntries(newEntries)
  }

  const handleCreditChange = (index: number, value: string) => {
    const newEntries = [...entries]
    newEntries[index].credit = value
    if (value) {
      newEntries[index].debit = '' // Clear debit if credit is entered
    }
    setEntries(newEntries)
  }

  const handleDescriptionChange = (index: number, value: string) => {
    const newEntries = [...entries]
    newEntries[index].description = value
    setEntries(newEntries)
  }

  const addEntry = () => {
    setEntries([
      ...entries,
      { 
        id: Date.now().toString(), 
        accountId: '', 
        accountCode: '', 
        accountName: '', 
        description: '', 
        debit: '', 
        credit: '' 
      }
    ])
  }

  const removeEntry = (index: number) => {
    if (entries.length <= 2) {
      setError('At least 2 entries are required')
      return
    }
    setEntries(entries.filter((_, i) => i !== index))
  }

  const calculateTotals = () => {
    let totalDebit = 0
    let totalCredit = 0

    entries.forEach(entry => {
      if (entry.debit) totalDebit += parseFloat(entry.debit) || 0
      if (entry.credit) totalCredit += parseFloat(entry.credit) || 0
    })

    return { totalDebit, totalCredit }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const validateForm = () => {
    if (!selectedBookId) {
      setError('Please select a book')
      return false
    }

    if (!docDate) {
      setError('Please select a date')
      return false
    }

    // Check if all entries have accounts selected
    const invalidEntries = entries.filter(e => !e.accountId)
    if (invalidEntries.length > 0) {
      setError('Please select an account for all entries')
      return false
    }

    // Check if all entries have either debit or credit
    const emptyEntries = entries.filter(e => !e.debit && !e.credit)
    if (emptyEntries.length > 0) {
      setError('Please enter an amount for all entries')
      return false
    }

    // Check if debits equal credits
    const { totalDebit, totalCredit } = calculateTotals()
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      setError(`Debits (${formatCurrency(totalDebit)}) must equal Credits (${formatCurrency(totalCredit)})`)
      return false
    }

    if (totalDebit === 0) {
      setError('Total amount must be greater than zero')
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    setError('')

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const { totalDebit, totalCredit } = calculateTotals()

      // Convert entries to API format
      const ledgerEntries = entries.map(entry => ({
        accountId: entry.accountId,
        description: entry.description,
        debitAmount: entry.debit ? parseFloat(entry.debit) : 0,
        creditAmount: entry.credit ? parseFloat(entry.credit) : 0
      }))

      const journalData = {
        bookId: selectedBookId,
        date: docDate,
        description: narration || 'Journal Entry',
        totalDebit,
        totalCredit,
        entries: ledgerEntries
      }

      const response = await fetch('/api/journals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(journalData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create journal entry')
      }

      // Success!
      onSuccess()
      onClose()
    } catch (err: unknown) {
      console.error('Error creating journal entry:', err)
      setError(err instanceof Error ? err.message : 'Failed to create journal entry')
    } finally {
      setLoading(false)
    }
  }

  const { totalDebit, totalCredit } = calculateTotals()
  const difference = totalDebit - totalCredit
  const isBalanced = Math.abs(difference) < 0.01

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full mx-4 my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">New Journal Entry</h3>
        </div>

        {/* Form */}
        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Book and Date Selection */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Book <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="">Select a book...</option>
                {books.map(book => (
                  <option key={book.id} value={book.id}>
                    {book.name} - {book.entityName} ({book.countryCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={docDate}
                onChange={(e) => setDocDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
          </div>

          {/* Narration */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Narration
            </label>
            <textarea
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              rows={2}
              placeholder="Brief description of this journal entry..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          {/* Journal Entries */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Journal Entries <span className="text-red-500">*</span>
            </label>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Header */}
              <div className="bg-gray-50 px-4 py-3 grid grid-cols-12 gap-3 text-xs font-medium text-gray-700 border-b border-gray-200">
                <div className="col-span-3">Account</div>
                <div className="col-span-3">Description</div>
                <div className="col-span-2 text-right">Debit</div>
                <div className="col-span-2 text-right">Credit</div>
                <div className="col-span-2"></div>
              </div>

              {/* Entry Lines */}
              {entries.map((entry, index) => (
                <div key={entry.id} className="px-4 py-3 grid grid-cols-12 gap-3 items-center border-b border-gray-100 hover:bg-gray-50">
                  {/* Account Select */}
                  <div className="col-span-3">
                    <select
                      value={entry.accountId}
                      onChange={(e) => handleAccountSelect(index, e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading || !selectedBookId}
                    >
                      <option value="">Select account...</option>
                      {accounts.map(account => (
                        <option key={account.id} value={account.id}>
                          {account.code} - {account.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div className="col-span-3">
                    <input
                      type="text"
                      value={entry.description}
                      onChange={(e) => handleDescriptionChange(index, e.target.value)}
                      placeholder="Line description..."
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading}
                    />
                  </div>

                  {/* Debit */}
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={entry.debit}
                      onChange={(e) => handleDebitChange(index, e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full px-2 py-1.5 text-sm text-right border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading || !!entry.credit}
                    />
                  </div>

                  {/* Credit */}
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={entry.credit}
                      onChange={(e) => handleCreditChange(index, e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full px-2 py-1.5 text-sm text-right border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading || !!entry.debit}
                    />
                  </div>

                  {/* Remove Button */}
                  <div className="col-span-2 flex justify-end">
                    {entries.length > 2 && (
                      <button
                        onClick={() => removeEntry(index)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                        disabled={loading}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Totals Row */}
              <div className="bg-gray-50 px-4 py-3 grid grid-cols-12 gap-3 font-medium border-t-2 border-gray-300">
                <div className="col-span-6 text-right text-gray-700">Totals:</div>
                <div className={`col-span-2 text-right ${totalDebit > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                  {formatCurrency(totalDebit)}
                </div>
                <div className={`col-span-2 text-right ${totalCredit > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                  {formatCurrency(totalCredit)}
                </div>
                <div className="col-span-2"></div>
              </div>

              {/* Balance Indicator */}
              {(totalDebit > 0 || totalCredit > 0) && (
                <div className={`px-4 py-2 text-sm font-medium ${isBalanced ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                  {isBalanced ? (
                    <span>✓ Balanced</span>
                  ) : (
                    <span>⚠️ Difference: {formatCurrency(Math.abs(difference))} ({difference > 0 ? 'Debit' : 'Credit'})</span>
                  )}
                </div>
              )}
            </div>

            {/* Add Entry Button */}
            <button
              onClick={addEntry}
              className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
              disabled={loading}
            >
              + Add Entry Line
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="bg-white hover:bg-gray-100 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors border border-gray-300"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            disabled={loading || !isBalanced}
          >
            {loading ? 'Saving...' : 'Save Journal Entry'}
          </button>
        </div>
      </div>
    </div>
  )
}
