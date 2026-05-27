import type { Metadata } from 'next';
import { FilesPageContent } from './FilesPageContent';

export const metadata: Metadata = {
  title: 'Files',
  description: 'Browse and download shared resources, code samples, videos, PDFs, and other media files from Curtis Israel.',
  openGraph: {
    title: 'Files | Curtis Israel',
    description: 'Browse and download shared resources, code samples, videos, PDFs, and other media files from Curtis Israel.',
    url: '/files',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Files | Curtis Israel',
    description: 'Browse and download shared resources, code samples, videos, PDFs, and other media files from Curtis Israel.',
  },
};

export default function Files() {
  return <FilesPageContent />;
}
