import { ReactNode } from 'react';

export interface CenterProps {
  children: ReactNode;
  inline?: boolean;
  className?: string;
}

export function Center({ children, inline = false, className = '' }: CenterProps) {
  return (
    <div
      className={`${inline ? 'inline-flex' : 'flex'} items-center justify-center ${className}`}
    >
      {children}
    </div>
  );
}
