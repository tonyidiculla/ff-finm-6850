'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '../../context/AuthContext'

interface Book {
  id: string;
  name: string;
  organizationPlatformId: string;
  entityPlatformId: string;
  currency: string;
  fyStartMonth: number;
  accountingStandard: string;
  status: string;
}

export default function Dashboard() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const { user } = useAuth();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
    
    // Ensure cookie is set from query param if present
    const urlParams = new URLSearchParams(window.location.search);
    const authToken = urlParams.get('auth_token');
    if (authToken) {
      console.log('Setting cookie from URL param...');
      document.cookie = `furfield_token=${authToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
      window.history.replaceState({}, '', '/dashboard');
    }
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('furfield_token='))
          ?.split('=')[1];

        const headers: HeadersInit = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const booksRes = await fetch('/api/books', { headers })
        
        if (!booksRes.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const booksData = await booksRes.json()
        setBooks(booksData)
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, []);

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Manage your multi-tenant accounting system
          {user && (
            <span className="ml-2 text-green-600">
              • Authenticated as {user.firstName} {user.lastName}
            </span>
          )}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white overflow-hidden shadow-lg rounded-2xl">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 114 0 2 2 0 01-4 0zm8-1a1 1 0 100-2 1 1 0 000 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 flex-1">
                <dt className="text-sm font-medium text-gray-600">Financial Management</dt>
                <dd className="text-xl font-bold text-gray-900">Multi-Entity</dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-2xl">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl font-bold">{books.length}</span>
                </div>
              </div>
              <div className="ml-5 flex-1">
                <dt className="text-sm font-medium text-gray-600">Books</dt>
                <dd className="text-xl font-bold text-gray-900">Accounting Books</dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-2xl">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl font-bold">0</span>
                </div>
              </div>
              <div className="ml-5 flex-1">
                <dt className="text-sm font-medium text-gray-600">Transactions</dt>
                <dd className="text-xl font-bold text-gray-900">This Month</dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow-lg rounded-2xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/dashboard/books/new"
            className="px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all text-center"
          >
            New Book
          </Link>
          <Link
            href="/dashboard/books"
            className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all text-center"
          >
            Manage Books
          </Link>
          <Link
            href="/accounts"
            className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all text-center"
          >
            Chart of Accounts
          </Link>
          <Link
            href="/transactions"
            className="px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all text-center"
          >
            Transactions
          </Link>
        </div>
      </div>

      {/* Books List */}
      <div className="bg-white shadow-lg rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900">Your Books</h3>
          <Link
            href="/dashboard/books/new"
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all"
          >
            Create New Book
          </Link>
        </div>

        {books.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
              <Link
                key={book.id}
                href={`/dashboard/books/${book.id}`}
                className="relative rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm hover:border-blue-400 hover:shadow-md transition-all"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {book.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {book.currency} • FY: Month {book.fyStartMonth}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {book.accountingStandard}
                    </p>
                    <span className={`inline-flex mt-2 items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      book.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {book.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No books</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new accounting book.</p>
            <div className="mt-6">
              <Link
                href="/dashboard/books/new"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all"
              >
                Create New Book
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
