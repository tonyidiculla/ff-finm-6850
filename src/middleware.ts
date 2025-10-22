import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes (all routes except health endpoints)
const protectedRoutes = ['/', '/accounts', '/books', '/transactions', '/reports'];
const publicRoutes = ['/api/health']; // Only health endpoints are public

// Simple in-memory cache for token verification (valid for 30 seconds)
const tokenCache = new Map<string, { valid: boolean; expires: number }>();

async function verifyToken(token: string): Promise<boolean> {
  // Check cache first
  const cached = tokenCache.get(token);
  if (cached && cached.expires > Date.now()) {
    console.log('[Finance Middleware] Using cached token verification');
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
    console.error('[Finance Middleware] Token verification failed:', error);
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  
  console.log('[Finance Middleware] Request:', pathname);
  
  // Allow public routes (health checks, etc.)
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // Check for authentication token in cookies OR URL query parameter
  let token = request.cookies.get('furfield_token')?.value;
  const tokenFromUrl = searchParams.get('token');
  
  // If token in URL but not in cookie, use URL token and set cookie
  if (!token && tokenFromUrl) {
    token = tokenFromUrl;
    console.log('[Finance Middleware] Token found in URL, will set cookie');
  }
  
  if (!token) {
    console.log('[Finance Middleware] No token found, redirecting to auth');
    // No token - redirect to ff-auth
    return NextResponse.redirect('http://localhost:6800/login');
  }
  
  // Verify token
  const isValid = await verifyToken(token);
  if (!isValid) {
    console.log('[Finance Middleware] Invalid token, redirecting to auth');
    // Invalid token - clear cookies and redirect to ff-auth
    const response = NextResponse.redirect('http://localhost:6800/login');
    response.cookies.delete('furfield_token');
    response.cookies.delete('furfield_user');
    return response;
  }
  
  console.log('[Finance Middleware] Token valid, allowing access');
  
  // If token was from URL, set it as cookie and redirect to clean URL
  if (tokenFromUrl) {
    const response = NextResponse.redirect(new URL(pathname, request.url));
    response.cookies.set('furfield_token', token, {
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
      httpOnly: false,
      sameSite: 'lax',
      secure: false,
    });
    return response;
  }
  
  // Valid token - allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$).*)',
  ],
};