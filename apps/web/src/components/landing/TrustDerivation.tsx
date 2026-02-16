'use client';

import { motion } from 'framer-motion';
import { GlassCard, GradientText } from '@/components/shared';

const tiers = [
  {
    name: 'Axis Elite',
    tier: 1,
    scoreRange: '≥ 720',
    collateral: '50%',
    ltv: '200%',
    apr: '3.5%',
    color: '#FFD700',
    borderColor: 'border-[#FFD700]/30',
    bgGlow: 'rgba(255, 215, 0, 0.05)',
  },
  {
    name: 'Core',
    tier: 2,
    scoreRange: '620 – 719',
    collateral: '75%',
    ltv: '133%',
    apr: '5.0%',
    color: '#00D4FF',
    borderColor: 'border-[#00D4FF]/30',
    bgGlow: 'rgba(0, 212, 255, 0.05)',
  },
  {
    name: 'Entry',
    tier: 3,
    scoreRange: '< 620',
    collateral: '90%',
    ltv: '110%',
    apr: '8.0%',
    color: '#F97316',
    borderColor: 'border-[#F97316]/30',
    bgGlow: 'rgba(249, 115, 22, 0.05)',
  },
];

const steps = [
  {
    step: 1,
    label: 'Compute',
    title: 'ZK Score Generation',
    description: 'Your 5 credit factors are fed into the axis_score_v2.aleo circuit. The computation runs entirely on your device — the network never sees your inputs.',
    icon: '🧮',
  },
  {
    step: 2,
    label: 'Prove',
    title: 'AuditToken Issuance',
    description: 'You generate an AuditToken that proves "my score ≥ threshold" to the lending pool. The actual score is never revealed — only a boolean result.',
    icon: '🔐',
  },
  {
    step: 3,
    label: 'Borrow',
    title: 'Tier-Gated Lending',
    description: 'The lending contract checks your tier and assigns collateral requirements. Higher trust = lower collateral. 5% of every deposit feeds the insurance fund.',
    icon: '💰',
  },
  {
    step: 4,
    label: 'Build',
    title: 'Reputation Loop',
    description: 'Successful repayments are recorded on-chain via record_repayment, increasing your score. Defaults trigger record_default — reducing future access.',
    icon: '📈',
  },
];

export function TrustDerivation() {
  return (
    <section className="relative py-28 bg-void-200 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div
        className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255, 215, 0, 0.04) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      <div className="relative z-10 container mx-auto px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-gold font-mono text-sm tracking-widest uppercase mb-4">
            Trust → Under-Collateralized Lending
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            How Trust <GradientText>Enables Risky Lending</GradientText>
          </h2>
          <p className="text-white/50 max-w-2xl mx-auto text-lg leading-relaxed">
            Traditional DeFi requires 150%+ collateral because there&apos;s no trust.
            AXIS replaces blind collateral with <span className="text-electric">verifiable reputation</span>.
          </p>
        </motion.div>

        {/* Trust Flow — 4 Steps */}
        <div className="max-w-5xl mx-auto mb-24">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
              >
                <GlassCard className="p-5 h-full relative group">
                  {/* Step number */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{s.icon}</span>
                    <div>
                      <p className="text-electric font-mono text-xs tracking-wider uppercase">{s.label}</p>
                      <p className="text-white font-semibold text-sm">{s.title}</p>
                    </div>
                  </div>
                  <p className="text-white/40 text-xs leading-relaxed">{s.description}</p>
                  
                  {/* Connector arrow (not on last) */}
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 text-white/20 text-lg z-20">
                      →
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tier Comparison */}
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-white mb-3">Trust Tiers — On-Chain</h3>
            <p className="text-white/40 text-sm">
              Enforced by <span className="font-mono text-electric">axis_lending_v2.aleo</span> — not a frontend label, a ZK-verified contract rule
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((t, i) => (
              <motion.div
                key={t.tier}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
              >
                <div
                  className={`rounded-2xl p-6 ${t.borderColor} border relative overflow-hidden backdrop-blur-xl`}
                  style={{ background: t.bgGlow }}
                >
                  {/* Tier badge */}
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p
                        className="text-lg font-bold"
                        style={{ color: t.color }}
                      >
                        {t.name}
                      </p>
                      <p className="text-white/40 text-xs font-mono">Tier {t.tier}</p>
                    </div>
                    <div
                      className="px-3 py-1 rounded-full text-xs font-mono font-bold"
                      style={{
                        backgroundColor: `${t.color}15`,
                        color: t.color,
                      }}
                    >
                      {t.scoreRange}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white/50 text-sm">Collateral Required</span>
                      <span className="text-white font-mono font-bold">{t.collateral}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/50 text-sm">Loan-to-Value</span>
                      <span className="text-white font-mono font-bold">{t.ltv}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/50 text-sm">Interest Rate</span>
                      <span className="text-white font-mono font-bold">{t.apr} APR</span>
                    </div>
                  </div>

                  {/* Safety net */}
                  <div className="mt-5 pt-4 border-t border-white/5">
                    <p className="text-xs text-white/30 flex items-center gap-1.5">
                      <span className="text-electric">🛡</span>
                      5% insurance fund + collateral seizure on default
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* vs Traditional DeFi */}
        <motion.div
          className="max-w-3xl mx-auto mt-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="p-6 border border-electric/10">
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <p className="text-white/30 text-xs uppercase tracking-wider mb-2">Traditional DeFi</p>
                <p className="text-3xl font-bold font-mono text-white/20">150%+</p>
                <p className="text-white/30 text-sm mt-1">collateral, no credit history</p>
              </div>
              <div className="text-center border-l border-white/10">
                <p className="text-electric text-xs uppercase tracking-wider mb-2">AXIS Protocol</p>
                <p className="text-3xl font-bold font-mono text-electric">50%</p>
                <p className="text-white/50 text-sm mt-1">collateral, ZK-verified trust</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}
