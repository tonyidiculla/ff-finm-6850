'use client';

import React from 'react';
import { FinanceProvider } from '../context/FinanceContext';

interface FinanceAppProviderProps {
  children: React.ReactNode;
}

export function FinanceAppProvider({ children }: FinanceAppProviderProps) {
  return (
    <FinanceProvider>
      {children}
    </FinanceProvider>
  );
}

// Notification Provider for Finance alerts and messages
interface FinanceNotificationState {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  category: 'transaction' | 'invoice' | 'payment' | 'budget' | 'report' | 'compliance';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: string;
  read: boolean;
  actionRequired?: boolean;
  actionUrl?: string;
}

interface FinanceNotificationContextType {
  notifications: FinanceNotificationState[];
  addNotification: (notification: Omit<FinanceNotificationState, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  getUnreadCount: () => number;
  getByCategory: (category: string) => FinanceNotificationState[];
}

const FinanceNotificationContext = React.createContext<FinanceNotificationContextType | undefined>(undefined);

export function FinanceNotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = React.useState<FinanceNotificationState[]>([]);

  const addNotification = React.useCallback((notification: Omit<FinanceNotificationState, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: FinanceNotificationState = {
      ...notification,
      id: `fin-notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Auto-remove success notifications after 5 seconds unless action required
    if (notification.type === 'success' && !notification.actionRequired) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, 5000);
    }
    
    // Auto-remove info notifications after 8 seconds
    if (notification.type === 'info' && notification.priority === 'low') {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, 8000);
    }
  }, []);

  const markAsRead = React.useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const removeNotification = React.useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = React.useCallback(() => {
    setNotifications([]);
  }, []);

  const getUnreadCount = React.useCallback(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const getByCategory = React.useCallback((category: string) => {
    return notifications.filter(n => n.category === category);
  }, [notifications]);

  const value = React.useMemo(() => ({
    notifications,
    addNotification,
    markAsRead,
    removeNotification,
    clearAll,
    getUnreadCount,
    getByCategory,
  }), [notifications, addNotification, markAsRead, removeNotification, clearAll, getUnreadCount, getByCategory]);

  return (
    <FinanceNotificationContext.Provider value={value}>
      {children}
    </FinanceNotificationContext.Provider>
  );
}

export function useFinanceNotifications() {
  const context = React.useContext(FinanceNotificationContext);
  if (!context) {
    throw new Error('useFinanceNotifications must be used within FinanceNotificationProvider');
  }
  return context;
}

// Theme Provider for Finance UI consistency
interface FinanceTheme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    profit: string;
    loss: string;
    neutral: string;
    background: string;
    surface: string;
    text: string;
    border: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;
    };
    fontWeight: {
      normal: string;
      medium: string;
      semibold: string;
      bold: string;
    };
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}

const defaultFinanceTheme: FinanceTheme = {
  colors: {
    primary: '#1E40AF', // Blue
    secondary: '#6B7280', // Gray
    success: '#059669', // Green
    warning: '#D97706', // Orange
    error: '#DC2626', // Red
    info: '#0284C7', // Light Blue
    profit: '#16A34A', // Profit Green
    loss: '#EF4444', // Loss Red
    neutral: '#64748B', // Neutral Gray
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#1E293B',
    border: '#E2E8F0',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      xxl: '1.5rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  },
};

const FinanceThemeContext = React.createContext<FinanceTheme>(defaultFinanceTheme);

export function FinanceThemeProvider({ 
  children, 
  theme = defaultFinanceTheme 
}: { 
  children: React.ReactNode;
  theme?: FinanceTheme;
}) {
  return (
    <FinanceThemeContext.Provider value={theme}>
      {children}
    </FinanceThemeContext.Provider>
  );
}

export function useFinanceTheme() {
  return React.useContext(FinanceThemeContext);
}

// Loading Provider for Finance operations
interface FinanceLoadingState {
  [key: string]: boolean;
}

interface FinanceLoadingContextType {
  loading: FinanceLoadingState;
  setLoading: (key: string, isLoading: boolean) => void;
  isLoading: (key: string) => boolean;
  isAnyLoading: () => boolean;
  getLoadingOperations: () => string[];
}

const FinanceLoadingContext = React.createContext<FinanceLoadingContextType | undefined>(undefined);

export function FinanceLoadingProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoadingState] = React.useState<FinanceLoadingState>({});

  const setLoading = React.useCallback((key: string, isLoading: boolean) => {
    setLoadingState(prev => ({
      ...prev,
      [key]: isLoading,
    }));
  }, []);

  const isLoading = React.useCallback((key: string) => {
    return loading[key] || false;
  }, [loading]);

  const isAnyLoading = React.useCallback(() => {
    return Object.values(loading).some(Boolean);
  }, [loading]);

  const getLoadingOperations = React.useCallback(() => {
    return Object.keys(loading).filter(key => loading[key]);
  }, [loading]);

  const value = React.useMemo(() => ({
    loading,
    setLoading,
    isLoading,
    isAnyLoading,
    getLoadingOperations,
  }), [loading, setLoading, isLoading, isAnyLoading, getLoadingOperations]);

  return (
    <FinanceLoadingContext.Provider value={value}>
      {children}
    </FinanceLoadingContext.Provider>
  );
}

export function useFinanceLoading() {
  const context = React.useContext(FinanceLoadingContext);
  if (!context) {
    throw new Error('useFinanceLoading must be used within FinanceLoadingProvider');
  }
  return context;
}

// Permission Provider for Finance access control
interface FinancePermissionContextType {
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  canAccessFinancialData: (dataType: string, action: string) => boolean;
  getUserRole: () => string;
  getPermissions: () => string[];
}

const FinancePermissionContext = React.createContext<FinancePermissionContextType | undefined>(undefined);

export function FinancePermissionProvider({ 
  children,
  userRole = 'employee',
  permissions = []
}: { 
  children: React.ReactNode;
  userRole?: string;
  permissions?: string[];
}) {
  const hasPermission = React.useCallback((permission: string) => {
    return permissions.includes(permission);
  }, [permissions]);

  const hasAnyPermission = React.useCallback((requiredPermissions: string[]) => {
    return requiredPermissions.some(permission => permissions.includes(permission));
  }, [permissions]);

  const hasAllPermissions = React.useCallback((requiredPermissions: string[]) => {
    return requiredPermissions.every(permission => permissions.includes(permission));
  }, [permissions]);

  const canAccessFinancialData = React.useCallback((dataType: string, action: string) => {
    // Role-based access control logic
    if (userRole === 'admin') return true;
    if (userRole === 'finance_manager') {
      const restrictedActions = ['delete_all', 'configure_system'];
      return !restrictedActions.includes(action);
    }
    if (userRole === 'accountant') {
      const allowedDataTypes = ['transactions', 'invoices', 'reports'];
      const allowedActions = ['view', 'create', 'edit'];
      return allowedDataTypes.includes(dataType) && allowedActions.includes(action);
    }
    return false;
  }, [userRole]);

  const getUserRole = React.useCallback(() => userRole, [userRole]);
  const getPermissions = React.useCallback(() => permissions, [permissions]);

  const value = React.useMemo(() => ({
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessFinancialData,
    getUserRole,
    getPermissions,
  }), [hasPermission, hasAnyPermission, hasAllPermissions, canAccessFinancialData, getUserRole, getPermissions]);

  return (
    <FinancePermissionContext.Provider value={value}>
      {children}
    </FinancePermissionContext.Provider>
  );
}

export function useFinancePermissions() {
  const context = React.useContext(FinancePermissionContext);
  if (!context) {
    throw new Error('useFinancePermissions must be used within FinancePermissionProvider');
  }
  return context;
}

// Combined Finance Provider that includes all providers
export function ComprehensiveFinanceProvider({ 
  children,
  userRole = 'employee',
  permissions = []
}: { 
  children: React.ReactNode;
  userRole?: string;
  permissions?: string[];
}) {
  return (
    <FinanceThemeProvider>
      <FinanceLoadingProvider>
        <FinanceNotificationProvider>
          <FinancePermissionProvider userRole={userRole} permissions={permissions}>
            <FinanceAppProvider>
              {children}
            </FinanceAppProvider>
          </FinancePermissionProvider>
        </FinanceNotificationProvider>
      </FinanceLoadingProvider>
    </FinanceThemeProvider>
  );
}

// Error Boundary for Finance components
interface FinanceErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class FinanceErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  FinanceErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): FinanceErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Finance Error Boundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
    
    // In production, report this to error tracking service
    // reportErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback;
      
      if (FallbackComponent && this.state.error) {
        return <FallbackComponent error={this.state.error} />;
      }

      return (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center', 
          backgroundColor: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '0.5rem',
          margin: '1rem',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          <h2 style={{ 
            color: '#B91C1C', 
            marginBottom: '1rem',
            fontSize: '1.5rem',
            fontWeight: '600'
          }}>
            Finance System Error
          </h2>
          <p style={{ 
            color: '#7F1D1D', 
            marginBottom: '1rem',
            fontSize: '1rem'
          }}>
            Something went wrong in the Finance Management System.
          </p>
          <p style={{ 
            color: '#7F1D1D', 
            marginBottom: '1.5rem',
            fontSize: '0.875rem'
          }}>
            Please contact IT support or try refreshing the page.
          </p>
          {this.state.error && (
            <details style={{ 
              textAlign: 'left', 
              backgroundColor: '#FFF', 
              padding: '1rem', 
              borderRadius: '0.25rem',
              marginBottom: '1rem',
              border: '1px solid #E5E7EB'
            }}>
              <summary style={{ 
                cursor: 'pointer', 
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Technical Details
              </summary>
              <pre style={{ 
                fontSize: '0.75rem', 
                marginTop: '0.5rem', 
                overflow: 'auto',
                color: '#6B7280',
                maxHeight: '200px'
              }}>
                {this.state.error.message}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
          <button
            onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
            style={{
              marginRight: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#6B7280',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default {
  FinanceAppProvider,
  FinanceNotificationProvider,
  FinanceThemeProvider,
  FinanceLoadingProvider,
  FinancePermissionProvider,
  ComprehensiveFinanceProvider,
  FinanceErrorBoundary,
  useFinanceNotifications,
  useFinanceTheme,
  useFinanceLoading,
  useFinancePermissions,
};