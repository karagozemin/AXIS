'use client';

import { motion } from 'framer-motion';
import { GlassCard, GradientText } from '@/components/shared';

const factors = [
  {
    name: 'Repayment History',
    weight: 35,
    icon: '✓',
    color: '#4ADE80',
    description: 'On-time loan repayments are the strongest signal of creditworthiness.',
    example: '95% repayment rate → high factor score',
  },
  {
    name: 'Position Duration',
    weight: 25,
    icon: '⏱',
    color: '#00D4FF',
    description: 'Long-term protocol engagement signals stability and commitment.',
    example: '12+ months active → max factor score',
  },
  {
    name: 'Utilization Rate',
    weight: 20,
    icon: '⚖',
    color: '#A78BFA',
    description: 'Lower utilization means responsible borrowing — not maxing out credit.',
    example: '30% utilization → better than 90%',
  },
  {
    name: 'Protocol Loyalty',
    weight: 10,
    icon: '🔗',
    color: '#FBBF24',
    description: 'Frequent, consistent interactions build a deeper trust profile.',
    example: '50+ interactions → full loyalty score',
  },
  {
    name: 'Collateral Diversity',
    weight: 10,
    icon: '◈',
    color: '#F97316',
    description: 'Using multiple collateral types reduces single-asset risk.',
    example: '3+ asset types → diversification bonus',
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function HowScoreWorks() {
  return (
    <section className="relative py-28 bg-void overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(0, 212, 255, 0.06) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      <div className="relative z-10 container mx-auto px-6">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-electric font-mono text-sm tracking-widest uppercase mb-4">
            How the Score is Determined
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            5-Factor <GradientText>ZK Credit Model</GradientText>
          </h2>
          <p className="text-white/50 max-w-2xl mx-auto text-lg leading-relaxed">
            Your credit score is computed entirely inside a zero-knowledge circuit. 
            No data ever leaves your device — only a cryptographic proof is published.
          </p>
        </motion.div>

        {/* Formula bar */}
        <motion.div
          className="max-w-4xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <GlassCard className="p-6">
            <p className="text-xs text-white/40 font-mono mb-3 uppercase tracking-wider">On-chain Formula — axis_score_v2.aleo</p>
            <div className="font-mono text-sm md:text-base text-white/80 leading-relaxed">
              <span className="text-electric">weighted_sum</span> = 
              <span className="text-[#4ADE80]"> RH×35</span> + 
              <span className="text-[#00D4FF]"> PD×25</span> + 
              <span className="text-[#A78BFA]"> (100−UR)×20</span> + 
              <span className="text-[#FBBF24]"> PL×10</span> + 
              <span className="text-[#F97316]"> CD×10</span>
            </div>
            <div className="font-mono text-sm md:text-base text-white/80 mt-2">
              <span className="text-gold">score</span> = 300 + (weighted_sum × 550 / 10,000)
              <span className="text-white/30 ml-4">// Range: 300 — 850</span>
            </div>
          </GlassCard>
        </motion.div>

        {/* Factor cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-5 gap-4 max-w-6xl mx-auto"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {factors.map((f) => (
            <motion.div key={f.name} variants={item}>
              <GlassCard className="p-5 h-full flex flex-col group hover:border-white/20 transition-colors">
                {/* Weight badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl">{f.icon}</span>
                  <span
                    className="text-2xl font-bold font-mono"
                    style={{ color: f.color }}
                  >
                    {f.weight}%
                  </span>
                </div>

                {/* Weight bar */}
                <div className="w-full h-1.5 bg-void-300 rounded-full mb-4 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: f.color }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${f.weight * 2.85}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  />
                </div>

                <h3 className="text-white font-semibold text-sm mb-2">{f.name}</h3>
                <p className="text-white/40 text-xs leading-relaxed flex-1">{f.description}</p>
                
                {/* Example */}
                <div className="mt-3 pt-3 border-t border-white/5">
                  <p className="text-xs font-mono text-white/30">{f.example}</p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Privacy note */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-electric/5 border border-electric/20">
            <span className="text-electric text-sm">🔒</span>
            <span className="text-white/60 text-sm">
              All 5 inputs remain <span className="text-electric font-medium">ZK-HIDDEN</span> — only the commitment hash is published on-chain
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
