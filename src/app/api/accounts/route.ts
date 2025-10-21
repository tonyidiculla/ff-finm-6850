import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { Account } from '@/types/accounting'
import { COA_TEMPLATES } from '@/lib/services/chart-of-accounts'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bookId = searchParams.get('bookId')

    let query = supabaseAdmin.from('finm_accounts').select('*')
    
    if (bookId) {
      query = query.eq('book_id', bookId)
    }

    query = query.eq('is_active', true).order('account_code', { ascending: true })

    const { data, error } = await query

    if (error) {
      console.error('Failed to fetch accounts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch accounts', details: error.message },
        { status: 500 }
      )
    }

    // Transform database format to API format
    const accounts = (data || []).map(acc => ({
      id: acc.id,
      bookId: acc.book_id,
      code: acc.account_code,
      name: acc.account_name,
      type: acc.account_type,
      normalBalance: 'debit', // Need to add this column to DB or derive from type
      parentAccountId: acc.parent_id,
      balance: 0,
      isActive: acc.is_active,
      description: acc.description,
      createdAt: acc.created_at,
      updatedAt: acc.updated_at
    }))

    return NextResponse.json(accounts)
  } catch (error) {
    console.error('Failed to fetch accounts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookId, template, ...accountData } = body

    if (template) {
      // Create accounts from template
      const templateData = COA_TEMPLATES[template]
      
      if (!templateData) {
        return NextResponse.json(
          { error: `Template '${template}' not found` },
          { status: 400 }
        )
      }

      if (!bookId) {
        return NextResponse.json(
          { error: 'bookId is required' },
          { status: 400 }
        )
      }

      // Check if book exists
      const { data: book, error: bookError } = await supabaseAdmin
        .from('finm_books')
        .select('id')
        .eq('id', bookId)
        .single()

      if (bookError || !book) {
        return NextResponse.json(
          { error: 'Book not found' },
          { status: 404 }
        )
      }

      // Map template account types to database enum values
      const mapAccountType = (type: string): string => {
        const lowerType = type.toLowerCase()
        
        // Asset types
        if (lowerType.includes('asset')) return 'asset'
        
        // Liability types
        if (lowerType.includes('liability')) return 'liability'
        
        // Equity types (including retained_earnings, owner's equity, etc.)
        if (lowerType.includes('equity') || lowerType.includes('retained') || 
            lowerType.includes('capital') || lowerType.includes('drawing')) {
          return 'equity'
        }
        
        // Revenue types
        if (lowerType.includes('revenue') || lowerType.includes('income') || 
            lowerType.includes('sales')) {
          return 'revenue'
        }
        
        // Expense types
        if (lowerType.includes('expense') || lowerType.includes('cost')) {
          return 'expense'
        }
        
        // Default fallback - try to match the base type
        if (['asset', 'liability', 'equity', 'revenue', 'expense'].includes(lowerType)) {
          return lowerType
        }
        
        // If nothing matches, default to asset (shouldn't happen)
        console.warn(`Unknown account type: ${type}, defaulting to asset`)
        return 'asset'
      }

      // Prepare accounts for insertion
      const accountsToInsert = templateData.accounts.map(acc => ({
        book_id: bookId,
        account_code: acc.code,
        account_name: acc.name,
        account_type: mapAccountType(acc.type),
        parent_id: null,
        description: null,
        is_active: true,
        created_by: '00000000-0000-0000-0000-000000000000' // System user UUID
      }))

      // Insert accounts
      const { data: insertedAccounts, error: insertError } = await supabaseAdmin
        .from('finm_accounts')
        .insert(accountsToInsert)
        .select()

      if (insertError) {
        console.error('Failed to create accounts:', insertError)
        return NextResponse.json(
          { error: 'Failed to create accounts', details: insertError.message },
          { status: 500 }
        )
      }

      // Transform to API format
      const accounts = (insertedAccounts || []).map(acc => ({
        id: acc.id,
        bookId: acc.book_id,
        code: acc.account_code,
        name: acc.account_name,
        type: acc.account_type,
        normalBalance: 'debit', // Default, should be in template
        isActive: acc.is_active,
        balance: 0,
        createdAt: acc.created_at
      }))

      return NextResponse.json(accounts, { status: 201 })
    } else {
      // Create individual account
      const { code, name, type, normalBalance } = accountData

      if (!bookId || !code || !name || !type || !normalBalance) {
        return NextResponse.json(
          { error: 'Required fields: bookId, code, name, type, normalBalance' },
          { status: 400 }
        )
      }

      const accountToInsert = {
        book_id: bookId,
        account_code: code,
        account_name: name,
        account_type: type,
        parent_id: null,
        description: accountData.description || null,
        is_active: accountData.isActive ?? true,
        created_by: '00000000-0000-0000-0000-000000000000' // System user UUID
      }

      const { data: insertedAccount, error: insertError } = await supabaseAdmin
        .from('finm_accounts')
        .insert(accountToInsert)
        .select()
        .single()

      if (insertError) {
        console.error('Failed to create account:', insertError)
        return NextResponse.json(
          { error: 'Failed to create account', details: insertError.message },
          { status: 500 }
        )
      }

      const account = {
        id: insertedAccount.id,
        bookId: insertedAccount.book_id,
        code: insertedAccount.account_code,
        name: insertedAccount.account_name,
        type: insertedAccount.account_type,
        normalBalance: normalBalance,
        isActive: insertedAccount.is_active,
        balance: 0,
        createdAt: insertedAccount.created_at
      }

      return NextResponse.json(account, { status: 201 })
    }
  } catch (error) {
    console.error('Failed to create account(s):', error)
    return NextResponse.json(
      { error: 'Failed to create account(s)' },
      { status: 500 }
    )
  }
}