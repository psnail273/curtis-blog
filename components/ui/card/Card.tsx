import * as React from 'react';
import { cn } from '@/lib/utils';
import styles from './Card.module.scss';

function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn(styles.card, className)}
      {...props}
    />
  );
}

export { Card };
