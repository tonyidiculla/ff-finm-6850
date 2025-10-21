import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const countryCode = searchParams.get('countryCode')
    
    if (!countryCode) {
      return NextResponse.json(
        { error: 'countryCode parameter is required' },
        { status: 400 }
      )
    }
    
    // Get location/currency data for the specified country
    const { data, error } = await supabaseAdmin
      .from('location_currency')
      .select('country_code, country_name, currency_code, currency_name, currency_symbol, accounting_standard')
      .eq('country_code', countryCode)
      .eq('is_active', true)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: `Country code '${countryCode}' not found in location_currency table` },
          { status: 404 }
        )
      }
      throw error
    }
    
    return NextResponse.json({
      countryCode: data.country_code,
      countryName: data.country_name,
      currencyCode: data.currency_code,
      currencyName: data.currency_name,
      currencySymbol: data.currency_symbol,
      accountingStandard: data.accounting_standard
    })
  } catch (error) {
    console.error('Failed to fetch location data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch location data' },
      { status: 500 }
    )
  }
}