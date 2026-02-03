import * as React from 'react';
import { cn } from '@/lib/utils';
import styles from './CardHeader.module.scss';

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(styles.cardHeader, className)}
      {...props}
    />
  );
}

export { CardHeader };
