import * as React from 'react';
import { cn } from '@/lib/utils';
import styles from './CardTitle.module.scss';

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn(styles.cardTitle, className)}
      {...props}
    />
  );
}

export { CardTitle };
