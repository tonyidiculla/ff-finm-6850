'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

export function AuthCheck() {
  const pathname = usePathname();

  useEffect(() => {
    // Check if cookie exists on every route change
    const token = Cookies.get('furfield_token');
    
    if (!token) {
      console.log('No auth cookie found on client, redirecting to login...');
      window.location.href = 'http://localhost:6800/login';
    }
  }, [pathname]);

  return null;
}
