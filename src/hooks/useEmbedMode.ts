'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to detect if the app is running in an iframe (embedded mode)
 * When embedded, the app should hide headers/navigation and use transparent backgrounds
 */
export function useEmbedMode() {
  const [isEmbedded, setIsEmbedded] = useState(false);

  useEffect(() => {
    // Check if we're in an iframe
    const inIframe = window.self !== window.top;
    setIsEmbedded(inIframe);
  }, []);

  return isEmbedded;
}
