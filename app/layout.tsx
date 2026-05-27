import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Inter, Source_Serif_4 } from 'next/font/google';
import './globals.css';
import Header from '@/components/header/header';
import { Footer } from '@/components/footer/Footer';
import { LiveStatusProvider, StreamConfig } from '@/contexts/LiveStatusContext';
import { AuthProvider } from '@/components/providers/AuthProvider';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const sourceSerif = Source_Serif_4({
  variable: '--font-source-serif',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Curtis Israel',
    template: '%s | Curtis Israel',
  },
  description: 'A personal blog by Curtis Israel covering politics, gaming, education, tech, and more.',
  metadataBase: new URL('https://curtisisrael.com'),
  openGraph: {
    title: 'Curtis Israel',
    description: 'A personal blog by Curtis Israel covering politics, gaming, education, tech, and more.',
    url: 'https://curtisisrael.com',
    siteName: 'Curtis Israel',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Curtis Israel',
    description: 'A personal blog by Curtis Israel covering politics, gaming, education, tech, and more.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Configure streams to monitor
// Add or remove streams as needed
const streams: StreamConfig[] = [];

// Add Twitch stream if configured
if (process.env.NEXT_PUBLIC_TWITCH_USERNAME) {
  streams.push({
    platform: 'twitch',
    username: process.env.NEXT_PUBLIC_TWITCH_USERNAME,
  });
}

// Add YouTube stream if configured
if (process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID) {
  streams.push({
    platform: 'youtube',
    username: process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID,
  });
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch categories from database for header navigation.
  // Trade-off: this runs on every request, but the query is fast and categories
  // rarely change. If performance becomes an issue, wrap with unstable_cache.
  let categories: string[] = [];
  try {
    const { getDb } = await import('@/lib/db');
    const sql = getDb();
    const rows = await sql`
      SELECT DISTINCT category
      FROM articles
      WHERE status = 'published'
      ORDER BY category ASC
    ` as { category: string }[];
    categories = rows.map(r => r.category);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    // Continue with empty categories array
  }

  return (
    <html lang="en">
      <body className={`${inter.variable} ${sourceSerif.variable} antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-accent-foreground focus:rounded-lg focus:outline-2 focus:outline-ring focus:outline-offset-2"
        >
          Skip to main content
        </a>
        <AuthProvider>
          <LiveStatusProvider streams={streams}>
            <Suspense fallback={
              <header className="w-full border-b border-border mb-6">
                <div className="flex items-center justify-center py-4 md:py-6 px-4 md:px-8 relative">
                  <span className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-foreground tracking-tight uppercase">
                    Curtis Israel
                  </span>
                </div>
              </header>
            }>
              <Header categories={categories} />
            </Suspense>
            <main id="main-content" className="mx-auto max-w-6xl px-4 md:px-8 mt-6 md:mt-8 pb-16">
              {children}
            </main>
            <Footer />
          </LiveStatusProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
