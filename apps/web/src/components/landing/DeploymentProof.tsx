'use client';

import { motion } from 'framer-motion';
import { GlassCard, GradientText } from '@/components/shared';

const programs = [
  {
    name: 'axis_score_v2.aleo',
    description: 'Privacy-preserving 5-factor credit scoring engine',
    transitions: [
      'compute_credibility',
      'verify_threshold',
      'create_audit_token',
      'record_default',
      'record_repayment',
      'commit_score',
    ],
    records: ['CreditBond', 'AuditToken'],
    mappings: ['score_commitments', 'bond_count', 'protocol_stats', 'default_count', 'repayment_count'],
    color: '#00D4FF',
  },
  {
    name: 'axis_lending_v2.aleo',
    description: 'Tier-based under-collateralized lending with insurance fund',
    transitions: [
      'seed_the_axis',
      'access_liquidity',
      'repay_loan',
      'flag_default',
      'withdraw_liquidity',
    ],
    records: ['LoanTicket', 'LiquidityReceipt'],
    mappings: ['total_liquidity', 'total_borrowed', 'total_collateral', 'insurance_fund', 'active_loans', 'tier_borrowed'],
    color: '#FFD700',
  },
];

const privacyMatrix = [
  { data: 'Credit Score (300-850)', status: 'private', reason: 'Stored in CreditBond record — only owner can decrypt' },
  { data: '5 Factor Inputs', status: 'private', reason: 'Never leave the ZK circuit — computed client-side' },
  { data: 'Loan Amount & Terms', status: 'private', reason: 'Encrypted in LoanTicket record' },
  { data: 'Deposit Position', status: 'private', reason: 'Encrypted in LiquidityReceipt record' },
  { data: 'Score Commitment Hash', status: 'public', reason: 'BHP256 hash of score — proves freshness without revealing value' },
  { data: 'Total Value Locked', status: 'public', reason: 'Aggregate pool metric — no individual data exposed' },
  { data: 'Insurance Fund Balance', status: 'public', reason: 'Transparency for depositor confidence' },
  { data: 'Default / Repayment Count', status: 'public', reason: 'Aggregate stats — tied to address, not identity' },
];

export function DeploymentProof() {
  return (
    <section className="relative py-28 bg-void overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20" />

      <div className="relative z-10 container mx-auto px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-electric font-mono text-sm tracking-widest uppercase mb-4">
            Deployed to Aleo Testnet
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Not a Demo — <GradientText>Real ZK Programs</GradientText>
          </h2>
          <p className="text-white/50 max-w-2xl mx-auto text-lg leading-relaxed">
            Both programs are live on Aleo testnet. Every transition executes real zero-knowledge proofs. 
            Verify them on the explorer yourself.
          </p>
        </motion.div>

        {/* Program cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
          {programs.map((prog, i) => (
            <motion.div
              key={prog.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              <GlassCard className="p-6 h-full">
                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-3 h-3 rounded-full animate-pulse"
                    style={{ backgroundColor: prog.color }}
                  />
                  <h3
                    className="font-mono font-bold text-lg"
                    style={{ color: prog.color }}
                  >
                    {prog.name}
                  </h3>
                </div>
                <p className="text-white/50 text-sm mb-5">{prog.description}</p>

                {/* Transitions */}
                <div className="mb-4">
                  <p className="text-xs text-white/30 uppercase tracking-wider mb-2">Transitions</p>
                  <div className="flex flex-wrap gap-1.5">
                    {prog.transitions.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-1 rounded text-xs font-mono bg-void-300/80 text-white/60 border border-white/5"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Records */}
                <div className="mb-4">
                  <p className="text-xs text-white/30 uppercase tracking-wider mb-2">Private Records</p>
                  <div className="flex gap-2">
                    {prog.records.map((r) => (
                      <span
                        key={r}
                        className="px-2 py-1 rounded text-xs font-mono border"
                        style={{
                          borderColor: `${prog.color}30`,
                          color: prog.color,
                          backgroundColor: `${prog.color}08`,
                        }}
                      >
                        🔒 {r}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Mappings */}
                <div>
                  <p className="text-xs text-white/30 uppercase tracking-wider mb-2">Public Mappings</p>
                  <div className="flex flex-wrap gap-1.5">
                    {prog.mappings.map((m) => (
                      <span
                        key={m}
                        className="px-2 py-1 rounded text-xs font-mono bg-void-300/50 text-white/40"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Explorer link */}
                <div className="mt-5 pt-4 border-t border-white/5">
                  <a
                    href={`https://explorer.aleo.org/program/${prog.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono flex items-center gap-2 hover:underline transition-colors"
                    style={{ color: prog.color }}
                  >
                    View on Aleo Explorer →
                  </a>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Privacy Matrix */}
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-white mb-3">Privacy Architecture</h3>
            <p className="text-white/40 text-sm">
              What stays private vs what&apos;s visible on-chain — by design, not by accident
            </p>
          </div>

          <GlassCard className="overflow-hidden">
            <div className="divide-y divide-white/5">
              {/* Table header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-void-300/30">
                <div className="col-span-3 text-xs text-white/40 uppercase tracking-wider font-medium">Data</div>
                <div className="col-span-2 text-xs text-white/40 uppercase tracking-wider font-medium text-center">Visibility</div>
                <div className="col-span-7 text-xs text-white/40 uppercase tracking-wider font-medium">Why</div>
              </div>

              {privacyMatrix.map((row, i) => (
                <motion.div
                  key={row.data}
                  className="grid grid-cols-12 gap-4 px-6 py-3 hover:bg-white/[0.02] transition-colors"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="col-span-3 text-sm text-white/70 font-medium">{row.data}</div>
                  <div className="col-span-2 text-center">
                    {row.status === 'private' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono bg-electric/10 text-electric border border-electric/20">
                        🔒 ZK
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono bg-white/5 text-white/40 border border-white/10">
                        📡 Public
                      </span>
                    )}
                  </div>
                  <div className="col-span-7 text-xs text-white/40 leading-relaxed">{row.reason}</div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Whitepaper CTA */}
        <motion.div
          className="text-center mt-14"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <a
            href="https://github.com/karagozemin/AXIS/blob/main/docs/CREDIT_SCORING.md"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-electric/10 border border-electric/20 text-electric text-sm font-medium hover:bg-electric/15 transition-colors"
          >
            <span>📄</span>
            <span>Read the Full Credit Scoring Whitepaper</span>
            <span>→</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
