import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Check location_currency table structure and data
    const { data, error } = await supabase
      .from('location_currency')
      .select('*')
      .limit(10)
    
    if (error) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      count: data?.length || 0,
      sample_data: data || [],
      columns: data && data.length > 0 ? Object.keys(data[0]) : []
    })
  } catch (error) {
    console.error('Debug location_currency query failed:', error)
    return NextResponse.json(
      { error: 'Debug query failed' },
      { status: 500 }
    )
  }
}