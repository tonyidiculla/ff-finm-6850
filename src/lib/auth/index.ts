import { AuthService } from './auth-service';
import { withAuth, verifyToken, requireRole, protectRoute, getUserFromHeaders, createServiceHeader } from './middleware';

export { AuthService, withAuth, verifyToken, requireRole, protectRoute, getUserFromHeaders, createServiceHeader };
export * from './types';

// Default export for convenience
export default {
  AuthService,
  withAuth,
  verifyToken,
  requireRole,
  protectRoute,
  getUserFromHeaders,
  createServiceHeader,
};