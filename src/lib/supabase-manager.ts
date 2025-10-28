import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface SupabaseClientConfig {
  serviceName: string;
  storageKey: string;
  options?: any;
}

class SupabaseClientManager {
  private static instance: SupabaseClientManager;
  private clients: Map<string, SupabaseClient> = new Map();
  
  private constructor() {
    // Initialize debug monitoring in development
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      this.setupDebugMonitoring();
    }
  }
  
  static getInstance(): SupabaseClientManager {
    if (!SupabaseClientManager.instance) {
      SupabaseClientManager.instance = new SupabaseClientManager();
    }
    return SupabaseClientManager.instance;
  }
  
  getClient(config: SupabaseClientConfig): SupabaseClient {
    const { serviceName, storageKey, options = {} } = config;
    
    // Return existing client if already created
    if (this.clients.has(serviceName)) {
      return this.clients.get(serviceName)!;
    }
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(`Missing Supabase environment variables for service: ${serviceName}`);
    }
    
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storageKey: storageKey,
        persistSession: true,
        autoRefreshToken: true,
        ...options.auth,
      },
      global: {
        headers: {
          'X-Service-Name': serviceName,
          'X-Service-Purpose': 'billing',
          'X-HMS-Priority': '4',
          ...options.global?.headers,
        },
      },
      ...options,
    });
    
    // Store client in map
    this.clients.set(serviceName, client);
    
    // Log client creation in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[HMS Client Manager] Created client for ${serviceName} (priority: 4)`);
      console.log(`[HMS Client Manager] Active clients: ${this.clients.size}`);
    }
    
    return client;
  }
  
  removeClient(serviceName: string): void {
    this.clients.delete(serviceName);
    if (process.env.NODE_ENV === 'development') {
      console.log(`[HMS Client Manager] Removed client for ${serviceName}`);
    }
  }
  
  clearAllClients(): void {
    this.clients.clear();
    if (process.env.NODE_ENV === 'development') {
      console.log(`[HMS Client Manager] Cleared all clients`);
    }
  }
  
  getActiveClients(): string[] {
    return Array.from(this.clients.keys());
  }
  
  getClientCount(): number {
    return this.clients.size;
  }
  
  private setupDebugMonitoring(): void {
    // Override console.warn to catch multiple client warnings
    const originalWarn = console.warn;
    console.warn = (...args: any[]) => {
      const message = args.join(' ');
      if (message.includes('Multiple GoTrueClient instances detected')) {
        console.group('[HMS Client Manager] Multiple Client Warning Intercepted');
        console.warn('🚨 Original warning:', ...args);
        console.warn('📊 Current active clients:', this.getActiveClients());
        console.warn('📈 Client count:', this.getClientCount());
        console.warn('💡 This should not happen with the client manager active');
        console.groupEnd();
      } else {
        originalWarn.apply(console, args);
      }
    };
  }
}

export const supabaseClientManager = SupabaseClientManager.getInstance();

// ff-finm-6850 specific client with proper isolation
export const supabase = supabaseClientManager.getClient({
  serviceName: 'ff-finm-6850',
  storageKey: 'supabase.auth.billing',
  options: {
    realtime: {
      params: {
        eventsPerSecond: 5,
      },
    },
  },
});

// Export the manager for cross-service usage
export default supabaseClientManager;