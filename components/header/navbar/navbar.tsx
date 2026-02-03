'use client';

import Link from 'next/link';
import styles from './navbar.module.scss';
import LiveIndicator from '../liveIndicator/liveIndicator';
import { useLiveStatus } from '@/contexts/LiveStatusContext';

export default function Navbar() {
  const { isLive, isLoading } = useLiveStatus();

  return (
    <nav className={styles.navbar}>
      <div className={styles.navLinks}>
        <Link href="/" className={styles.navLink}>
          Home
        </Link>
        <Link href="/articles" className={styles.navLink}>
          Articles
        </Link>
        <Link href="/about" className={styles.navLink}>
          About
        </Link>
      </div>
      {!isLoading && <LiveIndicator isLive={isLive} />}
    </nav>
  );
}