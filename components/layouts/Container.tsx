import { ReactNode } from 'react';

export interface ContainerProps {
  children: ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  center?: boolean;
  className?: string;
}

export function Container({
  children,
  size = 'xl',
  padding = 'md',
  center = true,
  className = '',
}: ContainerProps) {
  const sizes = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
  };

  const paddings = {
    none: '',
    sm: 'px-4',
    md: 'px-6',
    lg: 'px-8',
  };

  return (
    <div
      className={`${sizes[size]} ${paddings[padding]} ${center ? 'mx-auto' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

export interface SectionProps {
  children: ReactNode;
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  background?: 'transparent' | 'white' | 'stone' | 'gradient';
  className?: string;
}

export function Section({
  children,
  spacing = 'md',
  background = 'transparent',
  className = '',
}: SectionProps) {
  const spacings = {
    none: '',
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16',
    xl: 'py-24',
  };

  const backgrounds = {
    transparent: '',
    white: 'bg-white',
    stone: 'bg-stone-50',
    gradient: 'bg-gradient-to-b from-white to-stone-50',
  };

  return (
    <section className={`${spacings[spacing]} ${backgrounds[background]} ${className}`}>
      {children}
    </section>
  );
}
