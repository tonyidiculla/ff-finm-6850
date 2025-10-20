import { JsonDataStore } from '@/lib/data-store'
import { Journal, LedgerEntry, Account } from '@/types/accounting'

export type LedgerEntryInput = {
  accountId: string
  contactId?: string
  description?: string
  amountDc: number // Positive for debit, negative for credit
  amountTxn?: number
  fxRate?: number
}

export type JournalInput = {
  bookId: string
  docType: string
  docNo?: string
  docDate: Date
  currency: string
  narration?: string
  entries: LedgerEntryInput[]
}

export class JournalValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'JournalValidationError'
  }
}

/**
 * Core double-entry bookkeeping service
 * Enforces key invariants:
 * 1. Each journal must have ≥2 ledger entries
 * 2. Sum of all debit-credit amounts must equal zero
 * 3. Posted journals are immutable
 */
export class DoubleEntryService {
  /**
   * Validates journal entries before posting
   */
  static validateJournalEntries(entries: LedgerEntryInput[]): void {
    // Invariant 1: Must have at least 2 entries
    if (entries.length < 2) {
      throw new JournalValidationError('Journal must have at least 2 ledger entries')
    }

    // Invariant 2: Sum of debits and credits must equal zero
    const totalAmount = entries.reduce((sum, entry) => {
      return sum + entry.amountDc
    }, 0)

    // Allow for small rounding differences (1 cent)
    if (Math.abs(totalAmount) > 0.01) {
      throw new JournalValidationError(
        `Journal entries do not balance. Total: ${totalAmount.toFixed(2)}`
      )
    }

    // Validate each entry has non-zero amount
    for (const entry of entries) {
      if (entry.amountDc === 0) {
        throw new JournalValidationError('Ledger entry cannot have zero amount')
      }
    }
  }

  /**
   * Creates a journal with ledger entries
   */
  static async createJournal(input: JournalInput, createdBy?: string) {
    this.validateJournalEntries(input.entries)

    // Create journal
    const journal: Journal = {
      id: JsonDataStore.generateId(),
      bookId: input.bookId,
      docType: input.docType as 'manual' | 'invoice' | 'bill' | 'payment' | 'bank' | 'adjustment',
      docNo: input.docNo,
      docDate: input.docDate,
      currency: input.currency,
      narration: input.narration,
      createdBy: createdBy,
      createdAt: new Date(),
    }

    await JsonDataStore.create('journals', journal)

    // Create ledger entries
    const ledgerEntries: LedgerEntry[] = []
    for (let i = 0; i < input.entries.length; i++) {
      const entry = input.entries[i]
      const ledgerEntry: LedgerEntry = {
        id: JsonDataStore.generateId(),
        journalId: journal.id,
        lineNo: i + 1,
        accountId: entry.accountId,
        contactId: entry.contactId,
        description: entry.description,
        amountDc: entry.amountDc,
        amountTxn: entry.amountTxn,
        fxRate: entry.fxRate,
        createdAt: new Date(),
      }
      
      await JsonDataStore.create('ledger_entries', ledgerEntry)
      ledgerEntries.push(ledgerEntry)
    }

    return { journal, ledgerEntries }
  }

  /**
   * Posts a journal (makes it immutable)
   */
  static async postJournal(journalId: string, postedBy: string) {
    // Check if journal exists and is not already posted
    const journal = await JsonDataStore.findById<Journal>('journals', journalId)
    
    if (!journal) {
      throw new JournalValidationError('Journal not found')
    }

    if (journal.postedAt) {
      throw new JournalValidationError('Journal is already posted and immutable')
    }

    // Get ledger entries for this journal
    const ledgerEntries = await JsonDataStore.findMany<LedgerEntry>(
      'ledger_entries',
      entry => entry.journalId === journalId
    )

    // Validate entries before posting
    const entries = ledgerEntries.map(entry => ({
      accountId: entry.accountId,
      contactId: entry.contactId,
      description: entry.description,
      amountDc: entry.amountDc,
      amountTxn: entry.amountTxn,
      fxRate: entry.fxRate,
    }))

    this.validateJournalEntries(entries)

    // Update the journal with posted information
    const updatedJournal: Journal = {
      ...journal,
      postedAt: new Date(),
      createdBy: postedBy, // Store who posted it
    }
    
    await JsonDataStore.update('journals', journalId, {
      postedAt: updatedJournal.postedAt,
      createdBy: updatedJournal.createdBy,
    })

    // Update account balances
    await this.updateAccountBalances(ledgerEntries)

    return { journal: updatedJournal, ledgerEntries }
  }

  /**
   * Creates a reversal journal for an already posted journal
   */
  static async reverseJournal(
    originalJournalId: string,
    reversalReason: string,
    createdBy: string
  ) {
    // Get original journal
    const originalJournal = await JsonDataStore.findById<Journal>('journals', originalJournalId)
    
    if (!originalJournal) {
      throw new JournalValidationError('Original journal not found')
    }

    if (!originalJournal.postedAt) {
      throw new JournalValidationError('Can only reverse posted journals')
    }

    // Get original ledger entries
    const originalEntries = await JsonDataStore.findMany<LedgerEntry>(
      'ledger_entries',
      entry => entry.journalId === originalJournalId
    )

    // Create reversal entries (flip the signs)
    const reversalEntries: LedgerEntryInput[] = originalEntries.map(entry => ({
      accountId: entry.accountId,
      contactId: entry.contactId,
      description: `Reversal: ${entry.description || ''}`,
      amountDc: -entry.amountDc, // Flip the sign
      amountTxn: entry.amountTxn ? -entry.amountTxn : undefined,
      fxRate: entry.fxRate,
    }))

    // Create reversal journal
    const reversalJournal = await this.createJournal(
      {
        bookId: originalJournal.bookId,
        docType: 'adjustment',
        docNo: `REV-${originalJournal.docNo || originalJournal.id.slice(-6)}`,
        docDate: new Date(),
        currency: originalJournal.currency,
        narration: `Reversal of journal ${originalJournal.docNo}: ${reversalReason}`,
        entries: reversalEntries,
      },
      createdBy
    )

    // Create updated journal with reversal link
    const updatedJournal: Journal = {
      ...reversalJournal.journal,
      reversalOf: originalJournalId,
    }

    await JsonDataStore.update('journals', reversalJournal.journal.id, {
      reversalOf: originalJournalId,
    })

    // Auto-post the reversal
    await this.postJournal(reversalJournal.journal.id, createdBy)

    return { ...reversalJournal, journal: updatedJournal }
  }

  /**
   * Updates account balances after posting journal entries
   */
  private static async updateAccountBalances(entries: LedgerEntry[]) {
    // Group entries by account
    const balanceUpdates: Record<string, number> = {}
    
    for (const entry of entries) {
      const accountId = entry.accountId
      if (!balanceUpdates[accountId]) {
        balanceUpdates[accountId] = 0
      }
      balanceUpdates[accountId] += entry.amountDc
    }

    // Update each account balance
    for (const [accountId, balanceChange] of Object.entries(balanceUpdates)) {
      const account = await JsonDataStore.findById<Account>('accounts', accountId)
      if (account) {
        const updatedAccount: Account = {
          ...account,
          balance: account.balance + balanceChange,
        }
        
        await JsonDataStore.update('accounts', accountId, {
          balance: updatedAccount.balance,
        })
      }
    }
  }

  /**
   * Gets the trial balance for a book at a specific date
   */
  static async getTrialBalance(bookId: string, asOfDate?: Date) {
    // Get all posted journals for the book
    const journals = await JsonDataStore.findMany<Journal>(
      'journals',
      journal => journal.bookId === bookId && journal.postedAt !== undefined &&
        (!asOfDate || journal.postedAt <= asOfDate)
    )

    const journalIds = journals.map(j => j.id)

    // Get all ledger entries for these journals
    const entries = await JsonDataStore.findMany<LedgerEntry>(
      'ledger_entries',
      entry => journalIds.includes(entry.journalId)
    )

    // Get all accounts for the book
    const accounts = await JsonDataStore.findMany<Account>(
      'accounts',
      account => account.bookId === bookId
    )

    // Create account lookup
    const accountLookup = accounts.reduce((acc, account) => {
      acc[account.id] = account
      return acc
    }, {} as Record<string, Account>)

    // Group by account and calculate balances
    type AccountBalance = {
      account: Account
      debitTotal: number
      creditTotal: number
      balance: number
    }

    const accountBalances: Record<string, AccountBalance> = {}

    for (const entry of entries) {
      const accountId = entry.accountId
      const account = accountLookup[accountId]
      
      if (!account) continue

      if (!accountBalances[accountId]) {
        accountBalances[accountId] = {
          account,
          debitTotal: 0,
          creditTotal: 0,
          balance: 0,
        }
      }

      const amount = entry.amountDc
      if (amount > 0) {
        accountBalances[accountId].debitTotal += amount
      } else {
        accountBalances[accountId].creditTotal += Math.abs(amount)
      }

      accountBalances[accountId].balance += amount
    }

    return Object.values(accountBalances)
  }
}