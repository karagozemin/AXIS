'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/shared/GlassCard';
import { GradientText } from '@/components/shared/GradientText';
import { TransactionModal } from '@/components/shared';
import { ZKProofAnimation } from '@/components/borrow/ZKProofAnimation';
import { useLending } from '@/hooks';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { useLoanContext } from '@/contexts/LoanContext';

interface DepositReceipt {
  amount: number;
  estimatedYield: number;
  sharePercentage: number;
  lockPeriod: number;
}

export function DepositForm() {
  const [amount, setAmount] = useState<string>('');
  const [lockPeriod, setLockPeriod] = useState<number>(30);
  const [isDepositing, setIsDepositing] = useState(false);
  const [step, setStep] = useState<'input' | 'confirm' | 'proving' | 'success'>('input');
  const [showTxModal, setShowTxModal] = useState(false);

  const { connected, publicKey, select, wallets } = useWallet();
  const { status, txId, error, proofTime, deposit, reset } = useLending();
  const { addDeposit } = useLoanContext();

  const numericAmount = parseFloat(amount) || 0;

  // Calculate deposit receipt preview
  const calculateReceipt = useCallback((): DepositReceipt => {
    const baseYield = 0.12; // 12% base APY
    const lockMultiplier = 1 + (lockPeriod / 365) * 0.5; // Longer lock = higher yield
    const estimatedYield = numericAmount * baseYield * lockMultiplier * (lockPeriod / 365);
    const totalPoolSize = 2450000; // Mock total pool
    const sharePercentage = (numericAmount / (totalPoolSize + numericAmount)) * 100;

    return {
      amount: numericAmount,
      estimatedYield,
      sharePercentage,
      lockPeriod,
    };
  }, [numericAmount, lockPeriod]);

  const receipt = calculateReceipt();

  const handleDeposit = async () => {
    if (numericAmount <= 0) return;

    setStep('confirm');
  };

  const confirmDeposit = async () => {
    if (!connected || !publicKey) {
      // Select first available wallet to trigger connection
      if (wallets.length > 0) {
        select(wallets[0].adapter.name);
      }
      return;
    }

    setIsDepositing(true);
    setShowTxModal(true);

    // Execute the deposit transaction
    const result = await deposit(String(numericAmount * 1_000_000)); // Convert to microcredits

    if (result) {
      setStep('success');
      
      // Add deposit to context
      addDeposit({
        type: 'deposit',
        amount: numericAmount,
        status: 'active',
        txId: result,
      });
    }
    setIsDepositing(false);
  };

  const handleCloseTxModal = () => {
    setShowTxModal(false);
    reset();
  };

  const resetForm = () => {
    setAmount('');
    setStep('input');
  };

  const lockPeriodOptions = [
    { days: 30, label: '30 Days', bonus: '0%' },
    { days: 90, label: '90 Days', bonus: '+2.5%' },
    { days: 180, label: '180 Days', bonus: '+5%' },
    { days: 365, label: '1 Year', bonus: '+10%' },
  ];

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
        title="Deposit Transaction"
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Seed the Axis</h2>
          <p className="text-sm text-gray-400 mt-1">
            Provide liquidity to the Dark Pool. Earn yield on under-collateralized loans.
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500 uppercase tracking-wider">Current APY</div>
          <GradientText variant="gold" className="text-2xl font-bold">12.4%</GradientText>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 'input' && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Amount Input */}
            <GlassCard variant="vault" className="p-6">
              <label className="block text-sm text-gray-400 mb-3">Deposit Amount</label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-lg px-4 py-4 text-2xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-gold/50 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  style={{ 
                    backgroundColor: '#1a1a28', 
                    border: '1px solid #2a2a3a',
                    color: '#ffffff',
                    WebkitTextFillColor: '#ffffff'
                  }}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <span className="text-accent-gold font-semibold">ALEO</span>
                  <button className="text-xs text-gray-500 hover:text-accent-gold transition-colors">
                    MAX
                  </button>
                </div>
              </div>
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>Balance: 10,000 ALEO</span>
                <span>≈ ${(numericAmount * 2.45).toLocaleString()}</span>
              </div>
            </GlassCard>

            {/* Lock Period Selection */}
            <GlassCard variant="vault" className="p-6">
              <label className="block text-sm text-gray-400 mb-4">Lock Period</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {lockPeriodOptions.map((option) => (
                  <motion.button
                    key={option.days}
                    onClick={() => setLockPeriod(option.days)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-lg border transition-all ${
                      lockPeriod === option.days
                        ? 'bg-accent-gold/20 border-accent-gold text-white'
                        : 'bg-midnight-800/30 border-midnight-700 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    <div className="font-semibold">{option.label}</div>
                    <div className="text-xs mt-1 text-accent-gold">{option.bonus}</div>
                  </motion.button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Longer lock periods earn higher yields. Early withdrawal incurs a 5% penalty.
              </p>
            </GlassCard>

            {/* Receipt Preview */}
            {numericAmount > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <GlassCard variant="gold" className="p-6">
                  <h3 className="text-sm text-gray-400 mb-4 uppercase tracking-wider">
                    LP Receipt Preview
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Deposit Amount</span>
                      <span className="text-white font-semibold">
                        {numericAmount.toLocaleString()} ALEO
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Lock Period</span>
                      <span className="text-white">{lockPeriod} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Pool Share</span>
                      <span className="text-accent-violet">{receipt.sharePercentage.toFixed(4)}%</span>
                    </div>
                    <div className="border-t border-midnight-700 pt-3 flex justify-between">
                      <span className="text-gray-400">Estimated Yield</span>
                      <GradientText variant="gold" className="font-bold">
                        +{receipt.estimatedYield.toFixed(2)} ALEO
                      </GradientText>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {/* Deposit Button - Always visible */}
            <motion.button
              onClick={handleDeposit}
              disabled={numericAmount <= 0}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                numericAmount > 0
                  ? 'bg-gradient-to-r from-accent-gold to-amber-500 hover:shadow-lg hover:shadow-accent-gold/25'
                  : 'bg-midnight-700 cursor-not-allowed'
              }`}
              style={{ color: numericAmount > 0 ? '#ffffff' : '#6b7280' }}
            >
              🌱 Seed the Axis
            </motion.button>
          </motion.div>
        )}

        {step === 'confirm' && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <GlassCard variant="gold" className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent-gold/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-accent-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Confirm Deposit</h3>
              <p className="text-gray-400 mb-6">
                You are about to deposit <span className="text-accent-gold font-bold">{numericAmount.toLocaleString()} ALEO</span> for{' '}
                <span className="text-white">{lockPeriod} days</span>.
              </p>
              <div className="bg-midnight-800/50 rounded-lg p-4 mb-6 text-left">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">You will receive</span>
                  <span className="text-white">AXIS-LP Receipt NFT</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Unlock date</span>
                  <span className="text-white">
                    {new Date(Date.now() + lockPeriod * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setStep('input')}
                  className="flex-1 py-3 rounded-lg bg-gradient-to-r from-accent-gold to-amber-500 font-bold"
                  style={{ color: '#ffffff' }}
    >
                  Cancel
                </button>
                <motion.button
                  onClick={confirmDeposit}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 rounded-lg bg-gradient-to-r from-accent-gold to-amber-500 font-bold"
                  style={{ color: '#ffffff' }}
                >
                  Confirm & Sign
                </motion.button>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {step === 'proving' && (
          <motion.div
            key="proving"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <GlassCard className="p-8">
              <ZKProofAnimation
                status="proving"
                message="Creating encrypted LP receipt..."
                inline
              />
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-400">
                  Generating zero-knowledge proof for your deposit...
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Your deposit amount remains private on-chain
                </p>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <GlassCard variant="gold" className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-accent-gold to-amber-500 flex items-center justify-center"
              >
                <svg className="w-10 h-10 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-2">Axis Seeded!</h3>
              <p className="text-gray-400 mb-6">
                Your LP Receipt NFT has been minted to your wallet.
              </p>
              <div className="bg-midnight-900/50 rounded-lg p-4 mb-6 font-mono text-sm">
                <div className="text-gray-500 text-xs mb-1">Receipt ID</div>
                <div className="text-accent-gold">AXIS-LP-{Math.random().toString(36).substring(2, 10).toUpperCase()}</div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-midnight-800/30 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Deposited</div>
                  <div className="text-white font-semibold">{numericAmount.toLocaleString()} ALEO</div>
                </div>
                <div className="bg-midnight-800/30 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Est. Yield</div>
                  <div className="text-accent-gold font-semibold">+{receipt.estimatedYield.toFixed(2)} ALEO</div>
                </div>
              </div>
              <button
                onClick={resetForm}
                className="w-full py-3 rounded-lg border border-accent-gold text-accent-gold hover:bg-accent-gold/10 transition-colors font-semibold"
              >
                Make Another Deposit
              </button>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
