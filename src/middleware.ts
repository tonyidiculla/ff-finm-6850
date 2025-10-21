import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes (all routes except health endpoints)
const protectedRoutes = ['/dashboard', '/accounts', '/books', '/organizations', '/transactions'];
const publicRoutes = ['/api/health']; // Only health endpoints are public

async function verifyToken(token: string): Promise<boolean> {
  try {
    // Verify token with ff-auth service (the single source of truth)
    const response = await fetch('http://localhost:6800/api/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token })
    });
    
    return response.ok;
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  
  // Check if we have an auth token in URL params (from auth service redirect)
  const authToken = searchParams.get('auth_token');
  if (authToken) {
    // Verify the token
    const isValid = await verifyToken(authToken);
    if (isValid) {
      // Set the cookie and redirect to clean URL (remove token from URL)
      const cleanUrl = new URL(request.url);
      cleanUrl.searchParams.delete('auth_token');
      
      const response = NextResponse.redirect(cleanUrl);
      response.cookies.set('furfield_token', authToken, {
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        httpOnly: false,
        sameSite: 'lax'
      });
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
    
    if (!token) {
      // No token found - redirect to ff-auth with return URL
      const returnUrl = encodeURIComponent(request.url);
      return NextResponse.redirect(`http://localhost:6800?returnUrl=${returnUrl}`);
    }
    
    // Verify token with ff-auth service
    const isValid = await verifyToken(token);
    if (!isValid) {
      // Invalid token - redirect to ff-auth with return URL
      const returnUrl = encodeURIComponent(request.url);
      return NextResponse.redirect(`http://localhost:6800?returnUrl=${returnUrl}`);
    }
  }
  
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
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};