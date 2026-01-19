'use client';

import { FC, ReactNode, useMemo } from 'react';
import { WalletProvider as AleoWalletProvider, useWallet as useAleoWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { WalletModalProvider } from '@demox-labs/aleo-wallet-adapter-reactui';
import { LeoWalletAdapter } from '@demox-labs/aleo-wallet-adapter-leo';
import {
  DecryptPermission,
  WalletAdapterNetwork,
} from '@demox-labs/aleo-wallet-adapter-base';

// Import the styles
import '@demox-labs/aleo-wallet-adapter-reactui/styles.css';

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: FC<WalletProviderProps> = ({ children }) => {
  const wallets = useMemo(
    () => [
      new LeoWalletAdapter({
        appName: 'AXIS Protocol',
      }),
    ],
    []
  );

  return (
    <AleoWalletProvider
      wallets={wallets}
      decryptPermission={DecryptPermission.UponRequest}
      network={WalletAdapterNetwork.TestnetBeta}
      autoConnect={true}
    >
      <WalletModalProvider>
        {children}
      </WalletModalProvider>
    </AleoWalletProvider>
  );
};

// Re-export the hook with additional helpers
export function useWallet() {
  const wallet = useAleoWallet();
  
  const formatAddress = (address: string): string => {
    if (!address) return '';
    if (address.length <= 16) return address;
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  return {
    ...wallet,
    formatAddress,
    // Map to our expected interface
    address: wallet.publicKey,
    balance: null, // Will be fetched separately
    network: 'testnet' as const,
  };
}
