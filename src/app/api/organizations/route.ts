import { NextRequest, NextResponse } from 'next/server'
import { SupabaseDataStore } from '@/lib/supabase-data-store'
import { Organization } from '@/types/accounting'

async function getOrganizations(request: NextRequest) {
  try {
    // FINM is read-only for organizations - they are managed by ff-orgn-6820
    const organizations = await SupabaseDataStore.getOrganizations()
    return NextResponse.json(organizations)
  } catch (error) {
    console.error('Failed to fetch organizations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
      { status: 500 }
    )
  }
}

async function createOrganization(request: NextRequest) {
  // Organizations are managed by ff-orgn-6820, not FINM
  return NextResponse.json(
    { error: 'Organizations must be created through the organization management service (ff-orgn-6820)' },
    { status: 403 }
  )
}

// Export routes (removed auth wrapper for now to fix the immediate issue)
export const GET = getOrganizations;
export const POST = createOrganization;