import * as React from 'react';
import { cn } from '@/lib/utils';
import styles from './CardAction.module.scss';

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn(styles.cardAction, className)}
      {...props}
    />
  );
}

export { CardAction };
