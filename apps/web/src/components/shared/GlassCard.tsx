import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'gold' | 'vault';
  hover?: boolean;
}

/**
 * GlassCard - Frosted glass effect component for the "Midnight Manhattan" theme
 * 
 * Variants:
 * - default: Electric blue glow
 * - gold: Gold/finance accent glow  
 * - vault: Special treatment for lending vaults
 */
export function GlassCard({ 
  children, 
  className, 
  variant = 'default',
  hover = true 
}: GlassCardProps) {
  const variants = {
    default: 'glass-card',
    gold: 'glass-card-gold',
    vault: 'vault-card',
  };

  return (
    <div 
      className={cn(
        variants[variant],
        !hover && 'hover:bg-glass-white hover:shadow-glass hover:border-glass-border',
        className
      )}
    >
      {children}
    </div>
  );
}
