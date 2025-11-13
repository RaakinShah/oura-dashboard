import { ReactNode } from 'react';
import { motion } from 'framer-motion';

export interface SectionDividerProps {
  label?: string;
  icon?: ReactNode;
  variant?: 'default' | 'dashed' | 'gradient' | 'dots';
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export function SectionDivider({
  label,
  icon,
  variant = 'default',
  spacing = 'md',
  align = 'left',
  className = '',
}: SectionDividerProps) {
  const spacings = {
    sm: 'my-4',
    md: 'my-8',
    lg: 'my-12',
    xl: 'my-16',
  };

  const alignments = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  const variants = {
    default: 'border-t border-stone-200',
    dashed: 'border-t border-dashed border-stone-300',
    gradient: 'h-px bg-gradient-to-r from-transparent via-stone-300 to-transparent',
    dots: '',
  };

  if (variant === 'gradient' && !label && !icon) {
    return (
      <motion.div
        className={`${spacings[spacing]} ${className}`}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className={variants.gradient} />
      </motion.div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={`flex ${alignments[align]} ${spacings[spacing]} ${className}`}>
        <div className="flex gap-1.5">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-stone-400"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (label || icon) {
    return (
      <div className={`flex items-center ${alignments[align]} ${spacings[spacing]} ${className}`}>
        <div className={`flex-1 ${variants[variant]}`} />
        <div className="flex items-center gap-2 px-4">
          {icon && <div className="text-stone-600">{icon}</div>}
          {label && (
            <span className="text-sm font-medium text-stone-600 uppercase tracking-wider">
              {label}
            </span>
          )}
        </div>
        <div className={`flex-1 ${variants[variant]}`} />
      </div>
    );
  }

  return (
    <motion.div
      className={`${variants[variant]} ${spacings[spacing]} ${className}`}
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 0.3 }}
    />
  );
}
