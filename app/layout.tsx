import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import Header from '@/components/ui/Header';

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
    url: process.env.NEXT_PUBLIC_APP_URL,
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
        <Analytics />
        <SpeedInsights />
        <footer className="bg-gray-900 text-white mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h3 className="font-bold text-lg mb-4">Rate My Accom NSW</h3>
                <p className="text-gray-400 text-sm">
                  Helping NSW students find their perfect accommodation through honest reviews.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>
                    <a href="/" className="hover:text-white transition-colors">
                      Home
                    </a>
                  </li>
                  <li>
                    <a href="/accommodations" className="hover:text-white transition-colors">
                      Browse
                    </a>
                  </li>
                  <li>
                    <a href="/about" className="hover:text-white transition-colors">
                      About
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Universities</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>
                    <a
                      href="/accommodations?university=unsw"
                      className="hover:text-white transition-colors"
                    >
                      UNSW
                    </a>
                  </li>
                  <li>
                    <a
                      href="/accommodations?university=sydney"
                      className="hover:text-white transition-colors"
                    >
                      University of Sydney
                    </a>
                  </li>
                  <li>
                    <a
                      href="/accommodations?university=macquarie"
                      className="hover:text-white transition-colors"
                    >
                      Macquarie University
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Contact</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>
                    <a href="/help" className="hover:text-white transition-colors">
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a href="/contact" className="hover:text-white transition-colors">
                      Contact Us
                    </a>
                  </li>
                  <li>
                    <a href="/privacy" className="hover:text-white transition-colors">
                      Privacy Policy
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
              <p>&copy; 2024 Rate My Accom NSW. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
