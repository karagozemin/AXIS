'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/shared/GlassCard';
import { GradientText } from '@/components/shared/GradientText';

interface LPPosition {
  id: string;
  amount: number;
  depositDate: Date;
  unlockDate: Date;
  earnedYield: number;
  status: 'locked' | 'unlocked' | 'withdrawn';
}

// Mock positions data
const mockPositions: LPPosition[] = [
  {
    id: 'AXIS-LP-A7B3C9D2',
    amount: 5000,
    depositDate: new Date('2024-11-01'),
    unlockDate: new Date('2025-02-01'),
    earnedYield: 125.5,
    status: 'locked',
  },
  {
    id: 'AXIS-LP-E4F8G1H5',
    amount: 2500,
    depositDate: new Date('2024-10-15'),
    unlockDate: new Date('2024-12-15'),
    earnedYield: 78.25,
    status: 'unlocked',
  },
];

export function LPPositions() {
  const totalDeposited = mockPositions.reduce((sum, p) => sum + p.amount, 0);
  const totalEarned = mockPositions.reduce((sum, p) => sum + p.earnedYield, 0);

  const getStatusColor = (status: LPPosition['status']) => {
    switch (status) {
      case 'locked':
        return 'text-accent-violet bg-accent-violet/20';
      case 'unlocked':
        return 'text-accent-gold bg-accent-gold/20';
      case 'withdrawn':
        return 'text-gray-500 bg-gray-500/20';
    }
  };

  const getDaysRemaining = (unlockDate: Date) => {
    const now = new Date();
    const diff = unlockDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <GlassCard className="p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider">Total Deposited</div>
          <GradientText variant="gold" className="text-2xl font-bold">
            {totalDeposited.toLocaleString()} ALEO
          </GradientText>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider">Total Earned</div>
          <GradientText variant="gold" className="text-2xl font-bold">
            +{totalEarned.toFixed(2)} ALEO
          </GradientText>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider">Active Positions</div>
          <div className="text-2xl font-bold text-white">
            {mockPositions.filter(p => p.status !== 'withdrawn').length}
          </div>
        </GlassCard>
      </div>

      {/* Positions List */}
      <GlassCard variant="vault" className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Your LP Positions</h3>
        <div className="space-y-4">
          {mockPositions.map((position, index) => (
            <motion.div
              key={position.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-midnight-800/30 rounded-lg p-4 border border-midnight-700"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="font-mono text-sm text-gray-400">{position.id}</div>
                <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(position.status)}`}>
                  {position.status}
                </span>
              </div>
              
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-500 text-xs">Deposited</div>
                  <div className="text-white font-semibold">{position.amount.toLocaleString()} ALEO</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">Earned</div>
                  <div className="text-green-400 font-semibold">+{position.earnedYield.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">
                    {position.status === 'locked' ? 'Days Left' : 'Unlock Date'}
                  </div>
                  <div className="text-white">
                    {position.status === 'locked'
                      ? `${getDaysRemaining(position.unlockDate)} days`
                      : position.unlockDate.toLocaleDateString()
                    }
                  </div>
                </div>
                <div className="flex items-center justify-end">
                  {position.status === 'unlocked' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-gradient-to-r from-accent-gold to-amber-500 text-black rounded-lg font-semibold text-sm"
                    >
                      Withdraw
                    </motion.button>
                  )}
                  {position.status === 'locked' && (
                    <div className="text-xs text-gray-500">
                      Locked until {position.unlockDate.toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Progress bar for locked positions */}
              {position.status === 'locked' && (
                <div className="mt-4">
                  <div className="h-1 bg-midnight-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-accent-violet to-accent-gold"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${
                          ((Date.now() - position.depositDate.getTime()) /
                            (position.unlockDate.getTime() - position.depositDate.getTime())) *
                          100
                        }%`,
                      }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
