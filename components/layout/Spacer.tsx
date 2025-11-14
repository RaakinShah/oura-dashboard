export interface SpacerProps {
  size?: number;
  axis?: 'horizontal' | 'vertical' | 'both';
  className?: string;
}

export function Spacer({ size = 4, axis = 'vertical', className = '' }: SpacerProps) {
  const spacing = `${size * 0.25}rem`;
  
  const style: React.CSSProperties = {
    ...(axis === 'vertical' || axis === 'both' ? { height: spacing } : {}),
    ...(axis === 'horizontal' || axis === 'both' ? { width: spacing } : {}),
  };

  return <div style={style} className={className} aria-hidden="true" />;
}
