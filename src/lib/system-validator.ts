import { supabaseAdmin } from './supabase'

/**
 * System validation utilities for FINM
 * Checks dependencies on external tables and services
 */
export class SystemValidator {
  /**
   * Check if location_currency table exists and is accessible
   */
  static async validateLocationCurrencyAccess(): Promise<{ 
    isAccessible: boolean; 
    error?: string;
    recordCount?: number;
  }> {
    try {
      const { data, error, count } = await supabaseAdmin
        .from('location_currency')
        .select('country_code', { count: 'exact' })
        .limit(1)
      
      if (error) {
        return {
          isAccessible: false,
          error: `Cannot access location_currency table: ${error.message}`
        }
      }
      
      return {
        isAccessible: true,
        recordCount: count || 0
      }
    } catch (error) {
      return {
        isAccessible: false,
        error: `System error accessing location_currency: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Validate that required country codes exist in location_currency
   */
  static async validateRequiredCountryCodes(countryCodes: string[]): Promise<{
    allExist: boolean;
    missing: string[];
    existing: string[];
  }> {
    try {
      const { data, error } = await supabaseAdmin
        .from('location_currency')
        .select('country_code')
        .in('country_code', countryCodes)
        .eq('is_active', true)
      
      if (error) {
        throw new Error(`Error validating country codes: ${error.message}`)
      }
      
      const existing = data?.map(row => row.country_code) || []
      const missing = countryCodes.filter(code => !existing.includes(code))
      
      return {
        allExist: missing.length === 0,
        missing,
        existing
      }
    } catch (error) {
      return {
        allExist: false,
        missing: countryCodes,
        existing: []
      }
    }
  }

  /**
   * Validate a single country code before creating a book
   */
  static async validateCountryCodeForBook(countryCode: string): Promise<{
    isValid: boolean;
    error?: string;
    currencyInfo?: {
      currencyCode: string;
      currencyName: string;
      currencySymbol: string;
    };
  }> {
    try {
      const { data, error } = await supabaseAdmin
        .from('location_currency')
        .select('country_code, currency_code, currency_name, currency_symbol')
        .eq('country_code', countryCode)
        .eq('is_active', true)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          return {
            isValid: false,
            error: `Country code '${countryCode}' not found in location_currency table`
          }
        }
        throw error
      }
      
      return {
        isValid: true,
        currencyInfo: {
          currencyCode: data.currency_code,
          currencyName: data.currency_name,
          currencySymbol: data.currency_symbol
        }
      }
    } catch (error) {
      return {
        isValid: false,
        error: `Error validating country code '${countryCode}': ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Get system health status for FINM dependencies
   */
  static async getSystemHealth(): Promise<{
    status: 'healthy' | 'warning' | 'error';
    checks: Array<{
      name: string;
      status: 'pass' | 'fail';
      message: string;
    }>;
  }> {
    const checks: Array<{
      name: string;
      status: 'pass' | 'fail';
      message: string;
    }> = []

    // Check location_currency access
    const locationCurrencyCheck = await this.validateLocationCurrencyAccess()
    checks.push({
      name: 'location_currency_access',
      status: locationCurrencyCheck.isAccessible ? 'pass' : 'fail',
      message: locationCurrencyCheck.isAccessible 
        ? `Access OK (${locationCurrencyCheck.recordCount} records)`
        : locationCurrencyCheck.error || 'Access failed'
    })

    // Check common country codes
    const commonCountries = ['USA', 'GBR', 'EUR', 'IND', 'SGP']
    const countryCheck = await this.validateRequiredCountryCodes(commonCountries)
    checks.push({
      name: 'common_currencies',
      status: countryCheck.existing.length > 0 ? 'pass' : 'fail',
      message: `${countryCheck.existing.length}/${commonCountries.length} common currencies available`
    })

    // Determine overall status
    const failedChecks = checks.filter(check => check.status === 'fail')
    const status = failedChecks.length === 0 ? 'healthy' : 
                  failedChecks.length === checks.length ? 'error' : 'warning'

    return {
      status,
      checks
    }
  }

  /**
   * Check if ff-auth-6800 service is accessible
   */
  static async validateAuthService(): Promise<{
    isAccessible: boolean;
    error?: string;
  }> {
    try {
      const authServiceUrl = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:6800'
      
      // Create timeout controller
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const response = await fetch(`${authServiceUrl}/api/health`, {
        method: 'GET',
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        return { isAccessible: true }
      } else {
        return {
          isAccessible: false,
          error: `Auth service responded with status: ${response.status}`
        }
      }
    } catch (error) {
      return {
        isAccessible: false,
        error: `Cannot reach auth service: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }
}