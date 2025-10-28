import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Raw query to hospital_master table to see entity countries
    const { data, error } = await supabase
      .from('hospital_master')
      .select('entity_name, entity_platform_id, country, organization_platform_id')
      .limit(10)
    
    if (error) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      count: data?.length || 0,
      entities: data || []
    })
  } catch (error) {
    console.error('Debug hospital query failed:', error)
    return NextResponse.json(
      { error: 'Debug query failed' },
      { status: 500 }
    )
  }
}