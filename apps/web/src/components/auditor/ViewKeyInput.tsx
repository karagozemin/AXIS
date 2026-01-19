'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/shared';

interface ViewKeyInputProps {
  onVerify?: (viewKey: string) => void;
}

type VerificationStatus = 'idle' | 'verifying' | 'success' | 'error';

export function ViewKeyInput({ onVerify }: ViewKeyInputProps) {
  const [viewKey, setViewKey] = useState('');
  const [status, setStatus] = useState<VerificationStatus>('idle');

  const handleVerify = async () => {
    if (!viewKey.trim()) return;
    
    setStatus('verifying');
    
    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock verification - in production this would verify the view key against the blockchain
    if (viewKey.startsWith('AViewKey1')) {
      setStatus('success');
      onVerify?.(viewKey);
    } else {
      setStatus('error');
    }
    
    // Reset after showing result
    setTimeout(() => {
      if (status === 'success') {
        setViewKey('');
      }
      setStatus('idle');
    }, 3000);
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-electric/10 flex items-center justify-center">
          <KeyIcon className="w-5 h-5 text-electric" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">View Key Verification</h3>
          <p className="text-sm text-white/50">Enter a borrower&apos;s view key to access encrypted loan data</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={viewKey}
            onChange={(e) => setViewKey(e.target.value)}
            placeholder="AViewKey1..."
            className="w-full bg-void/50 border border-glass-border rounded-lg px-4 py-3 text-white placeholder:text-white/30 font-mono text-sm focus:outline-none focus:border-electric/50 focus:ring-1 focus:ring-electric/50 transition-colors"
            disabled={status === 'verifying'}
          />
          
          <AnimatePresence>
            {status === 'verifying' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <div className="w-5 h-5 border-2 border-electric/30 border-t-electric rounded-full animate-spin" />
              </motion.div>
            )}
            {status === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <CheckCircleIcon className="w-5 h-5 text-green-400" />
              </motion.div>
            )}
            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <XCircleIcon className="w-5 h-5 text-red-400" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={handleVerify}
          disabled={!viewKey.trim() || status === 'verifying'}
          className="w-full py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-electric/20 text-electric hover:bg-electric/30 hover:shadow-[0_0_20px_rgba(0,212,255,0.3)]"
        >
          {status === 'verifying' ? 'Verifying View Key...' : 'Verify & Decrypt'}
        </button>

        <AnimatePresence>
          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3 rounded-lg bg-green-500/10 border border-green-500/30"
            >
              <p className="text-sm text-green-400">
                ✓ View key verified. Decrypted loan data is now accessible.
              </p>
            </motion.div>
          )}
          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3 rounded-lg bg-red-500/10 border border-red-500/30"
            >
              <p className="text-sm text-red-400">
                ✗ Invalid view key. Please check the format and try again.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* How it works */}
      <div className="mt-6 pt-4 border-t border-glass-border">
        <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
          How View Keys Work
        </h4>
        <div className="space-y-2">
          {[
            'View keys are derived from the borrower\'s private key',
            'They can only decrypt specific record fields',
            'The borrower controls what data is disclosed',
            'All verifications are logged on-chain',
          ].map((item, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-electric/60 text-xs">•</span>
              <span className="text-xs text-white/40">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

function KeyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
