import { NextRequest, NextResponse } from 'next/server'
import { JsonDataStore } from '@/lib/data-store'
import { Account } from '@/types/accounting'
import { ChartOfAccountsService } from '@/lib/services/chart-of-accounts'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bookId = searchParams.get('bookId')

    let accounts = await JsonDataStore.read<Account>('accounts')
    
    if (bookId) {
      accounts = accounts.filter(account => account.bookId === bookId)
    }

    return NextResponse.json(accounts)
  } catch {
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
      await ChartOfAccountsService.createFromTemplate(bookId, template)
      const accounts = await JsonDataStore.findMany<Account>(
        'accounts',
        account => account.bookId === bookId
      )
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

      const account: Account = {
        id: JsonDataStore.generateId(),
        bookId,
        code,
        name,
        type,
        normalBalance,
        isPostable: accountData.isPostable ?? true,
        isActive: accountData.isActive ?? true,
        balance: 0,
        reportingOrder: accountData.reportingOrder ?? 0,
        requiresDocumentation: accountData.requiresDocumentation ?? false,
        createdAt: new Date(),
      }

      await JsonDataStore.create('accounts', account)
      return NextResponse.json(account, { status: 201 })
    }
  } catch {
    return NextResponse.json(
      { error: 'Failed to create account(s)' },
      { status: 500 }
    )
  }
}