'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard, GradientText } from '@/components/shared';

interface AuditToken {
  token: string;
  loanId: string;
  scope: string[];
  expiry: string;
}

export function AuditTokenGenerator() {
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
  const [expiryDays, setExpiryDays] = useState(7);
  const [generatedToken, setGeneratedToken] = useState<AuditToken | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const availableScopes = [
    { id: 'identity', label: 'Identity', description: 'Name and address hash' },
    { id: 'income', label: 'Income Data', description: 'Verified income range' },
    { id: 'credit', label: 'Credit Score', description: 'On-chain credit score' },
    { id: 'loan', label: 'Loan Details', description: 'Amount, term, interest rate' },
    { id: 'collateral', label: 'Collateral', description: 'Collateral type and ratio' },
    { id: 'payment', label: 'Payment History', description: 'Payment records' },
  ];

  const toggleScope = (scopeId: string) => {
    setSelectedScopes(prev => 
      prev.includes(scopeId) 
        ? prev.filter(s => s !== scopeId)
        : [...prev, scopeId]
    );
  };

  const handleGenerate = async () => {
    if (selectedScopes.length === 0) return;
    
    setIsGenerating(true);
    
    // Simulate token generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const token: AuditToken = {
      token: `AT-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
      loanId: 'at1qx7...m3k9',
      scope: selectedScopes,
      expiry: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString(),
    };
    
    setGeneratedToken(token);
    setIsGenerating(false);
  };

  const copyToken = () => {
    if (generatedToken) {
      navigator.clipboard.writeText(generatedToken.token);
    }
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
          <TokenIcon className="w-5 h-5 text-gold" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Generate Audit Token</h3>
          <p className="text-sm text-white/50">Create a scoped disclosure token for auditors</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!generatedToken ? (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Scope Selection */}
            <div>
              <label className="text-sm text-white/70 mb-3 block">
                Select disclosure scope
              </label>
              <div className="grid grid-cols-2 gap-2">
                {availableScopes.map((scope) => (
                  <button
                    key={scope.id}
                    onClick={() => toggleScope(scope.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedScopes.includes(scope.id)
                        ? 'border-electric bg-electric/10'
                        : 'border-glass-border bg-void/30 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded border ${
                        selectedScopes.includes(scope.id)
                          ? 'border-electric bg-electric'
                          : 'border-white/30'
                      } flex items-center justify-center`}>
                        {selectedScopes.includes(scope.id) && (
                          <CheckIcon className="w-3 h-3 text-void" />
                        )}
                      </div>
                      <span className="text-sm text-white">{scope.label}</span>
                    </div>
                    <p className="text-xs text-white/40 mt-1 ml-6">{scope.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Expiry Selection */}
            <div>
              <label className="text-sm text-white/70 mb-3 block">
                Token expiry
              </label>
              <div className="flex gap-2">
                {[1, 7, 30, 90].map((days) => (
                  <button
                    key={days}
                    onClick={() => setExpiryDays(days)}
                    className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                      expiryDays === days
                        ? 'border-gold bg-gold/10 text-gold'
                        : 'border-glass-border text-white/50 hover:border-white/20'
                    }`}
                  >
                    {days} {days === 1 ? 'day' : 'days'}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={selectedScopes.length === 0 || isGenerating}
              className="w-full py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-gold/20 to-electric/20 text-white hover:from-gold/30 hover:to-electric/30 border border-gold/30"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating ZK Proof...
                </span>
              ) : (
                'Generate Audit Token'
              )}
            </button>

            {/* Privacy Notice */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-electric/5 border border-electric/20">
              <ShieldIcon className="w-5 h-5 text-electric flex-shrink-0" />
              <p className="text-xs text-white/50">
                Only the selected data fields will be disclosed. Your private key and other sensitive data remain encrypted.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Success Header */}
            <div className="text-center py-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3"
              >
                <CheckCircleIcon className="w-8 h-8 text-green-400" />
              </motion.div>
              <h4 className="text-lg font-semibold text-white">Audit Token Generated</h4>
              <p className="text-sm text-white/50 mt-1">Share this token with authorized auditors</p>
            </div>

            {/* Token Display */}
            <div className="p-4 rounded-lg bg-void border border-glass-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/40 uppercase tracking-wider">Token</span>
                <button
                  onClick={copyToken}
                  className="text-xs text-electric hover:text-electric-400 transition-colors"
                >
                  Copy
                </button>
              </div>
              <p className="font-mono text-lg text-center py-3">
                <GradientText variant="gold">{generatedToken.token}</GradientText>
              </p>
            </div>

            {/* Token Details */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-void/50">
                <span className="text-white/40 text-xs">Loan ID</span>
                <p className="text-white font-mono mt-1">{generatedToken.loanId}</p>
              </div>
              <div className="p-3 rounded-lg bg-void/50">
                <span className="text-white/40 text-xs">Expires</span>
                <p className="text-white mt-1">{new Date(generatedToken.expiry).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Scope Summary */}
            <div className="p-3 rounded-lg bg-void/50">
              <span className="text-white/40 text-xs">Disclosed Fields</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {generatedToken.scope.map(s => (
                  <span key={s} className="px-2 py-1 rounded text-xs bg-electric/10 text-electric border border-electric/30">
                    {availableScopes.find(scope => scope.id === s)?.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setGeneratedToken(null)}
                className="flex-1 py-2 rounded-lg border border-glass-border text-white/70 hover:bg-white/5 transition-colors"
              >
                Generate Another
              </button>
              <button className="flex-1 py-2 rounded-lg bg-electric/20 text-electric hover:bg-electric/30 transition-colors">
                Share Token
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

function TokenIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5h-.75A2.25 2.25 0 004.5 9.75v7.5a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25v-7.5a2.25 2.25 0 00-2.25-2.25h-.75m0-3l-3-3m0 0l-3 3m3-3v11.25m6-2.25h.75a2.25 2.25 0 012.25 2.25v7.5a2.25 2.25 0 01-2.25 2.25h-7.5a2.25 2.25 0 01-2.25-2.25v-.75" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
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

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}
