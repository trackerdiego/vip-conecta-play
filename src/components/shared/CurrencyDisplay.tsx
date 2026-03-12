import { cn } from '@/lib/utils';

interface CurrencyDisplayProps {
  value: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  glow?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'text-lg font-semibold',
  md: 'text-2xl font-bold',
  lg: 'text-4xl font-bold',
  xl: 'text-5xl font-bold',
};

export function CurrencyDisplay({ value, size = 'md', glow = false, className }: CurrencyDisplayProps) {
  const formatted = value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  return (
    <span className={cn(
      sizeClasses[size],
      'font-heading tabular-nums tracking-tight',
      glow && 'text-glow-purple',
      className
    )}>
      {formatted}
    </span>
  );
}
