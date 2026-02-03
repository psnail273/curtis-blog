import Navbar from './navbar/navbar';
import TopBar from './topBar/topBar';
import styles from './header.module.scss';

export default function Header() {
  return (
    <header className={styles.header}>
      <TopBar />
      <Navbar />
    </header>
  );
}