import { NextRequest, NextResponse } from 'next/server'
import { SupabaseDataStore } from '@/lib/supabase-data-store'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationPlatformId = searchParams.get('organizationPlatformId')
    
    // Get entities from hospital_master table
    const entities = await SupabaseDataStore.getEntities(organizationPlatformId || undefined)
    
    return NextResponse.json(entities)
  } catch (error) {
    console.error('Failed to fetch entities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch entities' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Entities are managed by ff-orgn-6820, not FINM
  return NextResponse.json(
    { error: 'Entities must be created through the organization management service (ff-orgn-6820)' },
    { status: 403 }
  )
}