import type { Metadata } from 'next';
import { StreamsPageContent } from './StreamsPageContent';

export const metadata: Metadata = {
  title: 'Streams',
  description: 'Watch live streams and past broadcasts from Curtis Israel on Twitch and YouTube.',
  openGraph: {
    title: 'Streams | Curtis Israel',
    description: 'Watch live streams and past broadcasts.',
  },
};

export default function StreamsPage() {
  return (
    <div className="py-4 md:py-6">
      <h1 className="sr-only">Streams</h1>
      <StreamsPageContent />
    </div>
  );
}
