'use client';

import Link from 'next/link';
import SearchBox from '@/components/search/SearchBox';
import LiveIndicator from './liveIndicator/liveIndicator';
import { useLiveStatus } from '@/contexts/LiveStatusContext';
import styles from './header.module.scss';

export default function Header() {
  const { status, streams } = useLiveStatus();

  return (
    <header className={styles.header}>
      {/* Left section: Logo */}
      <div className={styles.left}>
        <Link href="/" className={styles.logo}>
          Curtis Israel
        </Link>
      </div>

      {/* Center section: Nav links + Live indicator */}
      <div className={styles.center}>
        <nav className={styles.navLinks}>
          <Link href="/" className={styles.navLink}>
            Home
          </Link>
          <Link href="/articles" className={styles.navLink}>
            Articles
          </Link>
          <Link href="/about" className={styles.navLink}>
            About
          </Link>
          <LiveIndicator status={status} streams={streams} />
        </nav>
      </div>

      {/* Right section: Search */}
      <div className={styles.right}>
        <SearchBox />
      </div>
    </header>
  );
}
