import { NextRequest, NextResponse } from 'next/server'
import { JsonDataStore } from '@/lib/data-store'
import { Book } from '@/types/accounting'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')

    let books = await JsonDataStore.read<Book>('books')
    
    if (organizationId) {
      books = books.filter(book => book.organizationId === organizationId)
    }

    return NextResponse.json(books)
  } catch {
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
      organizationId, 
      name, 
      type = 'general-ledger',
      baseCurrency = 'USD', 
      fyStartMonth = 1,
      accountingStandard = 'GAAP',
      description
    } = body

    if (!organizationId || !name) {
      return NextResponse.json(
        { error: 'Organization ID and name are required' },
        { status: 400 }
      )
    }

    const book: Book = {
      id: JsonDataStore.generateId(),
      organizationId,
      name,
      type,
      baseCurrency,
      fyStartMonth,
      accountingStandard,
      isActive: true,
      description,
      createdAt: new Date(),
    }

    await JsonDataStore.create('books', book)

    return NextResponse.json(book, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Failed to create book' },
      { status: 500 }
    )
  }
}