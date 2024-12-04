import { Analytics } from '@vercel/analytics/react';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { ErrorBoundary } from '@/components/error-boundary';
import { StoragePoliciesSetup } from '@/components/storage-policies-setup';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'MainMenu.io - Digital Menu Solutions for Modern Restaurants',
  description: 'Transform your restaurant menu into an interactive digital experience. QR code integration, real-time updates, and powerful analytics.',
  keywords: ['digital menu', 'restaurant menu', 'QR code menu', 'menu analytics', 'restaurant technology'],
  metadataBase: new URL('https://mainmenu.io'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mainmenu.io',
    title: 'MainMenu.io - Digital Menu Solutions for Modern Restaurants',
    description: 'Transform your restaurant menu into an interactive digital experience.',
    siteName: 'MainMenu.io',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MainMenu.io - Digital Menu Solutions',
    description: 'Transform your restaurant menu into an interactive digital experience.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>
          <Navigation />
          <main>{children}</main>
          <Footer />
          <Toaster />
          <StoragePoliciesSetup />
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  );
}