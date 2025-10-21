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

    // Calculate trial balance
    const trialBalance = accounts.map(account => {
      // Calculate balance from ledger entries
      const accountEntries = entriesUpToDate.filter(entry => entry.accountId === account.id)
      const calculatedBalance = accountEntries.reduce((sum, entry) => sum + entry.amountDc, 0)

      return {
        accountId: account.id,
        accountCode: account.code,
        accountName: account.name,
        accountType: account.type,
        normalBalance: account.normalBalance,
        balance: calculatedBalance,
        debitBalance: account.normalBalance === 'debit' ? Math.max(0, calculatedBalance) : 0,
        creditBalance: account.normalBalance === 'credit' ? Math.max(0, Math.abs(calculatedBalance)) : 0,
        isActive: account.isActive
      }
    }).filter(item => item.balance !== 0) // Only show accounts with balances

    // Calculate totals
    const totalDebits = trialBalance.reduce((sum, item) => sum + item.debitBalance, 0)
    const totalCredits = trialBalance.reduce((sum, item) => sum + item.creditBalance, 0)

    // Sort by account code
    trialBalance.sort((a, b) => a.accountCode.localeCompare(b.accountCode))

    return NextResponse.json({
      reportName: 'Trial Balance',
      asOfDate,
      bookId,
      accounts: trialBalance,
      totals: {
        totalDebits,
        totalCredits,
        isBalanced: Math.abs(totalDebits - totalCredits) < 0.01
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        totalAccounts: trialBalance.length,
        currency: 'USD' // TODO: Get from book settings
      }
    })

  } catch (error) {
    console.error('Error generating trial balance:', error)
    return NextResponse.json(
      { error: 'Failed to generate trial balance' },
      { status: 500 }
    )
  }
}