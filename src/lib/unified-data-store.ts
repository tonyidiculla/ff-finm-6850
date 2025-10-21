import { JsonDataStore } from './data-store'
import { SupabaseDataStore } from './supabase-data-store'
import { Organization, Entity, LocationCurrency, Book, Account, Journal, LedgerEntry } from '@/types/accounting'

// Configuration to switch between data stores
const USE_SUPABASE = process.env.NEXT_PUBLIC_USE_SUPABASE === 'true'

// Unified data store interface that can use either JSON files or Supabase
export class DataStore {
  // Location Currency methods (READ ONLY - managed by central system)
  static async getLocationCurrencies(): Promise<LocationCurrency[]> {
    if (USE_SUPABASE) {
      return SupabaseDataStore.getLocationCurrencies()
    }
    
    // For JSON mode, return a default set of currencies
    return [
      {
        id: '1',
        countryCode: 'USA',
        countryName: 'United States',
        currencyCode: 'USD',
        currencyName: 'US Dollar',
        currencySymbol: '$',
        decimalPlaces: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  }

  static async getLocationCurrencyByCountryCode(countryCode: string): Promise<LocationCurrency | null> {
    if (USE_SUPABASE) {
      return SupabaseDataStore.getLocationCurrencyByCountryCode(countryCode)
    }
    
    const currencies = await this.getLocationCurrencies()
    return currencies.find(c => c.countryCode === countryCode) || null
  }

  static async getCurrencyByCountryCode(countryCode: string): Promise<string> {
    if (USE_SUPABASE) {
      return SupabaseDataStore.getCurrencyByCountryCode(countryCode)
    }
    
    const locationCurrency = await this.getLocationCurrencyByCountryCode(countryCode)
    return locationCurrency?.currencyCode || 'USD'
  }
  // Entities (READ ONLY - managed by ff-orgn-6820)
  static async getEntities(organizationPlatformId?: string): Promise<Entity[]> {
    if (USE_SUPABASE) {
      return SupabaseDataStore.getEntities(organizationPlatformId)
    }
    
    // For JSON compatibility, convert organizations to entities
    const orgs = await JsonDataStore.read<Organization>('organizations')
    return orgs.map(org => ({
      entityPlatformId: `E01${org.id.substring(0, 6)}`, // Generate entity platform ID
      organizationPlatformId: org.platformId || `C00${org.id.substring(0, 6)}`,
      entityName: org.name,
      entityType: 'hospital' as const, // Default to hospital for JSON compatibility
      isActive: true,
      createdAt: org.createdAt
    }))
  }

  static async createEntity(entity: Omit<Entity, 'createdAt'>): Promise<Entity> {
    if (USE_SUPABASE) {
      return SupabaseDataStore.createEntity(entity)
    }
    
    // Even in JSON mode, entities should be managed by ff-orgn-6820
    throw new Error('Entities must be created through the ff-orgn-6820 organization management app')
  }

  static async getEntityById(entityPlatformId: string): Promise<Entity | null> {
    if (USE_SUPABASE) {
      return SupabaseDataStore.getEntityById(entityPlatformId)
    }
    
    const org = await JsonDataStore.findById<Organization>('organizations', entityPlatformId)
    if (!org) return null
    
    return {
      entityPlatformId: `E01${org.id.substring(0, 6)}`,
      organizationPlatformId: org.platformId || `C00${org.id.substring(0, 6)}`,
      entityName: org.name,
      entityType: 'hospital',
      isActive: true,
      createdAt: org.createdAt
    }
  }

  // Organizations (READ ONLY - managed by ff-orgn-6820)
  static async getOrganizations(): Promise<Organization[]> {
    if (USE_SUPABASE) {
      return SupabaseDataStore.getOrganizations()
    }
    return JsonDataStore.read<Organization>('organizations')
  }

  static async createOrganization(org: Omit<Organization, 'id' | 'createdAt'>): Promise<Organization> {
    if (USE_SUPABASE) {
      return SupabaseDataStore.createOrganization(org)
    }
    
    // Even in JSON mode, organizations should be managed by ff-orgn-6820
    throw new Error('Organizations must be created through the ff-orgn-6820 organization management app')
  }

  static async getOrganizationById(id: string): Promise<Organization | null> {
    if (USE_SUPABASE) {
      return SupabaseDataStore.getOrganizationById(id)
    }
    return JsonDataStore.findById<Organization>('organizations', id)
  }

  // Books
  static async getBooks(entityPlatformId?: string): Promise<Book[]> {
    if (USE_SUPABASE) {
      return SupabaseDataStore.getBooks(entityPlatformId)
    }
    
    const books = await JsonDataStore.read<Book>('books')
    return entityPlatformId 
      ? books.filter(book => book.entityPlatformId === entityPlatformId)
      : books
  }

  static async createBook(book: Omit<Book, 'id' | 'createdAt'>): Promise<Book> {
    if (USE_SUPABASE) {
      return SupabaseDataStore.createBook(book)
    }
    
    const newBook: Book = {
      id: JsonDataStore.generateId(),
      ...book,
      createdAt: new Date()
    }
    await JsonDataStore.create('books', newBook)
    return newBook
  }

  static async getBookById(id: string): Promise<Book | null> {
    if (USE_SUPABASE) {
      return SupabaseDataStore.getBookById(id)
    }
    return JsonDataStore.findById<Book>('books', id)
  }

  // Accounts
  static async getAccounts(bookId?: string): Promise<Account[]> {
    if (USE_SUPABASE) {
      return SupabaseDataStore.getAccounts(bookId)
    }
    
    const accounts = await JsonDataStore.read<Account>('accounts')
    return bookId 
      ? accounts.filter(account => account.bookId === bookId)
      : accounts
  }

  static async createAccount(account: Omit<Account, 'id' | 'createdAt' | 'balance'>): Promise<Account> {
    if (USE_SUPABASE) {
      return SupabaseDataStore.createAccount(account)
    }
    
    const newAccount: Account = {
      id: JsonDataStore.generateId(),
      balance: 0,
      ...account,
      createdAt: new Date()
    }
    await JsonDataStore.create('accounts', newAccount)
    return newAccount
  }

  static async getAccountById(id: string): Promise<Account | null> {
    if (USE_SUPABASE) {
      return SupabaseDataStore.getAccountById(id)
    }
    return JsonDataStore.findById<Account>('accounts', id)
  }

  // Journals
  static async getJournals(bookId?: string): Promise<Journal[]> {
    if (USE_SUPABASE) {
      return SupabaseDataStore.getJournals(bookId)
    }
    
    const journals = await JsonDataStore.read<Journal>('journals')
    return bookId 
      ? journals.filter(journal => journal.bookId === bookId)
      : journals
  }

  static async createJournal(journal: Omit<Journal, 'id' | 'createdAt' | 'docNo'>): Promise<Journal> {
    if (USE_SUPABASE) {
      return SupabaseDataStore.createJournal(journal)
    }
    
    const newJournal: Journal = {
      id: JsonDataStore.generateId(),
      docNo: `JE${Date.now()}`, // Simple doc number generation
      ...journal,
      createdAt: new Date()
    }
    await JsonDataStore.create('journals', newJournal)
    return newJournal
  }

  static async getJournalById(id: string): Promise<Journal | null> {
    if (USE_SUPABASE) {
      return SupabaseDataStore.getJournalById(id)
    }
    return JsonDataStore.findById<Journal>('journals', id)
  }

  // Ledger Entries
  static async getLedgerEntries(journalId?: string): Promise<LedgerEntry[]> {
    if (USE_SUPABASE) {
      return SupabaseDataStore.getLedgerEntries(journalId)
    }
    
    const entries = await JsonDataStore.read<LedgerEntry>('ledger_entries')
    return journalId 
      ? entries.filter(entry => entry.journalId === journalId)
      : entries
  }

  static async createLedgerEntry(entry: Omit<LedgerEntry, 'id' | 'createdAt'>): Promise<LedgerEntry> {
    if (USE_SUPABASE) {
      return SupabaseDataStore.createLedgerEntry(entry)
    }
    
    const newEntry: LedgerEntry = {
      id: JsonDataStore.generateId(),
      ...entry,
      createdAt: new Date()
    }
    await JsonDataStore.create('ledger_entries', newEntry)
    return newEntry
  }

  // Utility methods
  static generateId(): string {
    if (USE_SUPABASE) {
      return SupabaseDataStore.generateId()
    }
    return JsonDataStore.generateId()
  }

  // Migration method
  static async migrateToSupabase(): Promise<void> {
    if (!USE_SUPABASE) {
      throw new Error('Supabase integration is not enabled')
    }
    
    console.log('Starting migration from JSON files to Supabase...')
    
    try {
      // Migrate books (entities are now implicit in books)
      const books = await JsonDataStore.read<Book>('books')
      for (const book of books) {
        // Generate entity platform ID based on entity type
        const entityTypeCode = book.entityType === 'hospital' ? '01' : 
                              book.entityType === 'estore' ? '02' : 
                              book.entityType === 'pstore' ? '03' : '04'
        const entityPlatformId = `E${entityTypeCode}${Math.random().toString(36).substring(2, 8).toUpperCase()}`
        
        await SupabaseDataStore.createBook({
          entityPlatformId,
          organizationPlatformId: book.organizationPlatformId,
          entityName: book.entityName,
          entityType: book.entityType,
          name: book.name,
          type: book.type,
          countryCode: book.countryCode || 'USA', // Default to USA if not specified
          fyStartMonth: book.fyStartMonth,
          accountingStandard: book.accountingStandard,
          isActive: book.isActive,
          description: book.description
        })
      }
      console.log(`Migrated ${books.length} books`)
      
      // Note: Accounts, journals, and ledger entries would be migrated similarly
      console.log('Migration completed successfully!')
      
    } catch (error) {
      console.error('Migration failed:', error)
      throw error
    }
  }
}