import { NextRequest, NextResponse } from 'next/server'
import { JsonDataStore } from '@/lib/data-store'
import { Organization } from '@/types/accounting'

export async function GET() {
  try {
    const organizations = await JsonDataStore.read<Organization>('organizations')
    return NextResponse.json(organizations)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, countryCode } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const organization: Organization = {
      id: JsonDataStore.generateId(),
      name,
      countryCode,
      createdAt: new Date(),
    }

    await JsonDataStore.create('organizations', organization)

    return NextResponse.json(organization, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Failed to create organization' },
      { status: 500 }
    )
  }
}