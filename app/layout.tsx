import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Rate My Accom NSW - Student Accommodation Reviews',
  description:
    'Find and review student accommodations across NSW universities. Real reviews from real students.',
  keywords: [
    'student accommodation',
    'NSW',
    'university housing',
    'reviews',
    'UNSW',
    'Sydney Uni',
    'Macquarie',
  ],
  authors: [{ name: 'Rate My Accom NSW' }],
  openGraph: {
    title: 'Rate My Accom NSW - Student Accommodation Reviews',
    description: 'Find and review student accommodations across NSW universities.',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://ratemyaccom.com',
    siteName: 'Rate My Accom NSW',
    locale: 'en_AU',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main>{children}</main>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
