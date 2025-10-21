import { NextRequest, NextResponse } from 'next/server'
import { JsonDataStore } from '@/lib/data-store'
import { Account, LedgerEntry, AccountType } from '@/types/accounting'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bookId = searchParams.get('bookId')
    const asOfDate = searchParams.get('asOfDate') || new Date().toISOString()

    if (!bookId) {
      return NextResponse.json(
        { error: 'bookId parameter is required' },
        { status: 400 }
      )
    }

    // Get all accounts for the book
    const allAccounts = await JsonDataStore.read<Account>('accounts')
    const accounts = allAccounts.filter(account => account.bookId === bookId && account.isActive)

    // Get all ledger entries up to the specified date
    const allEntries = await JsonDataStore.read<LedgerEntry>('ledger_entries')
    const entriesUpToDate = allEntries.filter(entry => {
      return new Date(entry.createdAt) <= new Date(asOfDate)
    })

    // Calculate account balances
    const accountBalances = new Map<string, number>()
    accounts.forEach(account => {
      const accountEntries = entriesUpToDate.filter(entry => entry.accountId === account.id)
      const balance = accountEntries.reduce((sum, entry) => sum + entry.amountDc, 0)
      accountBalances.set(account.id, balance)
    })

    // Categorize accounts for balance sheet
    const assets = accounts.filter(acc => 
      acc.type.includes('asset') && !acc.type.includes('contra')
    ).map(acc => ({
      ...acc,
      balance: accountBalances.get(acc.id) || 0
    })).filter(acc => acc.balance !== 0)

    const liabilities = accounts.filter(acc => 
      acc.type.includes('liability') && !acc.type.includes('contra')
    ).map(acc => ({
      ...acc,
      balance: Math.abs(accountBalances.get(acc.id) || 0) // Liabilities shown as positive
    })).filter(acc => acc.balance !== 0)

    const equity = accounts.filter(acc => 
      acc.type.includes('equity') || acc.type.includes('retained_earnings')
    ).map(acc => ({
      ...acc,
      balance: Math.abs(accountBalances.get(acc.id) || 0) // Equity shown as positive
    })).filter(acc => acc.balance !== 0)

    // Calculate totals
    const totalAssets = assets.reduce((sum, acc) => sum + acc.balance, 0)
    const totalLiabilities = liabilities.reduce((sum, acc) => sum + acc.balance, 0)
    const totalEquity = equity.reduce((sum, acc) => sum + acc.balance, 0)
    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity

    // Separate current and non-current assets/liabilities
    const currentAssets = assets.filter(acc => acc.type === 'current_asset')
    const nonCurrentAssets = assets.filter(acc => acc.type === 'non_current_asset' || 
      (acc.type === 'asset' && !acc.type.includes('current')))

    const currentLiabilities = liabilities.filter(acc => acc.type === 'current_liability')
    const nonCurrentLiabilities = liabilities.filter(acc => acc.type === 'non_current_liability' || 
      (acc.type === 'liability' && !acc.type.includes('current')))

    return NextResponse.json({
      reportName: 'Balance Sheet',
      asOfDate,
      bookId,
      balanceSheet: {
        assets: {
          currentAssets: {
            accounts: currentAssets.sort((a, b) => a.code.localeCompare(b.code)),
            total: currentAssets.reduce((sum, acc) => sum + acc.balance, 0)
          },
          nonCurrentAssets: {
            accounts: nonCurrentAssets.sort((a, b) => a.code.localeCompare(b.code)),
            total: nonCurrentAssets.reduce((sum, acc) => sum + acc.balance, 0)
          },
          totalAssets
        },
        liabilities: {
          currentLiabilities: {
            accounts: currentLiabilities.sort((a, b) => a.code.localeCompare(b.code)),
            total: currentLiabilities.reduce((sum, acc) => sum + acc.balance, 0)
          },
          nonCurrentLiabilities: {
            accounts: nonCurrentLiabilities.sort((a, b) => a.code.localeCompare(b.code)),
            total: nonCurrentLiabilities.reduce((sum, acc) => sum + acc.balance, 0)
          },
          totalLiabilities
        },
        equity: {
          accounts: equity.sort((a, b) => a.code.localeCompare(b.code)),
          totalEquity
        },
        totalLiabilitiesAndEquity
      },
      isBalanced: Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01,
      metadata: {
        generatedAt: new Date().toISOString(),
        currency: 'USD'
      }
    })

  } catch (error) {
    console.error('Error generating balance sheet:', error)
    return NextResponse.json(
      { error: 'Failed to generate balance sheet' },
      { status: 500 }
    )
  }
}