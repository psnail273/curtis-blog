import * as React from 'react';
import { cn } from '@/lib/utils';
import styles from './CardContent.module.scss';

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn(styles.cardContent, className)}
      {...props}
    />
  );
}

export { CardContent };
