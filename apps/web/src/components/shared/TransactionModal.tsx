'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { TransactionStatus } from '@/hooks';
import { GlassCard, GradientText } from '@/components/shared';

interface TransactionModalProps {
  isOpen: boolean;
  status: TransactionStatus;
  txId: string | null;
  error: string | null;
  proofTime: number | null;
  onClose: () => void;
  title?: string;
}

const statusConfig: Record<TransactionStatus, { label: string; color: string; icon: React.ReactNode }> = {
  idle: { label: 'Ready', color: 'text-white/50', icon: null },
  preparing: { label: 'Preparing Transaction...', color: 'text-electric', icon: <SpinnerIcon /> },
  proving: { label: 'Generating ZK Proof...', color: 'text-gold', icon: <ShieldIcon /> },
  broadcasting: { label: 'Broadcasting to Network...', color: 'text-electric', icon: <BroadcastIcon /> },
  confirming: { label: 'Waiting for Confirmation...', color: 'text-electric', icon: <SpinnerIcon /> },
  success: { label: 'Transaction Complete!', color: 'text-green-400', icon: <CheckIcon /> },
  error: { label: 'Transaction Failed', color: 'text-red-400', icon: <ErrorIcon /> },
};

export function TransactionModal({ 
  isOpen, 
  status, 
  txId, 
  error, 
  proofTime,
  onClose,
  title = 'Transaction'
}: TransactionModalProps) {
  const config = statusConfig[status];
  const isComplete = status === 'success' || status === 'error';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-void/80 backdrop-blur-sm z-50"
            onClick={isComplete ? onClose : undefined}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <GlassCard className="w-full max-w-md p-6">
              {/* Header */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
                <p className="text-sm text-white/50">Zero-Knowledge Transaction</p>
              </div>

              {/* Status Steps */}
              <div className="space-y-3 mb-6">
                <StatusStep 
                  label="Prepare Inputs" 
                  status={getStepStatus('preparing', status)} 
                />
                <StatusStep 
                  label="Generate ZK Proof" 
                  status={getStepStatus('proving', status)}
                  extra={proofTime && status !== 'preparing' ? `${(proofTime / 1000).toFixed(1)}s` : undefined}
                />
                <StatusStep 
                  label="Broadcast Transaction" 
                  status={getStepStatus('broadcasting', status)} 
                />
                <StatusStep 
                  label="Confirm on Aleo" 
                  status={getStepStatus('confirming', status)} 
                />
              </div>

              {/* Current Status */}
              <div className="text-center py-4 border-t border-glass-border">
                <motion.div
                  key={status}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-3"
                >
                  <span className={config.color}>{config.icon}</span>
                  <span className={`text-lg font-medium ${config.color}`}>{config.label}</span>
                </motion.div>

                {/* Transaction ID */}
                {txId && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4"
                  >
                    <p className="text-xs text-white/40 mb-1">Transaction ID</p>
                    <a 
                      href={`https://testnet.explorer.provable.com/transaction/${txId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-mono text-electric hover:underline"
                    >
                      {txId.slice(0, 16)}...{txId.slice(-8)}
                    </a>
                  </motion.div>
                )}

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                  >
                    <p className="text-sm text-red-400">{error}</p>
                  </motion.div>
                )}
              </div>

              {/* Close Button */}
              {isComplete && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={onClose}
                  className="w-full mt-4 py-3 rounded-xl bg-glass-bg border border-glass-border text-white font-medium hover:bg-glass-hover transition-colors"
                >
                  {status === 'success' ? 'Done' : 'Close'}
                </motion.button>
              )}

              {/* ZK Animation */}
              {(status === 'proving') && (
                <div className="mt-4">
                  <ZKProofVisualization />
                </div>
              )}
            </GlassCard>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Helper to determine step status
function getStepStatus(step: TransactionStatus, current: TransactionStatus): 'pending' | 'active' | 'complete' | 'error' {
  const order: TransactionStatus[] = ['preparing', 'proving', 'broadcasting', 'confirming'];
  const stepIndex = order.indexOf(step);
  const currentIndex = order.indexOf(current);

  if (current === 'error') {
    return currentIndex >= stepIndex ? 'error' : 'pending';
  }
  if (current === 'success') return 'complete';
  if (currentIndex > stepIndex) return 'complete';
  if (currentIndex === stepIndex) return 'active';
  return 'pending';
}

interface StatusStepProps {
  label: string;
  status: 'pending' | 'active' | 'complete' | 'error';
  extra?: string;
}

function StatusStep({ label, status, extra }: StatusStepProps) {
  const colors = {
    pending: 'border-white/20 bg-white/5',
    active: 'border-electric bg-electric/20',
    complete: 'border-green-400 bg-green-400/20',
    error: 'border-red-400 bg-red-400/20',
  };

  const iconColors = {
    pending: 'text-white/30',
    active: 'text-electric',
    complete: 'text-green-400',
    error: 'text-red-400',
  };

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${colors[status]} transition-all`}>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${iconColors[status]}`}>
        {status === 'complete' ? <CheckIcon className="w-4 h-4" /> : 
         status === 'active' ? <SpinnerIcon className="w-4 h-4 animate-spin" /> :
         status === 'error' ? <ErrorIcon className="w-4 h-4" /> :
         <div className="w-2 h-2 rounded-full bg-current" />}
      </div>
      <span className={`flex-1 text-sm ${status === 'pending' ? 'text-white/40' : 'text-white'}`}>
        {label}
      </span>
      {extra && (
        <span className="text-xs text-electric font-mono">{extra}</span>
      )}
    </div>
  );
}

function ZKProofVisualization() {
  return (
    <div className="relative h-16 overflow-hidden rounded-lg bg-void/50">
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Animated proof bytes */}
        {[...Array(20)].map((_, i) => (
          <motion.span
            key={i}
            className="font-mono text-xs text-electric/60 mx-0.5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: [0, 1, 0],
              y: [-20, 0, 20],
            }}
            transition={{
              duration: 2,
              delay: i * 0.1,
              repeat: Infinity,
            }}
          >
            {Math.random().toString(16).slice(2, 4)}
          </motion.span>
        ))}
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-void to-transparent" />
    </div>
  );
}

// Icons
function SpinnerIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function ShieldIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function BroadcastIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
    </svg>
  );
}

function CheckIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ErrorIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
