'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard, GradientText, TransactionModal } from '@/components/shared';
import { getCreditTier } from '@/lib/aleo/types';
import { formatCurrency } from '@/lib/utils';
import { ZKProofAnimation } from './ZKProofAnimation';
import { useLending } from '@/hooks';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { useLoanContext } from '@/contexts/LoanContext';

interface BorrowFormProps {
  creditScore?: number;
  maxBorrow?: number;
  onSubmit?: (data: BorrowFormData) => void;
}

interface BorrowFormData {
  borrowAmount: number;
  collateralAmount: number;
  duration: '7d' | '30d' | '90d';
}

const DURATIONS = [
  { value: '7d', label: '7 Days', seconds: 604800 },
  { value: '30d', label: '30 Days', seconds: 2592000 },
  { value: '90d', label: '90 Days', seconds: 7776000 },
] as const;

export function BorrowForm({ 
  creditScore = 742, 
  maxBorrow = 50000,
  onSubmit 
}: BorrowFormProps) {
  const [borrowAmount, setBorrowAmount] = useState<number>(10000);
  const [duration, setDuration] = useState<'7d' | '30d' | '90d'>('30d');
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [proofComplete, setProofComplete] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);

  const { connected, publicKey, select, wallets } = useWallet();
  const { status, txId, error, proofTime, borrow, reset } = useLending();
  const { addLoan } = useLoanContext();

  const tier = getCreditTier(creditScore);

  // ── v2 Tier-based collateral & interest rates ──
  // Matches axis_lending_v2.aleo access_liquidity logic:
  //   Tier 1 (Axis Elite, score >= 720): 50% collateral, 3.5% APR
  //   Tier 2 (Core, 620-719):            75% collateral, 5.0% APR
  //   Tier 3 (Entry, < 620):             90% collateral, 8.0% APR
  const lendingTier = creditScore >= 720 ? 1 : creditScore >= 620 ? 2 : 3;
  const collateralRatio = lendingTier === 1 ? 50 : lendingTier === 2 ? 75 : 90;
  const requiredCollateral = (borrowAmount * collateralRatio) / 100;
  const interestRate = lendingTier === 1 ? 3.5 : lendingTier === 2 ? 5.0 : 8.0;
  const ltvRatio = lendingTier === 1 ? '200%' : lendingTier === 2 ? '133%' : '111%';
  const tierLabel = lendingTier === 1 ? 'Axis Elite' : lendingTier === 2 ? 'Core' : 'Entry';
  
  // Calculate interest for duration
  const durationDays = duration === '7d' ? 7 : duration === '30d' ? 30 : 90;
  const interestAmount = (borrowAmount * (interestRate / 100) * durationDays) / 365;
  const totalRepayment = borrowAmount + interestAmount;

  const handleSubmit = async () => {
    if (!connected || !publicKey) {
      // Select first available wallet to trigger connection
      if (wallets.length > 0) {
        select(wallets[0].adapter.name);
      }
      return;
    }

    setShowTxModal(true);
    
    // Execute the borrow transaction (v2: includes tier for collateral validation)
    const result = await borrow(
      String(borrowAmount * 1_000_000), // Convert to microcredits
      String(requiredCollateral * 1_000_000),
      lendingTier as 1 | 2 | 3
    );
    
    if (result) {
      setProofComplete(true);
      
      // Add loan to context
      addLoan({
        type: 'borrow',
        amount: borrowAmount,
        collateral: requiredCollateral,
        status: 'active',
        txId: result,
        tier: tier.name,
      });
      
      onSubmit?.({
        borrowAmount,
        collateralAmount: requiredCollateral,
        duration,
      });
    }
  };

  const handleCloseTxModal = () => {
    setShowTxModal(false);
    reset();
  };

  return (
    <div className="space-y-6">
      {/* Transaction Modal */}
      <TransactionModal
        isOpen={showTxModal}
        status={status}
        txId={txId}
        error={error}
        proofTime={proofTime}
        onClose={handleCloseTxModal}
        title="Borrow Transaction"
      />

      {/* ZK Proof Animation Overlay */}
      <AnimatePresence>
        {isGeneratingProof && (
          <ZKProofAnimation 
            onComplete={() => {
              setIsGeneratingProof(false);
              setProofComplete(true);
            }}
          />
        )}
      </AnimatePresence>

      {/* Wallet Connection Required */}
      {!connected && (
        <GlassCard variant="gold" className="p-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-gold/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-accent-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Wallet Required</h3>
            <p className="text-sm text-gray-400 mb-4">
              Please connect your Leo Wallet to access liquidity
            </p>
            <button
              onClick={() => select(wallets[0]?.adapter.name)}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-accent-gold to-amber-500 text-white font-semibold hover:shadow-lg hover:shadow-accent-gold/25 transition-all"
            >
              Connect Wallet
            </button>
          </div>
        </GlassCard>
      )}

      {/* Borrow Amount Input */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Access Liquidity</h3>
          <div className="text-sm text-white/50">
            Max: <span className="text-electric font-mono">${formatCurrency(maxBorrow, 0)}</span>
          </div>
        </div>

        {/* Amount Slider */}
        <div className="space-y-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold font-mono text-white">$</span>
            <input
              type="number"
              value={borrowAmount}
              onChange={(e) => setBorrowAmount(Math.min(Number(e.target.value), maxBorrow))}
              disabled={!connected}
              className="text-4xl font-bold font-mono text-white bg-transparent border-none outline-none w-40 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          
          <input
            type="range"
            min={1000}
            max={maxBorrow}
            step={1000}
            value={borrowAmount}
            onChange={(e) => setBorrowAmount(Number(e.target.value))}
            disabled={!connected}
            className="w-full h-2 bg-void-300 rounded-full appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-5
              [&::-webkit-slider-thumb]:h-5
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-electric
              [&::-webkit-slider-thumb]:shadow-glow-electric
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:transition-transform
              [&::-webkit-slider-thumb]:hover:scale-125"
          />
          
          {/* Quick Amount Buttons */}
          <div className="flex gap-2">
            {[5000, 10000, 25000, 50000].map((amount) => (
              <button
                key={amount}
                onClick={() => setBorrowAmount(Math.min(amount, maxBorrow))}
                disabled={!connected}
                className={`px-3 py-1.5 rounded-lg text-sm font-mono transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  borrowAmount === amount 
                    ? 'bg-electric/20 text-electric border border-electric/50' 
                    : 'bg-void-300 text-white/60 hover:bg-void-200 hover:text-white'
                }`}
              >
                ${formatCurrency(amount, 0)}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Duration Selection */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Loan Duration</h3>
        <div className="grid grid-cols-3 gap-3">
          {DURATIONS.map((d) => (
            <button
              key={d.value}
              onClick={() => setDuration(d.value)}
              className={`p-4 rounded-xl text-center transition-all ${
                duration === d.value
                  ? 'bg-electric/10 border-2 border-electric'
                  : 'bg-void-300 border-2 border-transparent hover:border-white/20'
              }`}
            >
              <p className={`text-xl font-bold ${duration === d.value ? 'text-electric' : 'text-white'}`}>
                {d.label.split(' ')[0]}
              </p>
              <p className="text-sm text-white/50">{d.label.split(' ')[1]}</p>
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Loan Terms Preview */}
      <GlassCard variant="vault" className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Loan Terms</h3>
        
        <div className="space-y-4">
          {/* Collateral Required */}
          <div className="flex items-center justify-between py-3 border-b border-glass-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                <CollateralIcon className="w-5 h-5 text-gold" />
              </div>
              <div>
                <p className="text-sm text-white/60">Required Collateral</p>
                <p className="text-xs text-white/40">{collateralRatio}% ratio · {tierLabel} · {ltvRatio} LTV</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold font-mono text-gold">
                ${formatCurrency(requiredCollateral)}
              </p>
            </div>
          </div>

          {/* Interest Rate */}
          <div className="flex items-center justify-between py-3 border-b border-glass-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-electric/10 flex items-center justify-center">
                <PercentIcon className="w-5 h-5 text-electric" />
              </div>
              <div>
                <p className="text-sm text-white/60">Interest Rate</p>
                <p className="text-xs text-white/40">Annual percentage rate</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold font-mono text-electric">
                {interestRate.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Interest Amount */}
          <div className="flex items-center justify-between py-3 border-b border-glass-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                <InterestIcon className="w-5 h-5 text-white/60" />
              </div>
              <div>
                <p className="text-sm text-white/60">Interest ({durationDays} days)</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold font-mono text-white/80">
                ${formatCurrency(interestAmount)}
              </p>
            </div>
          </div>

          {/* Total Repayment */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-electric/20 to-gold/20 flex items-center justify-center">
                <TotalIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-white">Total Repayment</p>
                <p className="text-xs text-white/40">Due in {durationDays} days</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold font-mono">
                <GradientText>${formatCurrency(totalRepayment)}</GradientText>
              </p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Submit Button */}
      <motion.button
        onClick={handleSubmit}
        disabled={!connected || (status !== 'idle' && status !== 'success' && status !== 'error')}
        className="w-full btn-primary py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: connected ? 1.02 : 1 }}
        whileTap={{ scale: connected ? 0.98 : 1 }}
      >
        {!connected ? (
          <span className="flex items-center justify-center gap-2">
            <WalletIcon className="w-5 h-5" />
            🔒 Connect Wallet to Borrow
          </span>
        ) : status !== 'idle' && status !== 'success' && status !== 'error' ? (
          <span className="flex items-center justify-center gap-3">
            <motion.div
              className="w-5 h-5 border-2 border-void border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            Processing...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <ZKIcon className="w-5 h-5" />
            Access Liquidity
          </span>
        )}
      </motion.button>

      {/* Privacy Notice */}
      <p className="text-center text-xs text-white/30">
        🔐 Your loan details are private. Only you hold the LoanTicket record.
      </p>
    </div>
  );
}

// Icons
function WalletIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
    </svg>
  );
}

function CollateralIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function PercentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75l10.5 10.5M6.75 6.75h4.5m-4.5 0v4.5m10.5 0v4.5m0-4.5h-4.5m4.5 0l-10.5-10.5" />
    </svg>
  );
}

function InterestIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function TotalIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
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
