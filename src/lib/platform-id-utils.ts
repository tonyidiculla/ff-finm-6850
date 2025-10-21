// Utility functions for entity platform ID generation and validation

export type EntityType = 'hospital' | 'estore' | 'pstore' | 'channel_partner'

// Entity type codes mapping
const ENTITY_TYPE_CODES: Record<EntityType, string> = {
  hospital: '01',
  estore: '02', 
  pstore: '03',
  channel_partner: '04'
}

// Reverse mapping for validation
const CODE_TO_ENTITY_TYPE: Record<string, EntityType> = {
  '01': 'hospital',
  '02': 'estore',
  '03': 'pstore', 
  '04': 'channel_partner'
}

/**
 * Generate a new entity platform ID
 * Format: E + entity_type_code (01-04) + 6 alphanumeric characters
 * 
 * @param entityType The type of entity
 * @returns A new entity platform ID (e.g., E01ABC123)
 */
export function generateEntityPlatformId(entityType: EntityType): string {
  const typeCode = ENTITY_TYPE_CODES[entityType]
  if (!typeCode) {
    throw new Error(`Invalid entity type: ${entityType}`)
  }
  
  // Generate 6 random alphanumeric characters (a-z, A-Z, 0-9)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let randomPart = ''
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return `E${typeCode}${randomPart}`
}

/**
 * Validate entity platform ID format
 * 
 * @param entityPlatformId The entity platform ID to validate
 * @returns True if valid, false otherwise
 */
export function isValidEntityPlatformId(entityPlatformId: string): boolean {
  // Check format: E + 01-04 + 6 alphanumeric chars
  const pattern = /^E(01|02|03|04)[a-zA-Z0-9]{6}$/
  return pattern.test(entityPlatformId)
}

/**
 * Extract entity type from entity platform ID
 * 
 * @param entityPlatformId The entity platform ID
 * @returns The entity type or null if invalid
 */
export function getEntityTypeFromPlatformId(entityPlatformId: string): EntityType | null {
  if (!isValidEntityPlatformId(entityPlatformId)) {
    return null
  }
  
  const typeCode = entityPlatformId.substring(1, 3)
  return CODE_TO_ENTITY_TYPE[typeCode] || null
}

/**
 * Validate that entity platform ID matches entity type
 * 
 * @param entityPlatformId The entity platform ID
 * @param entityType The expected entity type
 * @returns True if they match, false otherwise
 */
export function validateEntityPlatformIdType(entityPlatformId: string, entityType: EntityType): boolean {
  const extractedType = getEntityTypeFromPlatformId(entityPlatformId)
  return extractedType === entityType
}

/**
 * Generate organization platform ID
 * Format: C00 + 6 alphanumeric characters
 * 
 * @returns A new organization platform ID (e.g., C00ABC123)
 */
export function generateOrganizationPlatformId(): string {
  // Generate 6 random alphanumeric characters (a-z, A-Z, 0-9)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let randomPart = ''
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return `C00${randomPart}`
}

/**
 * Validate organization platform ID format
 * 
 * @param organizationPlatformId The organization platform ID to validate
 * @returns True if valid, false otherwise
 */
export function isValidOrganizationPlatformId(organizationPlatformId: string): boolean {
  // Check format: C00 + 6 alphanumeric chars
  const pattern = /^C00[a-zA-Z0-9]{6}$/
  return pattern.test(organizationPlatformId)
}