import type { Metadata } from 'next';
import { Inter, Source_Serif_4 } from 'next/font/google';
import './globals.css';
import Header from '@/components/header/header';
import { LiveStatusProvider, StreamConfig } from '@/contexts/LiveStatusContext';

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
  title: 'Curtis Israel',
  description: 'A personal blog by Curtis Israel covering politics, gaming, education, tech, and more.',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${sourceSerif.variable} antialiased`}>
        <LiveStatusProvider streams={streams}>
          <Header />
          <main className="mx-auto max-w-4xl px-4 md:px-8 mt-8">
            {children}
          </main>
        </LiveStatusProvider>
      </body>
    </html>
  );
}
