import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for frontend usage (with RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for backend/API usage (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Database types
export interface DatabaseLocationCurrency {
  id: string
  country_code: string
  country_name: string
  currency_code: string
  currency_name: string
  currency_symbol?: string
  decimal_places: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DatabaseBook {
  id: string
  entity_platform_id: string // E + 01-04 + 6 alphanumeric chars
  organization_platform_id: string // C00XXXXXX format
  entity_name: string
  entity_type: 'hospital' | 'estore' | 'pstore' | 'channel_partner'
  name: string
  book_type: string
  country_code: string // References location_currency table
  fy_start_month: number
  accounting_standard: string
  is_active: boolean
  description?: string
  created_at: string
  updated_at: string
}

export interface DatabaseAccount {
  id: string
  book_id: string
  code: string
  name: string
  account_type: string
  sub_type?: string
  normal_balance: 'debit' | 'credit'
  parent_account_id?: string
  balance: number
  is_system: boolean
  is_active: boolean
  description?: string
  created_at: string
  updated_at: string
}

export interface DatabaseJournal {
  id: string
  book_id: string
  journal_number?: string
  reference?: string
  date: string
  description: string
  status: 'draft' | 'posted' | 'reversed'
  total_amount: number
  created_by?: string
  created_at: string
  updated_at: string
  posted_at?: string
}

export interface DatabaseLedgerEntry {
  id: string
  journal_id: string
  account_id: string
  debit_amount: number
  credit_amount: number
  description?: string
  line_number: number
  created_at: string
}

export interface DatabaseContact {
  id: string
  book_id: string
  contact_type: 'customer' | 'supplier' | 'both'
  name: string
  email?: string
  phone?: string
  address?: string
  tax_id?: string
  payment_terms: number
  credit_limit: number
  is_active: boolean
  created_at: string
  updated_at: string
}