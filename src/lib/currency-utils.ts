import { DataStore } from './unified-data-store'
import { LocationCurrency } from '@/types/accounting'

/**
 * Currency utilities for working with location-based currencies
 */
export class CurrencyUtils {
  // Cache for location currencies to avoid repeated database calls
  private static cache: Map<string, LocationCurrency> = new Map()
  private static allCurrencies: LocationCurrency[] | null = null

  /**
   * Get all available location currencies
   */
  static async getAllLocationCurrencies(): Promise<LocationCurrency[]> {
    if (!this.allCurrencies) {
      this.allCurrencies = await DataStore.getLocationCurrencies()
      // Populate cache
      this.allCurrencies.forEach(currency => {
        this.cache.set(currency.countryCode, currency)
      })
    }
    return this.allCurrencies
  }

  /**
   * Get currency information by country code
   */
  static async getCurrencyByCountryCode(countryCode: string): Promise<LocationCurrency | null> {
    // Check cache first
    if (this.cache.has(countryCode)) {
      return this.cache.get(countryCode)!
    }

    // Fetch from data store
    const currency = await DataStore.getLocationCurrencyByCountryCode(countryCode)
    if (currency) {
      this.cache.set(countryCode, currency)
    }
    return currency
  }

  /**
   * Get currency code by country code
   */
  static async getCurrencyCode(countryCode: string): Promise<string> {
    const currency = await this.getCurrencyByCountryCode(countryCode)
    return currency?.currencyCode || 'USD'
  }

  /**
   * Get currency symbol by country code
   */
  static async getCurrencySymbol(countryCode: string): Promise<string> {
    const currency = await this.getCurrencyByCountryCode(countryCode)
    return currency?.currencySymbol || '$'
  }

  /**
   * Get decimal places for currency by country code
   */
  static async getDecimalPlaces(countryCode: string): Promise<number> {
    const currency = await this.getCurrencyByCountryCode(countryCode)
    return currency?.decimalPlaces || 2
  }

  /**
   * Format amount with currency symbol
   */
  static async formatAmount(amount: number, countryCode: string): Promise<string> {
    const currency = await this.getCurrencyByCountryCode(countryCode)
    if (!currency) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount)
    }

    // Use the country's locale for formatting if possible
    const locale = this.getLocaleFromCountryCode(countryCode)
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.currencyCode,
      minimumFractionDigits: currency.decimalPlaces,
      maximumFractionDigits: currency.decimalPlaces
    }).format(amount)
  }

  /**
   * Get locale string from country code
   */
  private static getLocaleFromCountryCode(countryCode: string): string {
    const localeMap: Record<string, string> = {
      'USA': 'en-US',
      'GBR': 'en-GB', 
      'EUR': 'en-EU',
      'IND': 'en-IN',
      'SGP': 'en-SG',
      'AUS': 'en-AU',
      'CAN': 'en-CA',
      'JPN': 'ja-JP',
      'CHN': 'zh-CN',
      'ARE': 'ar-AE'
    }
    return localeMap[countryCode] || 'en-US'
  }

  /**
   * Clear the cache (useful for testing or when currencies are updated)
   */
  static clearCache(): void {
    this.cache.clear()
    this.allCurrencies = null
  }

  /**
   * Get supported country codes
   */
  static async getSupportedCountryCodes(): Promise<string[]> {
    const currencies = await this.getAllLocationCurrencies()
    return currencies.map(c => c.countryCode)
  }

  /**
   * Validate if a country code is supported
   */
  static async isCountryCodeSupported(countryCode: string): Promise<boolean> {
    const supportedCodes = await this.getSupportedCountryCodes()
    return supportedCodes.includes(countryCode)
  }
}