import Link from 'next/link';
import SearchBox from '@/components/search/SearchBox';
import styles from './topBar.module.scss';

export default function TopBar() {
  return (
    <div className={styles.topBar}>
      <Link href="/" className={styles.logo}>
        Curtis Israel
      </Link>
      <SearchBox />
    </div>
  );
}