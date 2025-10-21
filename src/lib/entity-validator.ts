import { DataStore } from './unified-data-store'
import { generateEntityPlatformId, isValidEntityPlatformId, getEntityTypeFromPlatformId } from './platform-id-utils'

/**
 * Entity validation utilities for FINM
 * Since entities are managed by ff-orgn-6820, FINM needs to validate entity references
 */
export class EntityValidator {
  /**
   * Validate that an entity platform ID exists and is accessible
   * This should ideally call ff-orgn-6820 API to verify entity exists
   */
  static async validateEntityExists(entityPlatformId: string): Promise<boolean> {
    // Basic format validation
    if (!isValidEntityPlatformId(entityPlatformId)) {
      return false
    }

    try {
      // Check if entity exists in our books (has been used before)
      const entity = await DataStore.getEntityById(entityPlatformId)
      return entity !== null
    } catch (error) {
      console.warn(`Error validating entity ${entityPlatformId}:`, error)
      return false
    }
  }

  /**
   * Validate entity platform ID format and type consistency
   */
  static validateEntityPlatformId(entityPlatformId: string, expectedEntityType?: string): { isValid: boolean; error?: string } {
    // Format validation
    if (!isValidEntityPlatformId(entityPlatformId)) {
      return {
        isValid: false,
        error: 'Invalid entity platform ID format. Expected: E + entity_type_code + 6 alphanumeric chars'
      }
    }

    // Type consistency validation
    if (expectedEntityType) {
      const extractedType = getEntityTypeFromPlatformId(entityPlatformId)
      if (extractedType !== expectedEntityType) {
        return {
          isValid: false,
          error: `Entity type mismatch. Expected ${expectedEntityType}, got ${extractedType}`
        }
      }
    }

    return { isValid: true }
  }

  /**
   * Get entity information for UI display
   * Returns basic entity info or placeholder if not found
   */
  static async getEntityDisplayInfo(entityPlatformId: string): Promise<{
    platformId: string
    name: string
    type: string
    exists: boolean
  }> {
    try {
      const entity = await DataStore.getEntityById(entityPlatformId)
      if (entity) {
        return {
          platformId: entity.entityPlatformId,
          name: entity.entityName,
          type: entity.entityType,
          exists: true
        }
      }
    } catch (error) {
      console.warn(`Error fetching entity info for ${entityPlatformId}:`, error)
    }

    // Return placeholder info if entity not found
    const entityType = getEntityTypeFromPlatformId(entityPlatformId)
    return {
      platformId: entityPlatformId,
      name: `Unknown Entity (${entityPlatformId})`,
      type: entityType || 'unknown',
      exists: false
    }
  }

  /**
   * Suggest creating entity in ff-orgn-6820 if it doesn't exist
   */
  static getEntityCreationMessage(entityPlatformId: string): string {
    const entityType = getEntityTypeFromPlatformId(entityPlatformId)
    const typeDisplay = entityType ? entityType.replace('_', ' ') : 'entity'
    
    return `Entity ${entityPlatformId} not found. Please create this ${typeDisplay} in the Organization Management (ff-orgn-6820) app first.`
  }

  /**
   * Get available entity types for UI dropdowns
   */
  static getEntityTypes(): Array<{ code: string; label: string; platformPrefix: string }> {
    return [
      { code: 'hospital', label: 'Hospital', platformPrefix: 'E01' },
      { code: 'estore', label: 'E-Store', platformPrefix: 'E02' },
      { code: 'pstore', label: 'Physical Store', platformPrefix: 'E03' },
      { code: 'channel_partner', label: 'Channel Partner', platformPrefix: 'E04' }
    ]
  }

  /**
   * Generate a sample entity platform ID for given type (for UI examples)
   */
  static generateSampleEntityId(entityType: 'hospital' | 'estore' | 'pstore' | 'channel_partner'): string {
    return generateEntityPlatformId(entityType)
  }
}