'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/shared';
import { WalletButton } from './WalletButton';
import { useLoanContext } from '@/contexts/LoanContext';
import { useState } from 'react';

interface TopBarProps {
  title?: string;
  subtitle?: string;
}

export function TopBar({ title = 'Dashboard', subtitle }: TopBarProps) {
  const { activeLoans, deposits } = useLoanContext();
  const [showNotifications, setShowNotifications] = useState(false);
  
  const totalActivities = activeLoans.length + deposits.length;

  return (
    <header className="sticky top-0 z-30 bg-void/80 backdrop-blur-xl border-b border-glass-border">
      <div className="flex items-center justify-between px-8 py-4">
        {/* Page Title */}
        <div>
          <motion.h1 
            className="text-2xl font-bold text-white"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p 
              className="text-sm text-white/50 mt-0.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {subtitle}
            </motion.p>
          )}
        </div>

        {/* Right side - Stats & Actions */}
        <div className="flex items-center gap-4">
          {/* Gas Price */}
          <GlassCard className="px-4 py-2 flex items-center gap-2">
            <GasIcon className="w-4 h-4 text-electric" />
            <span className="text-sm font-mono text-white/80">0.25 credits</span>
          </GlassCard>

          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl hover:bg-white/5 transition-colors"
            >
              <BellIcon className="w-5 h-5 text-white/60" />
              {totalActivities > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-electric rounded-full animate-pulse" />
              )}
            </button>

            {/* Notification Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-80"
                >
                  <GlassCard className="p-4 max-h-96 overflow-y-auto">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-white">Activity</h3>
                      <span className="text-xs text-white/40">{totalActivities} active</span>
                    </div>

                    {totalActivities === 0 ? (
                      <p className="text-sm text-white/40 text-center py-8">No recent activity</p>
                    ) : (
                      <div className="space-y-2">
                        {/* Active Loans */}
                        {activeLoans.map((loan, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-accent-gold">🏦 Active Loan</span>
                              <span className="text-xs text-white/40">
                                {new Date(loan.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="text-sm text-white font-semibold">
                              {loan.amount.toLocaleString()} ALEO
                            </div>
                            {loan.collateral && (
                              <div className="text-xs text-white/60 mt-1">
                                Collateral: {loan.collateral.toLocaleString()} ALEO
                              </div>
                            )}
                          </div>
                        ))}

                        {/* Deposits */}
                        {deposits.map((deposit, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-electric">💎 Deposit</span>
                              <span className="text-xs text-white/40">
                                {new Date(deposit.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="text-sm text-white font-semibold">
                              {deposit.amount.toLocaleString()} ALEO
                            </div>
                            {deposit.lockPeriod && (
                              <div className="text-xs text-white/60 mt-1">
                                Lock: {deposit.lockPeriod} days
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Connected Wallet */}
          <WalletButton />
        </div>
      </div>
    </header>
  );
}

// Icons
function GasIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}
