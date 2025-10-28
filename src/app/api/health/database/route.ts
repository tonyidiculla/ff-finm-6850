import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const { data, error } = await supabase
      .from('finm_books')
      .select('count(*)')
      .limit(1)

    if (error) {
      return NextResponse.json(
        { 
          status: 'error',
          error: error.message,
          suggestion: 'Please run the database schema in Supabase SQL Editor'
        },
        { status: 500 }
      )
    }

    // Test location_currency table access
    const { data: locData, error: locError } = await supabase
      .from('location_currency')
      .select('country_code, currency_code')
      .limit(1)

    if (locError) {
      return NextResponse.json(
        { 
          status: 'warning',
          message: 'FINM tables exist but location_currency table is missing',
          error: locError.message,
          suggestion: 'Please create location_currency table or run sample-data.sql'
        },
        { status: 200 }
      )
    }

    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      tables: {
        finm_books: 'exists',
        location_currency: 'exists'
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        suggestion: 'Check Supabase connection and environment variables'
      },
      { status: 500 }
    )
  }
}