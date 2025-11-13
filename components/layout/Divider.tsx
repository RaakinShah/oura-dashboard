export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function Divider({ orientation = 'horizontal', className = '' }: DividerProps) {
  return (
    <div
      className={`${
        orientation === 'horizontal'
          ? 'w-full h-px border-t border-stone-200'
          : 'h-full w-px border-l border-stone-200'
      } ${className}`}
      role="separator"
      aria-orientation={orientation}
    />
  );
}
