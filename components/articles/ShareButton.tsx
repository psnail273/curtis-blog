'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ShareButtonProps {
  /** Defaults to the current page URL at click time. */
  url?: string;
}

export function ShareButton({ url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  async function handleShare() {
    const shareUrl = url ?? window.location.href;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy to clipboard failed:', error);
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleShare}
      aria-label="Share this article"
      className="text-muted hover:text-accent shrink-0"
    >
      {copied ? (
        <Check className="size-4" aria-hidden="true" />
      ) : (
        <Share2 className="size-4" aria-hidden="true" />
      )}
      {copied ? 'Copied!' : 'Share'}
    </Button>
  );
}
