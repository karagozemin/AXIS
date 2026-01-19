'use client';

import { motion } from 'framer-motion';
import { LiquidityPool, CreditScoreCard } from '@/components/dashboard';
import { GlassCard } from '@/components/shared/GlassCard';
import { GradientText } from '@/components/shared/GradientText';
import { useLoanContext } from '@/contexts/LoanContext';
import Link from 'next/link';

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export default function VaultsPage() {
  const { loans, deposits, activeLoans, totalDeposited, totalBorrowed } = useLoanContext();
  
  // Combine loans and deposits for activity feed
  const allActivity = [...loans, ...deposits]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 10);

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
                <div className="text-xs text-gray-500 uppercase tracking-wider">Your Loans</div>
                <div className="text-2xl font-bold text-white mt-1">{activeLoans.length}</div>
                <div className="text-xs text-accent-violet mt-1">${totalBorrowed.toLocaleString()}</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-midnight-800/30 rounded-lg p-4"
              >
                <div className="text-xs text-gray-500 uppercase tracking-wider">Your Deposits</div>
                <div className="text-2xl font-bold text-white mt-1">{deposits.length}</div>
                <div className="text-xs text-accent-gold mt-1">${totalDeposited.toLocaleString()}</div>
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
              <h4 className="text-sm text-gray-400 mb-3">Your Recent Activity</h4>
              <div className="space-y-2">
                {allActivity.length > 0 ? (
                  allActivity.map((activity, i) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
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
                        <span className="text-sm text-white font-mono">${activity.amount.toLocaleString()}</span>
                        <span className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No activity yet. Start by borrowing or depositing.
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Your Positions */}
      <GlassCard variant="vault" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Your Active Loans</h3>
          <Link
            href="/borrow"
            className="text-sm text-accent-violet hover:text-accent-violet/80 transition-colors"
          >
            Access Liquidity →
          </Link>
        </div>
        {activeLoans.length > 0 ? (
          <div className="space-y-3">
            {activeLoans.map((loan, i) => (
              <motion.div
                key={loan.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between p-4 bg-midnight-800/30 rounded-lg border border-midnight-700"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent-violet/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-accent-violet" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-medium">${loan.amount.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">
                      Collateral: ${loan.collateral?.toLocaleString() || 0}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">Active</span>
                  <div className="text-xs text-gray-500 mt-1">{formatTimeAgo(loan.timestamp)}</div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
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
              Connect your wallet and access liquidity to get started
            </p>
          </div>
        )}
      </GlassCard>

      {/* Your Deposits */}
      <GlassCard variant="vault" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Your Deposits</h3>
          <Link
            href="/lend"
            className="text-sm text-accent-gold hover:text-accent-gold/80 transition-colors"
          >
            Seed the Axis →
          </Link>
        </div>
        {deposits.length > 0 ? (
          <div className="space-y-3">
            {deposits.map((deposit, i) => (
              <motion.div
                key={deposit.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between p-4 bg-midnight-800/30 rounded-lg border border-midnight-700"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent-gold/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-accent-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-medium">${deposit.amount.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Earning ~12% APY</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs px-2 py-1 rounded bg-accent-gold/20 text-accent-gold">Earning</span>
                  <div className="text-xs text-gray-500 mt-1">{formatTimeAgo(deposit.timestamp)}</div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
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
            <p className="text-gray-500">No deposits yet</p>
            <p className="text-gray-600 text-sm mt-1">
              Seed the Axis and start earning yield
            </p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
