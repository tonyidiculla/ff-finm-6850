import { supabaseClientManager } from './supabase-manager';

// Get the Financial management client with proper isolation
export const supabase = supabaseClientManager.getClient({
  serviceName: 'ff-finm-6850',
  storageKey: 'supabase.auth.billing',
  options: {
  },
});

// Helper functions for ff-finm-6850
export async function getUserHospitalId(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('entity_platform_id')
    .eq('id', userId)
    .single();
    
  if (error) {
    console.error('[ff-finm-6850] Error fetching user hospital ID:', error);
    return null;
  }
  
  return data?.entity_platform_id || null;
}







// Export manager for cross-service coordination
export { supabaseClientManager };

// Performance monitoring in development
if (process.env.NODE_ENV === 'development') {
  console.log(`[ff-finm-6850] Client manager active with ${supabaseClientManager.getClientCount()} total clients`);
}