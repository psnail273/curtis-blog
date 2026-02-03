import styles from './page.module.scss';

export default function About() {
  return (
    <div>
      <h1>About me</h1>
      <p className={styles.description}>
        Learn more about the author and this blog.
      </p>
    </div>
  );
}