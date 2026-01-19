'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { GlassCard, GradientText } from '@/components/shared';
import { formatCompactNumber, formatCurrency } from '@/lib/utils';

interface PoolStats {
  totalLiquidity: number;
  totalBorrowed: number;
  activeLoanCount: number;
  averageAPY: number;
}

// Mock data - will be replaced with real chain data
const MOCK_POOL_STATS: PoolStats = {
  totalLiquidity: 2_450_000,
  totalBorrowed: 1_820_000,
  activeLoanCount: 47,
  averageAPY: 8.5,
};

export function LiquidityPool() {
  const [stats, setStats] = useState<PoolStats>(MOCK_POOL_STATS);
  const [animatedValues, setAnimatedValues] = useState({
    liquidity: 0,
    borrowed: 0,
    utilization: 0,
  });

  // Animate numbers on mount
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      
      setAnimatedValues({
        liquidity: Math.round(stats.totalLiquidity * eased),
        borrowed: Math.round(stats.totalBorrowed * eased),
        utilization: Math.round((stats.totalBorrowed / stats.totalLiquidity) * 100 * eased),
      });
      
      if (step >= steps) clearInterval(timer);
    }, interval);
    
    return () => clearInterval(timer);
  }, [stats]);

  const utilizationRate = (stats.totalBorrowed / stats.totalLiquidity) * 100;
  const availableLiquidity = stats.totalLiquidity - stats.totalBorrowed;

  return (
    <div className="space-y-6">
      {/* Main Pool Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Liquidity */}
        <GlassCard className="p-6 group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-electric/10 flex items-center justify-center group-hover:bg-electric/20 transition-colors">
              <PoolIcon className="w-6 h-6 text-electric" />
            </div>
            <div className="text-right">
              <span className="text-xs text-white/40 uppercase tracking-wider">Dark Pool</span>
            </div>
          </div>
          <p className="text-sm text-white/60 mb-1">Total Liquidity</p>
          <p className="text-3xl font-bold font-mono text-white">
            ${formatCompactNumber(animatedValues.liquidity)}
          </p>
          <p className="text-sm text-green-400 mt-2 flex items-center gap-1">
            <TrendUpIcon className="w-4 h-4" />
            +12.5% (7d)
          </p>
        </GlassCard>

        {/* Total Borrowed */}
        <GlassCard variant="gold" className="p-6 group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
              <BorrowedIcon className="w-6 h-6 text-gold" />
            </div>
            <div className="text-right">
              <span className="text-xs text-white/40 uppercase tracking-wider">Active</span>
            </div>
          </div>
          <p className="text-sm text-white/60 mb-1">Total Borrowed</p>
          <p className="text-3xl font-bold font-mono text-white">
            ${formatCompactNumber(animatedValues.borrowed)}
          </p>
          <p className="text-sm text-gold mt-2">
            {stats.activeLoanCount} active positions
          </p>
        </GlassCard>

        {/* Utilization Rate */}
        <GlassCard className="p-6 group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-electric/10 flex items-center justify-center group-hover:bg-electric/20 transition-colors">
              <UtilizationIcon className="w-6 h-6 text-electric" />
            </div>
          </div>
          <p className="text-sm text-white/60 mb-1">Utilization Rate</p>
          <p className="text-3xl font-bold font-mono">
            <GradientText>{animatedValues.utilization}%</GradientText>
          </p>
          {/* Utilization Bar */}
          <div className="mt-4">
            <div className="h-2 bg-void-300 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-electric to-gold"
                initial={{ width: 0 }}
                animate={{ width: `${utilizationRate}%` }}
                transition={{ duration: 2, ease: 'easeOut' }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-white/40">
              <span>0%</span>
              <span>Optimal: 80%</span>
              <span>100%</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatMini 
          label="Available" 
          value={`$${formatCompactNumber(availableLiquidity)}`}
          icon={<AvailableIcon className="w-4 h-4" />}
        />
        <StatMini 
          label="Avg. APY" 
          value={`${stats.averageAPY}%`}
          valueColor="text-green-400"
          icon={<APYIcon className="w-4 h-4" />}
        />
        <StatMini 
          label="LP Rewards" 
          value="2.1K AXIS"
          valueColor="text-gold"
          icon={<RewardsIcon className="w-4 h-4" />}
        />
        <StatMini 
          label="24h Volume" 
          value="$420K"
          icon={<VolumeIcon className="w-4 h-4" />}
        />
      </div>
    </div>
  );
}

// Mini stat component
interface StatMiniProps {
  label: string;
  value: string;
  valueColor?: string;
  icon: React.ReactNode;
}

function StatMini({ label, value, valueColor = 'text-white', icon }: StatMiniProps) {
  return (
    <GlassCard className="p-4 flex items-center gap-3">
      <div className="text-electric/60">{icon}</div>
      <div>
        <p className="text-xs text-white/40">{label}</p>
        <p className={`text-sm font-semibold font-mono ${valueColor}`}>{value}</p>
      </div>
    </GlassCard>
  );
}

// Icons
function PoolIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
    </svg>
  );
}

function BorrowedIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
    </svg>
  );
}

function UtilizationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  );
}

function TrendUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  );
}

function AvailableIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function APYIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function RewardsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  );
}

function VolumeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
    </svg>
  );
}
