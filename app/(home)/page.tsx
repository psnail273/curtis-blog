import styles from './page.module.scss';

export default function Home() {
  return (
    <div>
      <h1>Tis&apos; I... Curtis!</h1>
      <p className={styles.intro}>
        I&apos;m pretty cool
      </p>
    </div>
  );
}
