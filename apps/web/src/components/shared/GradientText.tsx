import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'electric' | 'gold';
  animate?: boolean;
}

/**
 * GradientText - Gradient text component for headings and emphasis
 * 
 * Variants:
 * - default: Electric blue to gold gradient
 * - electric: Pure electric blue gradient
 * - gold: Pure gold gradient
 */
export function GradientText({ 
  children, 
  className, 
  variant = 'default',
  animate = false 
}: GradientTextProps) {
  const variants = {
    default: 'gradient-text',
    electric: 'gradient-text-electric',
    gold: 'gradient-text-gold',
  };

  return (
    <span 
      className={cn(
        variants[variant],
        animate && 'animate-gradient-x bg-[length:200%_auto]',
        className
      )}
    >
      {children}
    </span>
  );
}
