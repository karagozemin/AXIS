'use client';

import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { WalletMultiButton } from '@demox-labs/aleo-wallet-adapter-reactui';

export function SidebarWalletButton() {
  const { publicKey, connected, connecting } = useWallet();

  const formatAddress = (address: string): string => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (connecting) {
    return (
      <button className="w-full btn-primary text-sm py-3 opacity-70 cursor-wait flex items-center justify-center gap-2">
        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Connecting...
      </button>
    );
  }

  if (connected && publicKey) {
    return (
      <div className="w-full p-3 rounded-xl bg-gradient-to-r from-electric/10 to-gold/10 border border-electric/30">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-white/50">Connected</span>
        </div>
        <p className="text-sm font-mono text-white truncate">
          {formatAddress(publicKey)}
        </p>
      </div>
    );
  }

  // Not connected - use WalletMultiButton with custom wrapper
  return (
    <div className="sidebar-wallet-wrapper">
      <WalletMultiButton />
      <style jsx global>{`
        .sidebar-wallet-wrapper .wallet-adapter-button {
          width: 100% !important;
          justify-content: center !important;
          background: linear-gradient(to right, #00D1FF, #0099CC) !important;
          border-radius: 12px !important;
          padding: 12px 20px !important;
          font-weight: 500 !important;
          font-size: 14px !important;
          color: #000 !important;
          transition: all 0.2s !important;
        }
        .sidebar-wallet-wrapper .wallet-adapter-button:hover {
          transform: scale(1.02) !important;
          box-shadow: 0 0 20px rgba(0, 209, 255, 0.3) !important;
        }
        .sidebar-wallet-wrapper .wallet-adapter-button-trigger {
          background: linear-gradient(to right, #00D1FF, #0099CC) !important;
        }
      `}</style>
    </div>
  );
}
