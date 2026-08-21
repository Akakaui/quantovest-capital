import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard — Quantovest Capital',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#0A0D0C] text-white min-h-screen font-sans antialiased">
      {children}
    </div>
  );
}
