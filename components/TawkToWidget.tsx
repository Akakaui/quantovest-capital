'use client';

import React, { useEffect } from 'react';

export default function TawkToWidget() {
  useEffect(() => {
    // Tawk.to Live Chat Widget
    // Replace the property and widget IDs with your own from https://tawk.to
    const propertyId = 'REPLACE_WITH_YOUR_TAWK_PROPERTY_ID';
    const widgetId = 'REPLACE_WITH_YOUR_TAWK_WIDGET_ID';

    if (typeof window !== 'undefined' && !(window as any).Tawk_API) {
      (window as any).Tawk_API = (window as any).Tawk_API || {};
      (window as any).Tawk_LoadStart = new Date();

      const script = document.createElement('script');
      script.async = true;
      script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
      script.charset = 'UTF-8';
      script.setAttribute('crossorigin', '*');
      document.head.appendChild(script);

      return () => {
        // Cleanup on unmount
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    }
  }, []);

  return null;
}
