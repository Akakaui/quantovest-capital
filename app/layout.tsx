import './globals.css';
import type { Metadata } from 'next';
import TawkToWidget from '@/components/TawkToWidget';


export const metadata: Metadata = {
  title: 'Quantovest Capital — Institutional Investment & Multi-Asset Management',
  description: 'Access top-tier algorithmic FX, Crypto, and Stock investment strategies starting at $1,500. Track portfolio growth live.',
  keywords: ['investment management', 'FX trading', 'crypto portfolio', 'stock market', 'managed portfolio', 'quantovest capital'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body className="bg-white text-[#0A0D0C] min-h-screen flex flex-col font-sans antialiased">
        {children}
        <TawkToWidget />
      </body>
    </html>
  );
}
