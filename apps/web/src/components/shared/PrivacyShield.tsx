'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/shared/GlassCard';

interface PrivacyItem {
  label: string;
  value: string;
  isPrivate: boolean;
  explanation: string;
}

interface PrivacyShieldProps {
  title?: string;
  items: PrivacyItem[];
  className?: string;
}

export function PrivacyShield({ title = 'Privacy Status', items, className = '' }: PrivacyShieldProps) {
  const [expanded, setExpanded] = useState(false);
  const privateCount = items.filter(i => i.isPrivate).length;
  const publicCount = items.length - privateCount;

  return (
    <GlassCard className={`p-5 ${className}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-electric/10 flex items-center justify-center">
            <ShieldIcon className="w-5 h-5 text-electric" />
          </div>
          <div className="text-left">
            <h4 className="text-sm font-semibold text-white">{title}</h4>
            <p className="text-xs text-white/40">
              {privateCount} private · {publicCount} public on-chain
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronIcon className="w-5 h-5 text-white/40" />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-2">
              {items.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    item.isPrivate
                      ? 'bg-electric/5 border border-electric/20'
                      : 'bg-amber-500/5 border border-amber-500/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {item.isPrivate ? (
                      <LockClosedIcon className="w-4 h-4 text-electric" />
                    ) : (
                      <GlobeIcon className="w-4 h-4 text-amber-400" />
                    )}
                    <div>
                      <p className="text-sm text-white/80">{item.label}</p>
                      <p className="text-xs text-white/30">{item.explanation}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {item.isPrivate ? (
                      <span className="text-xs font-mono text-electric bg-electric/10 px-2 py-1 rounded">
                        ZK-HIDDEN
                      </span>
                    ) : (
                      <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-1 rounded">
                        {item.value}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* ZK Explanation */}
            <div className="mt-4 p-3 rounded-lg bg-void-300/30 border border-white/5">
              <p className="text-xs text-white/40 leading-relaxed">
                <span className="text-electric font-semibold">🔐 How it works:</span>{' '}
                Your data is processed inside a Zero-Knowledge circuit on Aleo. 
                The proof verifies correctness without revealing inputs. 
                Only aggregate protocol metrics are published on-chain.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

// Pre-configured privacy shields for common views

export function BorrowPrivacyShield() {
  return (
    <PrivacyShield
      title="Loan Privacy Status"
      items={[
        { label: 'Loan Amount', value: '—', isPrivate: true, explanation: 'Encrypted in LoanTicket record' },
        { label: 'Collateral Posted', value: '—', isPrivate: true, explanation: 'Only you know your collateral' },
        { label: 'Interest Rate', value: '—', isPrivate: true, explanation: 'Tier-derived, kept private' },
        { label: 'Credit Tier', value: '—', isPrivate: true, explanation: 'Never leaves the ZK circuit' },
        { label: 'Due Date', value: '—', isPrivate: true, explanation: 'Stored in private record' },
        { label: 'Total Borrowed (pool)', value: 'Aggregate', isPrivate: false, explanation: 'Sum of all loans, no individual data' },
        { label: 'Loan Active Status', value: 'Boolean', isPrivate: false, explanation: 'loan_id → true/false only' },
      ]}
    />
  );
}

export function DepositPrivacyShield() {
  return (
    <PrivacyShield
      title="Deposit Privacy Status"
      items={[
        { label: 'Deposit Amount', value: '—', isPrivate: true, explanation: 'Encrypted in LiquidityReceipt' },
        { label: 'Pool Share', value: '—', isPrivate: true, explanation: 'Private BPS calculation' },
        { label: 'Lock Period', value: '—', isPrivate: true, explanation: 'Only you know your unlock date' },
        { label: 'Insurance Cut (5%)', value: '—', isPrivate: true, explanation: 'Auto-routed, amount hidden' },
        { label: 'Total TVL', value: 'Aggregate', isPrivate: false, explanation: 'Sum of all deposits, no individual data' },
        { label: 'Insurance Fund Balance', value: 'Aggregate', isPrivate: false, explanation: 'Protocol-level risk buffer' },
      ]}
    />
  );
}

export function ScorePrivacyShield() {
  return (
    <PrivacyShield
      title="Credit Score Privacy"
      items={[
        { label: 'Credit Score (300-850)', value: '—', isPrivate: true, explanation: 'Computed in ZK circuit' },
        { label: 'Repayment History (35%)', value: '—', isPrivate: true, explanation: 'Input never revealed' },
        { label: 'Position Duration (25%)', value: '—', isPrivate: true, explanation: 'Input never revealed' },
        { label: 'Utilization Rate (20%)', value: '—', isPrivate: true, explanation: 'Input never revealed' },
        { label: 'Protocol Loyalty (10%)', value: '—', isPrivate: true, explanation: 'Input never revealed' },
        { label: 'Collateral Diversity (10%)', value: '—', isPrivate: true, explanation: 'Input never revealed' },
        { label: 'Score Commitment', value: 'hash(score)', isPrivate: false, explanation: 'Proves freshness, hides value' },
        { label: 'Bond Count', value: 'Counter', isPrivate: false, explanation: 'How many times score was computed' },
        { label: 'Default Count', value: 'Counter', isPrivate: false, explanation: 'Feeds back into future scores' },
      ]}
    />
  );
}

// Icons
function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
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

function LockClosedIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  );
}
