import { NextRequest, NextResponse } from 'next/server'
import { SupabaseDataStore } from '@/lib/supabase-data-store'
import { Book } from '@/types/accounting'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationPlatformId = searchParams.get('organizationPlatformId')
    const entityPlatformId = searchParams.get('entityPlatformId')

    let books = await SupabaseDataStore.getBooks()
    
    if (organizationPlatformId) {
      books = books.filter(book => book.organizationPlatformId === organizationPlatformId)
    }

    if (entityPlatformId) {
      books = books.filter(book => book.entityPlatformId === entityPlatformId)
    }

    return NextResponse.json(books)
  } catch (error) {
    console.error('Failed to fetch books:', error)
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      entityPlatformId,
      organizationPlatformId,
      entityName,
      entityType,
      name, 
      type = 'general-ledger',
      countryCode,
      fyStartMonth = 1,
      accountingStandard = 'GAAP',
      description
    } = body

    if (!entityPlatformId || !organizationPlatformId || !name || !countryCode) {
      return NextResponse.json(
        { error: 'Entity platform ID, organization platform ID, name, and country code are required' },
        { status: 400 }
      )
    }

    const book: Omit<Book, 'id' | 'createdAt'> = {
      entityPlatformId,
      organizationPlatformId,
      entityName,
      entityType,
      name,
      type,
      countryCode,
      fyStartMonth,
      accountingStandard,
      isActive: true,
      description,
    }

    const createdBook = await SupabaseDataStore.createBook(book)

    return NextResponse.json(createdBook, { status: 201 })
  } catch (error) {
    console.error('Failed to create book:', error)
    return NextResponse.json(
      { error: 'Failed to create book' },
      { status: 500 }
    )
  }
}