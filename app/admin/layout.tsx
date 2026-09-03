import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin — Quantovest Capital',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#0D1215] text-[#E8EFEB] min-h-screen font-sans antialiased">
      {children}
    </div>
  );
}
