import type { Metadata } from 'next';
import './globals.css';
import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = {
  title: 'Sonner',
  description: 'An opinionated toast component for React.',
  openGraph: {
    title: 'Sonner',
    description: 'An opinionated toast component for React.',
    url: 'https://sonner.emilkowal.ski/',
    siteName: 'Sonner',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    title: 'Sonner',
    card: 'summary_large_image',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body>{children}</body>
      <Analytics />
    </html>
  );
}
