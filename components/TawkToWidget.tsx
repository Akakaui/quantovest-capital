'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

declare global {
  interface Window {
    Tawk_API?: {
      hideWidget?: () => void;
      showWidget?: () => void;
    };
    Tawk_LoadStart?: Date;
  }
}

const propertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID;
const widgetId = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID;
const scriptId = 'quantovest-tawk-widget-script';
const styleId = 'quantovest-tawk-widget-style';

export default function TawkToWidget() {
  const pathname = usePathname();
  const isSensitiveRoute = pathname?.startsWith('/admin') ?? false;

  useEffect(() => {
    if (!propertyId || !widgetId || isSensitiveRoute) return;

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = window.Tawk_LoadStart || new Date();

    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
      script.charset = 'UTF-8';
      script.setAttribute('crossorigin', '*');
      document.body.appendChild(script);
    }
  }, [isSensitiveRoute]);

  useEffect(() => {
    if (isSensitiveRoute) {
      window.Tawk_API?.hideWidget?.();
    } else {
      window.Tawk_API?.showWidget?.();
    }
  }, [isSensitiveRoute]);

  useEffect(() => {
    if (!propertyId || !widgetId || document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      #tawk-widget iframe,
      #tawk-chat-window,
      .tawk-min-container {
        width: 320px !important;
        height: 420px !important;
        bottom: 20px !important;
        right: 20px !important;
      }
      #tawk-chat-window {
        border-radius: 16px !important;
        overflow: hidden !important;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4) !important;
        border: 1px solid #263437 !important;
      }
      .tawk-button {
        background-color: #22C55E !important;
        width: 48px !important;
        height: 48px !important;
        border-radius: 50% !important;
        box-shadow: 0 4px 16px rgba(34, 197, 94, 0.3) !important;
      }
      .tawk-button:hover {
        background-color: #16A34A !important;
      }
      #tawk-chat-window .tawk-header {
        background-color: #0D1214 !important;
        border-bottom: 1px solid #263437 !important;
        padding: 10px 14px !important;
      }
      #tawk-chat-window .tawk-header-title {
        color: #F4F7F3 !important;
        font-size: 13px !important;
        font-weight: 600 !important;
      }
      #tawk-chat-window .tawk-chat-body {
        background-color: #0A0F11 !important;
      }
      #tawk-chat-window .tawk-message-group {
        background-color: transparent !important;
      }
      #tawk-chat-window .tawk-msg-visitor {
        background-color: #141C1F !important;
        color: #F4F7F4 !important;
        border-radius: 12px 12px 4px 12px !important;
        padding: 8px 12px !important;
        font-size: 13px !important;
        border: 1px solid #263437 !important;
      }
      #tawk-chat-window .tawk-msg-agent {
        background-color: #22C55E !important;
        color: #0A0F11 !important;
        border-radius: 12px 12px 12px 4px !important;
        padding: 8px 12px !important;
        font-size: 13px !important;
      }
      #tawk-chat-window .tawk-input-area {
        background-color: #12161A !important;
        border-top: 1px solid #263437 !important;
      }
      #tawk-chat-window .tawk-input {
        background-color: #0A0F11 !important;
        color: #F4F7F4 !important;
        border: 1px solid #263437 !important;
        border-radius: 8px !important;
        padding: 8px 12px !important;
        font-size: 13px !important;
      }
      #tawk-chat-window .tawk-input::placeholder {
        color: #93A09A !important;
      }
      #tawk-chat-window .tawk-send-btn {
        background-color: #22C55E !important;
        color: #0A0F11 !important;
      }
      #tawk-chat-window .tawk-send-btn:hover {
        background-color: #16A34A !important;
      }
      @media (max-width: 640px) {
        #tawk-chat-window,
        .tawk-min-container {
          width: min(320px, calc(100vw - 24px)) !important;
          right: 12px !important;
          bottom: 12px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }, [isSensitiveRoute]);

  return null;
}
