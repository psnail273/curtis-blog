import type { Metadata } from 'next';
import { Geist, Geist_Mono, Playfair_Display } from 'next/font/google';
import './globals.scss';
import Header from '@/components/header/header';
import { LiveStatusProvider, StreamConfig } from '@/contexts/LiveStatusContext';
import styles from './layout.module.scss';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable}`}
        style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
      >
        <LiveStatusProvider streams={streams}>
          <Header />
          <main className={`container ${styles.main}`}>
            {children}
          </main>
        </LiveStatusProvider>
      </body>
    </html>
  );
}
