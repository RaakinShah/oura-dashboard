import { ReactNode } from 'react';
import { motion } from 'framer-motion';

export interface EnhancedCardProps {
  children: ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  className?: string;
  onClick?: () => void;
}

export function EnhancedCard({
  children,
  variant = 'elevated',
  padding = 'md',
  radius = 'lg',
  shadow = 'md',
  hover = false,
  className = '',
  onClick,
}: EnhancedCardProps) {
  const variants = {
    elevated: 'bg-white border border-stone-200',
    outlined: 'bg-transparent border-2 border-stone-300',
    filled: 'bg-stone-50 border border-stone-200',
    glass: 'bg-white/70 backdrop-blur-md border border-white/20',
  };

  const paddings = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  const radiuses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  const shadows = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  const hoverClass = hover
    ? 'transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer'
    : '';

  return (
    <motion.div
      className={`${variants[variant]} ${paddings[padding]} ${radiuses[radius]} ${shadows[shadow]} ${hoverClass} ${className}`}
      onClick={onClick}
      whileHover={hover ? { scale: 1.02 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
    >
      {children}
    </motion.div>
  );
}
