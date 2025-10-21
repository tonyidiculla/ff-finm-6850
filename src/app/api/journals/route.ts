import { NextRequest, NextResponse } from 'next/server'
import { JsonDataStore } from '@/lib/data-store'
import { Journal, LedgerEntry, Account } from '@/types/accounting'
import { v4 as uuidv4 } from 'uuid'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bookId = searchParams.get('bookId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let journals = await JsonDataStore.read<Journal>('journals')
    
    if (bookId) {
      journals = journals.filter(journal => journal.bookId === bookId)
    }

    // Sort by date (newest first)
    journals.sort((a, b) => new Date(b.docDate).getTime() - new Date(a.docDate).getTime())

    // Pagination
    const total = journals.length
    const paginatedJournals = journals.slice(offset, offset + limit)

    // Get ledger entries for each journal
    const allEntries = await JsonDataStore.read<LedgerEntry>('ledger_entries')
    const journalsWithEntries = await Promise.all(
      paginatedJournals.map(async (journal) => {
        const entries = allEntries.filter(entry => entry.journalId === journal.id)
        
        // Get account names for entries
        const accounts = await JsonDataStore.read<Account>('accounts')
        const entriesWithAccountNames = entries.map(entry => {
          const account = accounts.find((acc: Account) => acc.id === entry.accountId)
          return {
            ...entry,
            accountName: account?.name || 'Unknown Account',
            accountCode: account?.code || ''
          }
        })

        return {
          ...journal,
          entries: entriesWithAccountNames,
          totalDebit: entries.filter(e => e.amountDc > 0).reduce((sum, e) => sum + e.amountDc, 0),
          totalCredit: entries.filter(e => e.amountDc < 0).reduce((sum, e) => sum + Math.abs(e.amountDc), 0)
        }
      })
    )

    return NextResponse.json({
      journals: journalsWithEntries,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  } catch (error) {
    console.error('Error fetching journals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch journals' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookId, docType, docDate, narration, entries } = body

    // Validation
    if (!bookId || !docType || !docDate || !entries || !Array.isArray(entries)) {
      return NextResponse.json(
        { error: 'Required fields: bookId, docType, docDate, entries (array)' },
        { status: 400 }
      )
    }

    if (entries.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 entries required for double-entry bookkeeping' },
        { status: 400 }
      )
    }

    // Validate double-entry: total debits must equal total credits
    const totalDebits = entries.filter(e => e.amountDc > 0).reduce((sum, e) => sum + e.amountDc, 0)
    const totalCredits = entries.filter(e => e.amountDc < 0).reduce((sum, e) => sum + Math.abs(e.amountDc), 0)

    if (Math.abs(totalDebits - totalCredits) > 0.01) { // Allow for small rounding differences
      return NextResponse.json(
        { error: `Double-entry validation failed: Debits (${totalDebits}) must equal Credits (${totalCredits})` },
        { status: 400 }
      )
    }

    // Create journal entry
    const journalId = uuidv4()
    const journal: Journal = {
      id: journalId,
      bookId,
      docType,
      docDate: new Date(docDate),
      currency: body.currency || 'USD',
      narration: narration || '',
      createdAt: new Date()
    }

    // Create ledger entries
    const ledgerEntries: LedgerEntry[] = entries.map((entry: any, index: number) => ({
      id: uuidv4(),
      journalId,
      lineNo: index + 1,
      accountId: entry.accountId,
      contactId: entry.contactId || undefined,
      description: entry.description || '',
      amountDc: entry.amountDc,
      amountTxn: entry.amountTxn || entry.amountDc,
      fxRate: entry.fxRate || 1,
      createdAt: new Date()
    }))

    // Save to data store
    await JsonDataStore.create('journals', journal)
    
    for (const entry of ledgerEntries) {
      await JsonDataStore.create('ledger_entries', entry)
    }

    // Update account balances
    await updateAccountBalances(ledgerEntries)

    // Return created journal with entries
    const accounts = await JsonDataStore.read<Account>('accounts')
    const entriesWithAccountNames = ledgerEntries.map(entry => {
      const account = accounts.find((acc: Account) => acc.id === entry.accountId)
      return {
        ...entry,
        accountName: account?.name || 'Unknown Account',
        accountCode: account?.code || ''
      }
    })

    return NextResponse.json({
      ...journal,
      entries: entriesWithAccountNames,
      totalDebit: totalDebits,
      totalCredit: totalCredits
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating journal:', error)
    return NextResponse.json(
      { error: 'Failed to create journal entry' },
      { status: 500 }
    )
  }
}

async function updateAccountBalances(entries: LedgerEntry[]) {
  const accounts = await JsonDataStore.read<Account>('accounts')
  
  for (const entry of entries) {
    const accountIndex = accounts.findIndex((acc: Account) => acc.id === entry.accountId)
    if (accountIndex !== -1) {
      const updatedAccount = {
        ...accounts[accountIndex],
        balance: accounts[accountIndex].balance + entry.amountDc
      }
      await JsonDataStore.update('accounts', entry.accountId, updatedAccount)
    }
  }
}