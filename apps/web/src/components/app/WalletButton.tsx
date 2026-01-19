'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { WalletMultiButton } from '@demox-labs/aleo-wallet-adapter-reactui';
import { GlassCard } from '@/components/shared';

export function WalletButton() {
  const { publicKey, connected, connecting, disconnect } = useWallet();
  const [showDropdown, setShowDropdown] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);

  // Fetch balance when connected
  useEffect(() => {
    if (publicKey) {
      fetchBalance(publicKey);
    } else {
      setBalance(null);
    }
  }, [publicKey]);

  const fetchBalance = async (address: string) => {
    try {
      const response = await fetch(
        `https://api.explorer.provable.com/v1/testnet/program/credits.aleo/mapping/account/${address}`
      );
      
      if (response.ok) {
        const data = await response.text();
        // Parse microcredits to credits (remove "u64" suffix)
        const cleanData = data.replace(/["\s]/g, '').replace('u64', '');
        const microcredits = parseInt(cleanData) || 0;
        const credits = (microcredits / 1_000_000).toFixed(2);
        setBalance(credits);
      } else {
        setBalance('0.00');
      }
    } catch (err) {
      console.log('Balance fetch failed');
      setBalance('0.00');
    }
  };

  const formatAddress = (address: string): string => {
    if (!address) return '';
    if (address.length <= 16) return address;
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  // Show loading state
  if (connecting) {
    return (
      <motion.button
        className="px-4 py-2 rounded-xl bg-electric/20 border border-electric/30 flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <LoadingSpinner />
        <span className="text-sm text-white/70">Connecting...</span>
      </motion.button>
    );
  }

  // Connected state with custom dropdown
  if (connected && publicKey) {
    return (
      <div className="relative">
        <motion.button
          onClick={() => setShowDropdown(!showDropdown)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-electric/20 to-gold/20 border border-electric/30 flex items-center gap-3 hover:border-electric/50 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Status indicator */}
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          
          {/* Address */}
          <span className="text-sm font-mono text-white">
            {formatAddress(publicKey)}
          </span>

          {/* Balance badge */}
          {balance && (
            <span className="px-2 py-0.5 rounded-md bg-electric/20 text-xs text-electric font-medium">
              {balance} AC
            </span>
          )}

          <ChevronIcon className={`w-4 h-4 text-white/50 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </motion.button>

        {/* Dropdown */}
        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute right-0 top-full mt-2 z-50"
            >
              <GlassCard className="p-2 min-w-[220px]">
                <div className="p-3 border-b border-white/10">
                  <p className="text-xs text-white/50 mb-1">Connected Address</p>
                  <p className="text-sm font-mono text-white break-all">{publicKey}</p>
                </div>

                {balance && (
                  <div className="p-3 border-b border-white/10">
                    <p className="text-xs text-white/50 mb-1">Balance</p>
                    <p className="text-lg font-medium text-electric">
                      {balance} <span className="text-sm text-white/50">Aleo Credits</span>
                    </p>
                  </div>
                )}

                <div className="p-3 border-b border-white/10">
                  <p className="text-xs text-white/50 mb-1">Network</p>
                  <p className="text-sm text-green-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                    Testnet
                  </p>
                </div>

                <button
                  onClick={() => {
                    disconnect();
                    setShowDropdown(false);
                  }}
                  className="w-full p-3 text-left text-sm text-red-400 hover:bg-red-400/10 rounded-lg transition-colors flex items-center gap-2"
                >
                  <DisconnectIcon className="w-4 h-4" />
                  Disconnect Wallet
                </button>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Click outside to close */}
        {showDropdown && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)} 
          />
        )}
      </div>
    );
  }

  // Not connected - use the official WalletMultiButton with custom styling
  return (
    <div className="aleo-wallet-button-wrapper">
      <WalletMultiButton />
      <style jsx global>{`
        .aleo-wallet-button-wrapper .wallet-adapter-button {
          background: linear-gradient(to right, #00D1FF, #0099CC) !important;
          border-radius: 12px !important;
          padding: 10px 20px !important;
          font-weight: 500 !important;
          font-size: 14px !important;
          transition: all 0.2s !important;
        }
        .aleo-wallet-button-wrapper .wallet-adapter-button:hover {
          transform: scale(1.02);
          box-shadow: 0 0 20px rgba(0, 209, 255, 0.25) !important;
        }
        .wallet-adapter-modal-wrapper {
          background: rgba(5, 5, 15, 0.95) !important;
        }
        .wallet-adapter-modal-container {
          background: rgba(10, 10, 30, 0.9) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 16px !important;
        }
        .wallet-adapter-modal-title {
          color: white !important;
        }
        .wallet-adapter-modal-list li {
          background: rgba(255, 255, 255, 0.05) !important;
          border-radius: 12px !important;
        }
        .wallet-adapter-modal-list li:hover {
          background: rgba(0, 209, 255, 0.1) !important;
        }
      `}</style>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <svg className="w-4 h-4 animate-spin text-electric" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function DisconnectIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  );
}
