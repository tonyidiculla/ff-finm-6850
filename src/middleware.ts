import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes (all routes except health endpoints)
const protectedRoutes = ['/dashboard', '/accounts', '/books', '/organizations', '/transactions', '/reports'];
const publicRoutes = ['/api/health']; // Only health endpoints are public

// Simple in-memory cache for token verification (valid for 30 seconds)
const tokenCache = new Map<string, { valid: boolean; expires: number }>();

async function verifyToken(token: string): Promise<boolean> {
  // Check cache first
  const cached = tokenCache.get(token);
  if (cached && cached.expires > Date.now()) {
    console.log('[Middleware] Using cached token verification');
    return cached.valid;
  }

  try {
    // Verify token with ff-auth service (the single source of truth)
    const response = await fetch('http://localhost:6800/api/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const isValid = response.ok;
    
    // Cache the result for 30 seconds
    tokenCache.set(token, {
      valid: isValid,
      expires: Date.now() + 30000,
    });
    
    return isValid;
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  
  console.log('[Middleware] Request:', pathname, 'Query:', Object.fromEntries(searchParams.entries()));
  
  // Check if we have an auth token in URL params (from auth service redirect)
  const authToken = searchParams.get('auth_token');
  if (authToken) {
    console.log('[Middleware] Auth token in URL, verifying...');
    // Verify the token
    const isValid = await verifyToken(authToken);
    console.log('[Middleware] Token verification result:', isValid);
    if (isValid) {
      console.log('[Middleware] Setting cookie and redirecting');
      // Set the cookie and redirect to clean URL (remove token from URL)
      const cleanUrl = new URL(request.url);
      cleanUrl.searchParams.delete('auth_token');
      
      const response = NextResponse.redirect(cleanUrl);
      response.cookies.set('furfield_token', authToken, {
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        httpOnly: false,
        sameSite: 'strict',
      });
      console.log('[Middleware] Cookie set, redirecting to:', cleanUrl.pathname);
      return response;
    }
  }
  
  // Allow public routes (health checks, etc.)
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // Special handling for root route - redirect to dashboard
  if (pathname === '/') {
    const token = request.cookies.get('furfield_token')?.value;
    
    if (!token) {
      // No token - redirect to ff-auth with dashboard as return URL
      const returnUrl = encodeURIComponent('http://localhost:6850/dashboard');
      return NextResponse.redirect(`http://localhost:6800?returnUrl=${returnUrl}`);
    }
    
    // Verify token
    const isValid = await verifyToken(token);
    if (!isValid) {
      // Invalid token - redirect to ff-auth with dashboard as return URL
      const returnUrl = encodeURIComponent('http://localhost:6850/dashboard');
      return NextResponse.redirect(`http://localhost:6800?returnUrl=${returnUrl}`);
    }
    
    // Valid token - redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // All other routes are protected and require authentication
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute) {
    // Get token from cookie
    const token = request.cookies.get('furfield_token')?.value;
    
    console.log('[Middleware] Protected route:', pathname, 'Token present:', !!token);
    
    if (!token) {
      // No token found - redirect to ff-auth with return URL
      console.log('[Middleware] No token - redirecting to auth');
      const returnUrl = encodeURIComponent(request.url);
      return NextResponse.redirect(`http://localhost:6800?returnUrl=${returnUrl}`);
    }
    
    // Verify token with ff-auth service
    const isValid = await verifyToken(token);
    console.log('[Middleware] Token verification result:', isValid);
    
    if (!isValid) {
      // Invalid token - redirect to ff-auth with return URL
      console.log('[Middleware] Invalid token - redirecting to auth');
      const returnUrl = encodeURIComponent(request.url);
      return NextResponse.redirect(`http://localhost:6800?returnUrl=${returnUrl}`);
    }
  }
  
  console.log('[Middleware] Allowing request to:', pathname);
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - accounts, transactions (temporarily bypass for debugging)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};