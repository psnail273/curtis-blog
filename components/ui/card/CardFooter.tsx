import * as React from 'react';
import { cn } from '@/lib/utils';
import styles from './CardFooter.module.scss';

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn(styles.cardFooter, className)}
      {...props}
    />
  );
}

export { CardFooter };
