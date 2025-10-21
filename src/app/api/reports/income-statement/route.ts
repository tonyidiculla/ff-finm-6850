import { NextRequest, NextResponse } from 'next/server'
import { JsonDataStore } from '@/lib/data-store'
import { Account, LedgerEntry, Journal } from '@/types/accounting'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bookId = searchParams.get('bookId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate') || new Date().toISOString()

    if (!bookId) {
      return NextResponse.json(
        { error: 'bookId parameter is required' },
        { status: 400 }
      )
    }

    if (!startDate) {
      return NextResponse.json(
        { error: 'startDate parameter is required' },
        { status: 400 }
      )
    }

    // Get all accounts for the book
    const allAccounts = await JsonDataStore.read<Account>('accounts')
    const accounts = allAccounts.filter(account => account.bookId === bookId && account.isActive)

    // Get all journals and ledger entries within the date range
    const allJournals = await JsonDataStore.read<Journal>('journals')
    const journalsInPeriod = allJournals.filter(journal => {
      const journalDate = new Date(journal.docDate)
      return journalDate >= new Date(startDate) && 
             journalDate <= new Date(endDate) &&
             journal.bookId === bookId
    })

    const allEntries = await JsonDataStore.read<LedgerEntry>('ledger_entries')
    const entriesInPeriod = allEntries.filter(entry => {
      return journalsInPeriod.some(journal => journal.id === entry.journalId)
    })

    // Calculate account balances for the period
    const accountBalances = new Map<string, number>()
    accounts.forEach(account => {
      const accountEntries = entriesInPeriod.filter(entry => entry.accountId === account.id)
      const balance = accountEntries.reduce((sum, entry) => sum + entry.amountDc, 0)
      accountBalances.set(account.id, balance)
    })

    // Categorize accounts for income statement
    const revenueAccounts = accounts.filter(acc => 
      acc.type === 'revenue' || acc.type === 'income'
    ).map(acc => ({
      ...acc,
      balance: Math.abs(accountBalances.get(acc.id) || 0) // Revenue shown as positive
    })).filter(acc => acc.balance !== 0)

    const expenseAccounts = accounts.filter(acc => 
      acc.type.includes('expense')
    ).map(acc => ({
      ...acc,
      balance: accountBalances.get(acc.id) || 0 // Expenses are positive debits
    })).filter(acc => acc.balance !== 0)

    // Separate operating and non-operating expenses
    const operatingExpenses = expenseAccounts.filter(acc => 
      acc.type === 'operating_expense' || acc.type === 'expense'
    )
    const nonOperatingExpenses = expenseAccounts.filter(acc => 
      acc.type === 'non_operating_expense'
    )

    // Calculate totals and profit figures
    const totalRevenue = revenueAccounts.reduce((sum, acc) => sum + acc.balance, 0)
    const totalOperatingExpenses = operatingExpenses.reduce((sum, acc) => sum + acc.balance, 0)
    const totalNonOperatingExpenses = nonOperatingExpenses.reduce((sum, acc) => sum + acc.balance, 0)
    const totalExpenses = totalOperatingExpenses + totalNonOperatingExpenses

    const grossProfit = totalRevenue // Simplified - would need COGS accounts for real gross profit
    const operatingIncome = totalRevenue - totalOperatingExpenses
    const netIncome = totalRevenue - totalExpenses

    return NextResponse.json({
      reportName: 'Income Statement',
      periodStart: startDate,
      periodEnd: endDate,
      bookId,
      incomeStatement: {
        revenue: {
          accounts: revenueAccounts.sort((a, b) => a.code.localeCompare(b.code)),
          totalRevenue
        },
        expenses: {
          operatingExpenses: {
            accounts: operatingExpenses.sort((a, b) => a.code.localeCompare(b.code)),
            total: totalOperatingExpenses
          },
          nonOperatingExpenses: {
            accounts: nonOperatingExpenses.sort((a, b) => a.code.localeCompare(b.code)),
            total: totalNonOperatingExpenses
          },
          totalExpenses
        },
        profitMetrics: {
          grossProfit,
          operatingIncome,
          netIncome,
          grossProfitMargin: totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0,
          operatingMargin: totalRevenue > 0 ? (operatingIncome / totalRevenue) * 100 : 0,
          netProfitMargin: totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0
        }
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        currency: 'USD',
        periodDays: Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
      }
    })

  } catch (error) {
    console.error('Error generating income statement:', error)
    return NextResponse.json(
      { error: 'Failed to generate income statement' },
      { status: 500 }
    )
  }
}