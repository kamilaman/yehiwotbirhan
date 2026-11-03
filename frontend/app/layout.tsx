import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/components/LanguageContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'BATU YEHIYWOT BERHAN CHURCH — Ziway / Batu, Ethiopia',
    template: '%s | BATU YEHIYWOT BERHAN CHURCH',
  },
  description:
    'Official website of BATU YEHIYWOT BERHAN CHURCH in Batu (Ziway), Ethiopia. Join us for vibrant Sunday worship, biblical truth, ministries, community care, and the church building expansion project.',
  keywords: [
    'Hiwot Birhan Church',
    'Batu Church',
    'Ziway Church',
    'Ethiopian Evangelical Church',
    'Pastor Zerfu',
    'Building Fund Ethiopia',
    'Telebirr Church Donation',
  ],
  icons: {
    icon: '/images/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased bg-cream text-slate flex flex-col min-h-screen">
        <LanguageProvider>
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <Navbar />
          <main id="main-content" className="flex-grow">
            {children}
          </main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
