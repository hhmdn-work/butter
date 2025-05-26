import './globals.css';
import { Staatliches, Lato } from 'next/font/google';
import type { Metadata } from 'next';
import ClientWrapper from './client/ClientWrapper';
import type { JSX } from 'react';

// Google Font Configurations
const staatliches = Staatliches({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-staatliches',
  display: 'swap',
});

const lato = Lato({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-lato',
  display: 'swap',
});

// Static metadata for the application
export const metadata: Metadata = {
  title: 'Butter',
  description: 'The Movie Expert',
    icons: {
    icon: '/images/favicon.ico',
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

/**
 * Root layout wrapper for the entire app.
 * Applies global fonts, metadata, and client context provider.
 */
export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
  return (
    <html lang="en" className={`${staatliches.variable} ${lato.variable}`}>
      <body className="font-lato bg-black text-white antialiased">
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
