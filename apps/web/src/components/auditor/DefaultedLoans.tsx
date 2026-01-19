'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard, GradientText } from '@/components/shared';

interface DefaultedLoan {
  id: string;
  loanId: string;
  borrowerHash: string;
  principal: number;
  collateral: number;
  defaultDate: string;
  daysOverdue: number;
  hasAuditToken: boolean;
  revealed?: {
    borrower: string;
    creditScore: number;
    originalDueDate: string;
  };
}

const mockDefaultedLoans: DefaultedLoan[] = [
  {
    id: '1',
    loanId: 'at1qx7...m3k9',
    borrowerHash: '0x7f3a...9c2d',
    principal: 15000,
    collateral: 10500,
    defaultDate: '2026-01-15',
    daysOverdue: 4,
    hasAuditToken: true,
    revealed: {
      borrower: 'aleo1usr...4k7m',
      creditScore: 623,
      originalDueDate: '2026-01-11',
    },
  },
  {
    id: '2',
    loanId: 'at1zk4...p2w8',
    borrowerHash: '0x9d2f...1a3e',
    principal: 8500,
    collateral: 5950,
    defaultDate: '2026-01-12',
    daysOverdue: 7,
    hasAuditToken: true,
  },
  {
    id: '3',
    loanId: 'at1mn8...y5v2',
    borrowerHash: '0x4c8b...7e1f',
    principal: 25000,
    collateral: 17500,
    defaultDate: '2026-01-10',
    daysOverdue: 9,
    hasAuditToken: false,
  },
  {
    id: '4',
    loanId: 'at1hd2...k9x3',
    borrowerHash: '0x2a5e...8d4c',
    principal: 5000,
    collateral: 3500,
    defaultDate: '2026-01-08',
    daysOverdue: 11,
    hasAuditToken: true,
  },
];

export function DefaultedLoans() {
  const [selectedLoan, setSelectedLoan] = useState<string | null>(null);
  const [revealingLoan, setRevealingLoan] = useState<string | null>(null);

  const handleReveal = async (loanId: string) => {
    setRevealingLoan(loanId);
    // Simulate ZK verification
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRevealingLoan(null);
    setSelectedLoan(loanId);
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Defaulted Loans</h3>
          <p className="text-sm text-white/50">
            Loans flagged for compliance review
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40">Sort by:</span>
          <select className="bg-void-300 text-white text-sm rounded-lg px-3 py-1.5 border border-glass-border focus:outline-none focus:border-electric/50">
            <option>Days Overdue</option>
            <option>Principal Amount</option>
            <option>Default Date</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {mockDefaultedLoans.map((loan, index) => (
          <motion.div
            key={loan.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div 
              className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                selectedLoan === loan.id 
                  ? 'bg-red-500/10 border-red-500/30' 
                  : 'bg-void-200/50 border-glass-border hover:border-white/20'
              }`}
              onClick={() => setSelectedLoan(selectedLoan === loan.id ? null : loan.id)}
            >
              {/* Main Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Status Indicator */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    loan.daysOverdue > 7 
                      ? 'bg-red-500/20 text-red-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    <AlertIcon className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-white text-sm">{loan.loanId}</span>
                      {loan.hasAuditToken && (
                        <span className="px-2 py-0.5 rounded text-xs bg-gold/10 text-gold border border-gold/20">
                          Audit Token
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/40 mt-0.5">
                      Borrower: {loan.borrowerHash}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">
                      {loan.principal.toLocaleString()} ALEO
                    </p>
                    <p className="text-xs text-white/40">
                      Collateral: {loan.collateral.toLocaleString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      loan.daysOverdue > 7 ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {loan.daysOverdue} days overdue
                    </p>
                    <p className="text-xs text-white/40">{loan.defaultDate}</p>
                  </div>

                  <ChevronIcon 
                    className={`w-5 h-5 text-white/40 transition-transform ${
                      selectedLoan === loan.id ? 'rotate-180' : ''
                    }`} 
                  />
                </div>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {selectedLoan === loan.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 pt-4 border-t border-glass-border">
                      {loan.revealed ? (
                        // Revealed Data
                        <div className="grid grid-cols-3 gap-4">
                          <div className="p-3 rounded-lg bg-void-300/50">
                            <p className="text-xs text-white/40 mb-1">Borrower Address</p>
                            <p className="font-mono text-sm text-electric">
                              {loan.revealed.borrower}
                            </p>
                          </div>
                          <div className="p-3 rounded-lg bg-void-300/50">
                            <p className="text-xs text-white/40 mb-1">Credit Score at Borrow</p>
                            <p className="font-mono text-sm text-yellow-400">
                              {loan.revealed.creditScore}
                            </p>
                          </div>
                          <div className="p-3 rounded-lg bg-void-300/50">
                            <p className="text-xs text-white/40 mb-1">Original Due Date</p>
                            <p className="font-mono text-sm text-white">
                              {loan.revealed.originalDueDate}
                            </p>
                          </div>
                        </div>
                      ) : loan.hasAuditToken ? (
                        // Can Reveal
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gold/5 border border-gold/20">
                          <div className="flex items-center gap-3">
                            <KeyIcon className="w-5 h-5 text-gold" />
                            <div>
                              <p className="text-sm text-white">
                                AuditToken available for this loan
                              </p>
                              <p className="text-xs text-white/40">
                                Verify your auditor credentials to reveal borrower data
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReveal(loan.id);
                            }}
                            disabled={revealingLoan === loan.id}
                            className="px-4 py-2 rounded-lg bg-gold text-void font-medium text-sm hover:bg-gold-400 transition-colors disabled:opacity-50 flex items-center gap-2"
                          >
                            {revealingLoan === loan.id ? (
                              <>
                                <LoadingSpinner />
                                Verifying...
                              </>
                            ) : (
                              <>
                                <EyeIcon className="w-4 h-4" />
                                Reveal Data
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        // No Audit Token
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                          <LockIcon className="w-5 h-5 text-red-400" />
                          <div>
                            <p className="text-sm text-white">
                              No AuditToken issued for this loan
                            </p>
                            <p className="text-xs text-white/40">
                              Borrower did not opt into institutional compliance. Data remains private.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-glass-border flex items-center justify-between">
        <p className="text-sm text-white/40">
          Showing {mockDefaultedLoans.length} defaulted loans • 
          {mockDefaultedLoans.filter(l => l.hasAuditToken).length} with audit tokens
        </p>
        <button className="text-sm text-electric hover:text-electric-400 transition-colors">
          Export Report →
        </button>
      </div>
    </GlassCard>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

function KeyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
