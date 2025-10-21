import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from './auth/auth-service';

const authService = new AuthService();

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface AuthenticatedRequest extends NextRequest {
  user?: AuthenticatedUser;
}

export function withAuth<T extends any[]>(
  handler: (request: NextRequest, user: AuthenticatedUser, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      // Get token from Authorization header
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Authorization header missing or invalid' },
          { status: 401 }
        );
      }

      const token = authHeader.substring(7);

      // Get user profile from auth service
      const user = await authService.getUserProfile(token);
      if (!user) {
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        );
      }

      // Call the original handler with the authenticated user
      return handler(request, user as AuthenticatedUser, ...args);
    } catch (error) {
      console.error('Authentication error:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      );
    }
  };
}

export function withOptionalAuth<T extends any[]>(
  handler: (request: NextRequest, user: AuthenticatedUser | null, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      const authHeader = request.headers.get('authorization');
      let user: AuthenticatedUser | null = null;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const userProfile = await authService.getUserProfile(token);
        if (userProfile) {
          user = userProfile as AuthenticatedUser;
        }
      }

      return handler(request, user, ...args);
    } catch (error) {
      console.error('Optional authentication error:', error);
      return handler(request, null, ...args);
    }
  };
}