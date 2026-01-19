'use client';

import { motion } from 'framer-motion';
import { LiquidityPool, CreditScoreCard } from '@/components/dashboard';
import { GlassCard } from '@/components/shared/GlassCard';
import { GradientText } from '@/components/shared/GradientText';

export default function VaultsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Vault Dashboard</h1>
        <p className="text-gray-400 mt-1">
          Monitor the Dark Pool and your positions in real-time
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Liquidity Pool - Full width */}
        <div className="col-span-12">
          <LiquidityPool />
        </div>

        {/* Credit Score Card */}
        <div className="col-span-12 lg:col-span-4">
          <CreditScoreCard />
        </div>

        {/* Quick Stats */}
        <div className="col-span-12 lg:col-span-8">
          <GlassCard variant="vault" className="p-6 h-full">
            <h3 className="text-lg font-semibold text-white mb-4">Pool Analytics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-midnight-800/30 rounded-lg p-4"
              >
                <div className="text-xs text-gray-500 uppercase tracking-wider">Active Loans</div>
                <div className="text-2xl font-bold text-white mt-1">847</div>
                <div className="text-xs text-green-400 mt-1">+12 today</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-midnight-800/30 rounded-lg p-4"
              >
                <div className="text-xs text-gray-500 uppercase tracking-wider">Avg Loan Size</div>
                <div className="text-2xl font-bold text-white mt-1">$2,450</div>
                <div className="text-xs text-gray-400 mt-1">1,000 ALEO</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-midnight-800/30 rounded-lg p-4"
              >
                <div className="text-xs text-gray-500 uppercase tracking-wider">Default Rate</div>
                <div className="text-2xl font-bold text-green-400 mt-1">0.8%</div>
                <div className="text-xs text-gray-400 mt-1">Below target</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-midnight-800/30 rounded-lg p-4"
              >
                <div className="text-xs text-gray-500 uppercase tracking-wider">LP Count</div>
                <div className="text-2xl font-bold text-white mt-1">324</div>
                <div className="text-xs text-accent-gold mt-1">$2.4M TVL</div>
              </motion.div>
            </div>

            {/* Recent Activity */}
            <div className="mt-6">
              <h4 className="text-sm text-gray-400 mb-3">Recent Activity</h4>
              <div className="space-y-2">
                {[
                  { type: 'borrow', amount: '2,500 ALEO', time: '2 min ago', tier: 'PRIME' },
                  { type: 'deposit', amount: '10,000 ALEO', time: '5 min ago', tier: null },
                  { type: 'repay', amount: '1,200 ALEO', time: '12 min ago', tier: null },
                  { type: 'borrow', amount: '5,000 ALEO', time: '18 min ago', tier: 'SHADOW' },
                ].map((activity, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="flex items-center justify-between py-2 border-b border-midnight-700 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          activity.type === 'borrow'
                            ? 'bg-accent-violet'
                            : activity.type === 'deposit'
                            ? 'bg-accent-gold'
                            : 'bg-green-400'
                        }`}
                      />
                      <span className="text-sm text-gray-300 capitalize">{activity.type}</span>
                      {activity.tier && (
                        <span className="text-xs px-2 py-0.5 rounded bg-midnight-700 text-gray-400">
                          {activity.tier}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-white font-mono">{activity.amount}</span>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Your Positions */}
      <GlassCard variant="vault" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Your Active Loans</h3>
          <a
            href="/borrow"
            className="text-sm text-accent-violet hover:text-accent-violet/80 transition-colors"
          >
            Access Liquidity →
          </a>
        </div>
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-midnight-800 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <p className="text-gray-500">No active loans</p>
          <p className="text-gray-600 text-sm mt-1">
            Connect your wallet and mint your Credit Bond to get started
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
