import * as React from 'react';
import { cn } from '@/lib/utils';
import styles from './CardDescription.module.scss';

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn(styles.cardDescription, className)}
      {...props}
    />
  );
}

export { CardDescription };
