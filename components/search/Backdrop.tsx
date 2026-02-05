'use client';

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
      className="fixed inset-0 bg-black/50 dark:bg-black/70 z-[900] pointer-events-auto"
      onClick={handleClick}
      aria-hidden="true"
    />
  );
}
