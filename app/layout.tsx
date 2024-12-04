import { Analytics } from '@vercel/analytics/react';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { setupStoragePolicies } from '@/lib/utils/storage-policies';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

// Set up storage policies
setupStoragePolicies();

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
        <ThemeProvider attribute="class" defaultTheme="light">
          <Navigation />
          <main>{children}</main>
          <Footer />
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}