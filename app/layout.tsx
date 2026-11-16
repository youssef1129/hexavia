import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hexavia - Challenge Innovation',
  description: 'Outil d evaluation d idees, scoring IA et shortlist pour le challenge innovation Hexavia.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
