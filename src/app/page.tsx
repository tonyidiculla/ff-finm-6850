import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            MYCE
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Multi-Tenant Accounting System
          </p>
          <p className="mt-3 max-w-md mx-auto text-sm text-gray-400 md:mt-5 md:max-w-3xl">
            Organizations • Books • Chart of Accounts • Double-Entry Bookkeeping
          </p>
          
          <div className="mt-10">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Launch Dashboard
            </Link>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Organizations & Books</h3>
              <p className="text-gray-600">Multi-tenant organization structure with separate accounting books and fiscal configurations.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Chart of Accounts</h3>
              <p className="text-gray-600">CRUD operations with predefined templates for different business types (retail, service, etc.).</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Double-Entry Engine</h3>
              <p className="text-gray-600">Enforces accounting principles: balanced entries, immutable posted journals, and audit trails.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Invoices & Bills</h3>
              <p className="text-gray-600">Sales invoices posting to AR/Revenue/Tax and purchase bills to AP/Expense/Tax accounts.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibent text-gray-900 mb-3">Banking</h3>
              <p className="text-gray-600">Bank account management, CSV statement import, and basic reconciliation workflows.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Financial Reports</h3>
              <p className="text-gray-600">Trial Balance, General Ledger, P&L Statement, Balance Sheet, and Tax Summary reports.</p>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Key Invariants</h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Each journal has ≥2 ledger entries with sum(debit − credit) = 0
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Posted journals are immutable (only reversible via reversal journal)
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Accounts have normal balance (debit or credit) to simplify reporting
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Multi-currency support with FX rate tracking
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Technology Stack</h2>
          <div className="inline-flex flex-wrap gap-2 justify-center">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Next.js 14+</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">TypeScript</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Tailwind CSS</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">JSON Data Store</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Pure Next.js</span>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex space-x-4">
            <Link 
              href="/api/organizations" 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Organizations API
            </Link>
            <Link 
              href="/api/accounts" 
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              View Accounts API
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}