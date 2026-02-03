'use client';

import styles from './Backdrop.module.scss';

interface BackdropProps {
  isVisible: boolean;
  onClick: () => void;
}

export default function Backdrop({ isVisible, onClick }: BackdropProps) {
  if (!isVisible) return null;

  const handleClick = () => {
    onClick();
  };

  return (
    <div
      className={styles.backdrop}
      onClick={handleClick}
      aria-hidden="true"
    />
  );
}
