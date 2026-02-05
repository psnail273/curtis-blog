import { IntroSection } from '@/components/home/IntroSection';
import StreamingStatus from '@/components/streaming/StreamingStatus';

export default function Home() {
  return (
    <div className="flex flex-col gap-16 py-8 md:gap-20 md:py-12">
      {/* Introduction: Who is Curtis */}
      <IntroSection />

      {/* Streaming Status: Prominent and actionable */}
      <StreamingStatus />
    </div>
  );
}
