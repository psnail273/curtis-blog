'use client';

import styles from './liveIndicator.module.scss';

interface LiveIndicatorProps {
  isLive: boolean;
}

export default function LiveIndicator({ isLive }: LiveIndicatorProps) {
  if (!isLive) return null;

  return (
    <div className={styles.liveIndicator}>
      <span className={styles.liveDot}></span>
      <span className={styles.liveText}>LIVE</span>
    </div>
  );
}
