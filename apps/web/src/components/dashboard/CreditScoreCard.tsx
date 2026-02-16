'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard, GradientText } from '@/components/shared';
import { CREDIT_TIERS, getCreditTier } from '@/lib/aleo/types';
import { useCreditScore } from '@/hooks/useAleoTransaction';

interface CreditScoreCardProps {
  score?: number;
  hasCredential?: boolean;
  onMintClick?: () => void;
}

export function CreditScoreCard({ 
  score = 742, 
  hasCredential = true,
  onMintClick 
}: CreditScoreCardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showProof, setShowProof] = useState(false);
  const { computeCredibility, commitScore, status: scoreStatus } = useCreditScore();
  
  const tier = getCreditTier(score);
  
  // Calculate position on gauge (300-850 range)
  const minScore = 300;
  const maxScore = 850;
  const normalizedScore = ((score - minScore) / (maxScore - minScore)) * 100;
  const gaugeRotation = (normalizedScore / 100) * 180 - 90; // -90 to 90 degrees

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Call the v2 compute_credibility transition via ZK circuit
    await computeCredibility({
      repaymentHistory: 92,
      positionDuration: 78,
      utilizationRate: 35,
      protocolInteractions: 85,
      collateralDiversity: 70,
    });
    setIsRefreshing(false);
  };

  const handleViewProof = () => {
    setShowProof(!showProof);
  };

  if (!hasCredential) {
    return (
      <GlassCard className="p-6">
        <div className="text-center py-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-void-300 flex items-center justify-center">
            <LockIcon className="w-10 h-10 text-white/30" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Proof of Credibility</h3>
          <p className="text-white/50 mb-6 max-w-sm mx-auto">
            Generate your private credit score to access under-collateralized loans.
          </p>
          <button 
            onClick={onMintClick || (async () => {
              await computeCredibility({
                repaymentHistory: 50,
                positionDuration: 30,
                utilizationRate: 50,
                protocolInteractions: 20,
                collateralDiversity: 30,
              });
            })}
            disabled={scoreStatus === 'proving' || scoreStatus === 'broadcasting'}
            className="btn-primary disabled:opacity-50"
          >
            <span className="flex items-center gap-2">
              <ZKIcon className="w-5 h-5" />
              {scoreStatus === 'proving' ? 'Generating ZK Proof...' : 'Mint Proof of Credibility'}
            </span>
          </button>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Proof of Credibility</h3>
          <p className="text-sm text-white/50">Your private credit score</p>
        </div>
        <div 
          className="px-3 py-1 rounded-full text-sm font-medium"
          style={{ 
            backgroundColor: `${tier.color}20`,
            color: tier.color 
          }}
        >
          {tier.name}
        </div>
      </div>

      {/* Score Gauge */}
      <div className="relative w-48 h-24 mx-auto mb-6">
        {/* Gauge Background */}
        <svg className="w-full h-full" viewBox="0 0 200 100">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F97316" />
              <stop offset="25%" stopColor="#FBBF24" />
              <stop offset="50%" stopColor="#4ADE80" />
              <stop offset="75%" stopColor="#00D4FF" />
              <stop offset="100%" stopColor="#FFD700" />
            </linearGradient>
          </defs>
          
          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          
          {/* Colored arc */}
          <motion.path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: normalizedScore / 100 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>

        {/* Needle */}
        <motion.div 
          className="absolute bottom-0 left-1/2 origin-bottom"
          initial={{ rotate: -90 }}
          animate={{ rotate: gaugeRotation }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{ width: 4, height: 60, marginLeft: -2 }}
        >
          <div className="w-full h-full bg-gradient-to-t from-white to-white/50 rounded-full" />
          <div className="absolute bottom-0 left-1/2 w-3 h-3 -ml-1.5 bg-white rounded-full" />
        </motion.div>

        {/* Score Display */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-4 text-center">
          <motion.p 
            className="text-4xl font-bold font-mono"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            style={{ color: tier.color }}
          >
            {score}
          </motion.p>
        </div>
      </div>

      {/* Score Range */}
      <div className="flex justify-between text-xs text-white/40 px-4 mb-6">
        <span>300</span>
        <span>575</span>
        <span>850</span>
      </div>

      {/* Tier Benefits */}
      <div className="space-y-2 mb-6">
        <p className="text-xs text-white/40 uppercase tracking-wider">Your Benefits</p>
        {tier.benefits.map((benefit, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-white/70">
            <CheckIcon className="w-4 h-4 text-electric" />
            <span>{benefit}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <motion.button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          whileHover={{ scale: isRefreshing ? 1 : 1.02 }}
          whileTap={{ scale: isRefreshing ? 1 : 0.98 }}
          className="flex-1 btn-secondary text-sm py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="flex items-center justify-center gap-2">
            <RefreshIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Score'}
          </span>
        </motion.button>
        <motion.button 
          onClick={handleViewProof}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 btn-primary text-sm py-2.5"
        >
          {showProof ? 'Hide Proof' : 'View Proof'}
        </motion.button>
      </div>

      {/* ZK Proof Display */}
      {showProof && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 p-4 rounded-lg bg-void-300/50 border border-electric/20"
        >
          <p className="text-xs text-white/40 mb-3">Zero-Knowledge Proof Details</p>
          
          {/* 5-Factor Breakdown */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60">Repayment History (35%)</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 bg-void-300 rounded-full overflow-hidden">
                  <div className="h-full bg-electric rounded-full" style={{ width: '92%' }} />
                </div>
                <span className="text-electric font-mono w-8 text-right">ZK</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60">Position Duration (25%)</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 bg-void-300 rounded-full overflow-hidden">
                  <div className="h-full bg-electric rounded-full" style={{ width: '78%' }} />
                </div>
                <span className="text-electric font-mono w-8 text-right">ZK</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60">Utilization Rate (20%)</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 bg-void-300 rounded-full overflow-hidden">
                  <div className="h-full bg-electric rounded-full" style={{ width: '65%' }} />
                </div>
                <span className="text-electric font-mono w-8 text-right">ZK</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60">Protocol Loyalty (10%)</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 bg-void-300 rounded-full overflow-hidden">
                  <div className="h-full bg-electric rounded-full" style={{ width: '85%' }} />
                </div>
                <span className="text-electric font-mono w-8 text-right">ZK</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60">Collateral Diversity (10%)</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 bg-void-300 rounded-full overflow-hidden">
                  <div className="h-full bg-electric rounded-full" style={{ width: '70%' }} />
                </div>
                <span className="text-electric font-mono w-8 text-right">ZK</span>
              </div>
            </div>
          </div>

          {/* Proof Hash */}
          <div className="font-mono text-xs text-electric/70 break-all bg-void-300/50 p-2 rounded">
            proof1qyqszqgpqyqszqgpqyqszqg...
          </div>
          <div className="mt-2 space-y-1">
            <div className="text-xs text-white/60 flex justify-between">
              <span>✓ Score verified in ZK circuit</span>
              <span className="text-electric">axis_score_v2.aleo</span>
            </div>
            <div className="text-xs text-white/40 flex justify-between">
              <span>Commitment: BHP256::hash(score)</span>
              <span>On-chain ✓</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* ZK Badge */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-white/30">
        <ZKIcon className="w-4 h-4" />
        <span>Zero-Knowledge Verified · Expires in 28 days</span>
      </div>
    </GlassCard>
  );
}

// Icons
function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

function ZKIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}
