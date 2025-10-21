import { supabaseAdmin } from './supabase'
import { 
  DatabaseLocationCurrency,
  DatabaseBook, 
  DatabaseAccount, 
  DatabaseJournal, 
  DatabaseLedgerEntry,
  DatabaseContact 
} from './supabase'
import { 
  Organization, // For backward compatibility
  LocationCurrency,
  Entity,
  Book, 
  Account, 
  Journal, 
  LedgerEntry 
} from '@/types/accounting'

// Type mappings from database to application types
const mapDatabaseToLocationCurrency = (dbLoc: DatabaseLocationCurrency): LocationCurrency => ({
  id: dbLoc.id,
  countryCode: dbLoc.country_code,
  countryName: dbLoc.country_name,
  currencyCode: dbLoc.currency_code,
  currencyName: dbLoc.currency_name,
  currencySymbol: dbLoc.currency_symbol,
  decimalPlaces: dbLoc.decimal_places,
  isActive: dbLoc.is_active,
  createdAt: new Date(dbLoc.created_at),
  updatedAt: new Date(dbLoc.updated_at)
})

const mapDatabaseToBook = (dbBook: DatabaseBook): Book => ({
  id: dbBook.id,
  entityPlatformId: dbBook.entity_platform_id,
  organizationPlatformId: dbBook.organization_platform_id,
  entityName: dbBook.entity_name,
  entityType: dbBook.entity_type,
  name: dbBook.name,
  type: dbBook.book_type as Book['type'],
  countryCode: dbBook.country_code,
  fyStartMonth: dbBook.fy_start_month,
  accountingStandard: dbBook.accounting_standard as Book['accountingStandard'],
  isActive: dbBook.is_active,
  description: dbBook.description,
  createdAt: new Date(dbBook.created_at)
})

const mapDatabaseToAccount = (dbAccount: DatabaseAccount): Account => ({
  id: dbAccount.id,
  bookId: dbAccount.book_id,
  code: dbAccount.code,
  name: dbAccount.name,
  type: dbAccount.account_type as Account['type'],
  normalBalance: dbAccount.normal_balance as Account['normalBalance'],
  isPostable: !dbAccount.is_system,
  parentId: dbAccount.parent_account_id,
  isActive: dbAccount.is_active,
  balance: dbAccount.balance,
  gaapCategory: 'balance_sheet', // Default
  reportingOrder: 0, // Default
  description: dbAccount.description,
  requiresDocumentation: false, // Default
  taxCode: undefined, // Not implemented
  createdAt: new Date(dbAccount.created_at)
})

const mapDatabaseToJournal = (dbJournal: DatabaseJournal): Journal => ({
  id: dbJournal.id,
  bookId: dbJournal.book_id,
  docType: 'manual' as const,
  docNo: dbJournal.journal_number || '',
  docDate: new Date(dbJournal.date),
  currency: 'USD', // Default
  narration: dbJournal.description,
  postedAt: dbJournal.posted_at ? new Date(dbJournal.posted_at) : undefined,
  createdBy: dbJournal.created_by,
  createdAt: new Date(dbJournal.created_at)
})

const mapDatabaseToLedgerEntry = (dbEntry: DatabaseLedgerEntry): LedgerEntry => ({
  id: dbEntry.id,
  journalId: dbEntry.journal_id,
  lineNo: dbEntry.line_number,
  accountId: dbEntry.account_id,
  description: dbEntry.description,
  amountDc: dbEntry.debit_amount - dbEntry.credit_amount, // Positive for debit, negative for credit
  createdAt: new Date(dbEntry.created_at)
})

// Supabase-based data store
export class SupabaseDataStore {
  static generateId(): string {
    return crypto.randomUUID()
  }

  // Location Currency methods (READ ONLY - managed by central system)
  static async getLocationCurrencies(): Promise<LocationCurrency[]> {
    const { data, error } = await supabaseAdmin
      .from('location_currency')
      .select('*')
      .eq('is_active', true)
      .order('country_name', { ascending: true })
    
    if (error) throw new Error(`Failed to fetch location currencies: ${error.message}`)
    return data?.map(mapDatabaseToLocationCurrency) || []
  }

  static async getLocationCurrencyByCountryCode(countryCode: string): Promise<LocationCurrency | null> {
    const { data, error } = await supabaseAdmin
      .from('location_currency')
      .select('*')
      .eq('country_code', countryCode)
      .eq('is_active', true)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw new Error(`Failed to fetch location currency: ${error.message}`)
    }
    return mapDatabaseToLocationCurrency(data)
  }

  static async getCurrencyByCountryCode(countryCode: string): Promise<string> {
    const locationCurrency = await this.getLocationCurrencyByCountryCode(countryCode)
    return locationCurrency?.currencyCode || 'USD' // Default to USD if not found
  }

  // Helper function to determine entity type from platform ID
  private static getEntityTypeFromPlatformId(platformId: string): 'hospital' | 'estore' | 'pstore' | 'channel_partner' {
    if (!platformId || !platformId.startsWith('E')) {
      return 'hospital'; // Default fallback
    }
    
    // Extract the type code from platform ID format: E + type_code + random_chars
    const typeCode = platformId.substring(1, 3); // Get characters 1-2 after 'E'
    
    switch (typeCode) {
      case '01': // E01xxxxx - Hospital/Clinic
        return 'hospital';
      case '02': // E02xxxxx - E-commerce store  
        return 'estore';
      case '03': // E03xxxxx - Physical retail store
        return 'pstore';
      case '04': // E04xxxxx - Channel partner/distributor
        return 'channel_partner';
      case '19': // E19xxxxx - Legacy hospital format
        return 'hospital';
      default:
        return 'hospital'; // Default to hospital for unknown patterns
    }
  }

  // Entity methods - READ ONLY (entities are managed by ff-hosp-6830, ff-orgn-6820, etc.)
  static async getEntities(organizationPlatformId?: string): Promise<Entity[]> {
    try {
      // Query hospital_master table - include country information
      let query = supabaseAdmin
        .from('hospital_master')
        .select('entity_name, entity_platform_id, organization_platform_id, country, created_at')
        .eq('is_active', true)
        .order('entity_name');
      
      if (organizationPlatformId) {
        query = query.eq('organization_platform_id', organizationPlatformId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Database error in getEntities:', error);
        throw error;
      }
      
      return data?.map((entity: any) => ({
        entityPlatformId: entity.entity_platform_id,
        organizationPlatformId: entity.organization_platform_id,
        entityName: entity.entity_name, // Clean name without platform ID
        entityType: this.getEntityTypeFromPlatformId(entity.entity_platform_id), // Auto-detect from platform ID
        isActive: true,
        createdAt: new Date(entity.created_at || new Date()),
        country: entity.country // Include country for auto-population
      })) || [];
    } catch (error) {
      console.error('Error fetching entities from hospital_master:', error);
      return [];
    }
  }

  static async createEntity(entity: Omit<Entity, 'createdAt'>): Promise<Entity> {
    // Entities are NOT created in FINM - they are managed by ff-orgn-6820
    throw new Error('Entities must be created through the ff-orgn-6820 organization management app')
  }

  static async getEntityById(entityPlatformId: string): Promise<Entity | null> {
    const { data, error } = await supabaseAdmin
      .from('finm_books')
      .select('entity_platform_id, organization_platform_id, entity_name, entity_type, created_at')
      .eq('entity_platform_id', entityPlatformId)
      .eq('is_active', true)
      .limit(1)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw new Error(`Failed to fetch entity: ${error.message}`)
    }
    
    return {
      entityPlatformId: data.entity_platform_id,
      organizationPlatformId: data.organization_platform_id,
      entityName: data.entity_name,
      entityType: data.entity_type,
      isActive: true,
      createdAt: new Date(data.created_at)
    }
  }

  // Organization methods - READ ONLY (organizations are managed by ff-orgn-6820)
  static async getOrganizations(): Promise<Organization[]> {
    try {
      // Query the organizations table directly to get all organizations
      const { data, error } = await supabaseAdmin
        .from('organizations')
        .select('organization_platform_id, organization_name, country, created_at')
        .eq('is_active', 'active')
        .order('organization_name');

      if (error) throw error;
      
      return data?.map((org: any) => ({
        id: org.organization_platform_id,
        platformId: org.organization_platform_id,
        name: org.organization_name, // Clean name without platform ID
        countryCode: org.country || 'USA',
        createdAt: new Date(org.created_at || new Date())
      })) || [];
    } catch (error) {
      console.error('Error fetching organizations from organizations table:', error);
      return [];
    }
  }

  static async createOrganization(org: Omit<Organization, 'id' | 'createdAt'>): Promise<Organization> {
    // Organizations are NOT created in FINM - they are managed by ff-orgn-6820
    throw new Error('Organizations must be created through the ff-orgn-6820 organization management app')
  }

  static async getOrganizationById(id: string): Promise<Organization | null> {
    // Organizations are managed by ff-orgn-6820, not accessible from FINM
    throw new Error('Organizations must be accessed through the ff-orgn-6820 organization management app')
  }

  // Books
  static async getBooks(entityPlatformId?: string): Promise<Book[]> {
    let query = supabaseAdmin.from('finm_books').select('*')
    
    if (entityPlatformId) {
      query = query.eq('entity_platform_id', entityPlatformId)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) throw new Error(`Failed to fetch books: ${error.message}`)
    return data?.map(mapDatabaseToBook) || []
  }

  static async createBook(book: Omit<Book, 'id' | 'createdAt'>): Promise<Book> {
    console.log('Creating book with data:', JSON.stringify(book, null, 2))
    
    // Validate country code exists in location_currency (since no FK constraint)
    console.log('Validating country code:', book.countryCode)
    const { data: locationData, error: locationError } = await supabaseAdmin
      .from('location_currency')
      .select('country_code')
      .eq('country_code', book.countryCode)
      .eq('is_active', true)
      .single()
    
    if (locationError || !locationData) {
      console.error('Location validation error:', locationError)
      throw new Error(`Invalid country code '${book.countryCode}'. Please ensure it exists in the location_currency table.`)
    }
    console.log('Country code validation passed:', locationData)

    console.log('Inserting book into database...')
    const { data, error } = await supabaseAdmin
      .from('finm_books')
      .insert({
        entity_platform_id: book.entityPlatformId,
        organization_platform_id: book.organizationPlatformId,
        entity_name: book.entityName,
        entity_type: book.entityType,
        name: book.name,
        book_type: book.type || 'general-ledger',
        country_code: book.countryCode,
        fy_start_month: book.fyStartMonth || 1,
        accounting_standard: book.accountingStandard || 'GAAP',
        is_active: book.isActive ?? true,
        description: book.description
      })
      .select()
      .single()
    
    if (error) {
      console.error('Database insert error:', JSON.stringify(error, null, 2))
      throw new Error(`Failed to create book: ${error.message}`)
    }
    
    console.log('Book created successfully:', data)
    return mapDatabaseToBook(data)
  }

  static async getBookById(id: string): Promise<Book | null> {
    const { data, error } = await supabaseAdmin
      .from('finm_books')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw new Error(`Failed to fetch book: ${error.message}`)
    }
    return mapDatabaseToBook(data)
  }

  // Accounts
  static async getAccounts(bookId?: string): Promise<Account[]> {
    let query = supabaseAdmin.from('finm_accounts').select('*')
    
    if (bookId) {
      query = query.eq('book_id', bookId)
    }
    
    const { data, error } = await query.order('code', { ascending: true })
    
    if (error) throw new Error(`Failed to fetch accounts: ${error.message}`)
    return data?.map(mapDatabaseToAccount) || []
  }

  static async createAccount(account: Omit<Account, 'id' | 'balance' | 'createdAt' | 'updatedAt'>): Promise<Account> {
    const { data, error } = await supabaseAdmin
      .from('finm_accounts')
      .insert({
        book_id: account.bookId,
        code: account.code,
        name: account.name,
        account_type: account.type,
        normal_balance: account.normalBalance,
        parent_account_id: account.parentId,
        is_system: !account.isPostable,
        is_active: account.isActive ?? true,
        description: account.description
      })
      .select()
      .single()
    
    if (error) throw new Error(`Failed to create account: ${error.message}`)
    return mapDatabaseToAccount(data)
  }

  static async getAccountById(id: string): Promise<Account | null> {
    const { data, error } = await supabaseAdmin
      .from('finm_accounts')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw new Error(`Failed to fetch account: ${error.message}`)
    }
    return mapDatabaseToAccount(data)
  }

  // Journals
  static async getJournals(bookId?: string): Promise<Journal[]> {
    let query = supabaseAdmin.from('finm_journals').select('*')
    
    if (bookId) {
      query = query.eq('book_id', bookId)
    }
    
    const { data, error } = await query.order('date', { ascending: false })
    
    if (error) throw new Error(`Failed to fetch journals: ${error.message}`)
    return data?.map(mapDatabaseToJournal) || []
  }

  static async createJournal(journal: Omit<Journal, 'id' | 'docNo' | 'createdAt' | 'postedAt'>): Promise<Journal> {
    const { data, error } = await supabaseAdmin
      .from('finm_journals')
      .insert({
        book_id: journal.bookId,
        reference: '', // Not used in current Journal type
        date: journal.docDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        description: journal.narration || '',
        status: 'draft', // Default status
        total_amount: 0, // Will be calculated from entries
        created_by: journal.createdBy
      })
      .select()
      .single()
    
    if (error) throw new Error(`Failed to create journal: ${error.message}`)
    return mapDatabaseToJournal(data)
  }

  static async getJournalById(id: string): Promise<Journal | null> {
    const { data, error } = await supabaseAdmin
      .from('finm_journals')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw new Error(`Failed to fetch journal: ${error.message}`)
    }
    return mapDatabaseToJournal(data)
  }

  // Ledger Entries
  static async getLedgerEntries(journalId?: string): Promise<LedgerEntry[]> {
    let query = supabaseAdmin.from('finm_ledger_entries').select('*')
    
    if (journalId) {
      query = query.eq('journal_id', journalId)
    }
    
    const { data, error } = await query.order('line_number', { ascending: true })
    
    if (error) throw new Error(`Failed to fetch ledger entries: ${error.message}`)
    return data?.map(mapDatabaseToLedgerEntry) || []
  }

  static async createLedgerEntry(entry: Omit<LedgerEntry, 'id' | 'createdAt'>): Promise<LedgerEntry> {
    // Calculate debit/credit amounts from amountDc
    const debitAmount = entry.amountDc > 0 ? entry.amountDc : 0
    const creditAmount = entry.amountDc < 0 ? Math.abs(entry.amountDc) : 0
    
    const { data, error } = await supabaseAdmin
      .from('finm_ledger_entries')
      .insert({
        journal_id: entry.journalId,
        account_id: entry.accountId,
        debit_amount: debitAmount,
        credit_amount: creditAmount,
        description: entry.description,
        line_number: entry.lineNo || 1
      })
      .select()
      .single()
    
    if (error) throw new Error(`Failed to create ledger entry: ${error.message}`)
    return mapDatabaseToLedgerEntry(data)
  }
}