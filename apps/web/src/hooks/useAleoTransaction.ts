'use client';

import { useState, useCallback } from 'react';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { 
  Transaction, 
  WalletAdapterNetwork,
} from '@demox-labs/aleo-wallet-adapter-base';

// Transaction states
export type TransactionStatus = 'idle' | 'preparing' | 'proving' | 'broadcasting' | 'confirming' | 'success' | 'error';

interface TransactionState {
  status: TransactionStatus;
  txId: string | null;
  error: string | null;
  proofTime: number | null;
}

interface UseAleoTransactionReturn extends TransactionState {
  execute: (programId: string, functionName: string, inputs: string[], fee?: number) => Promise<string | null>;
  reset: () => void;
}

const initialState: TransactionState = {
  status: 'idle',
  txId: null,
  error: null,
  proofTime: null,
};

export function useAleoTransaction(): UseAleoTransactionReturn {
  const { connected, publicKey, requestTransaction } = useWallet();
  const [state, setState] = useState<TransactionState>(initialState);

  const execute = useCallback(async (
    programId: string,
    functionName: string,
    inputs: string[],
    fee: number = 500_000 // 0.5 credits default
  ): Promise<string | null> => {
    if (!connected || !publicKey) {
      setState({ ...initialState, status: 'error', error: 'Wallet not connected' });
      return null;
    }

    try {
      // Step 1: Preparing
      setState({ ...initialState, status: 'preparing' });
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 2: Proving (ZK proof generation)
      setState(prev => ({ ...prev, status: 'proving' }));
      const proofStart = Date.now();

      // Create transaction using the official adapter format
      const aleoTransaction = Transaction.createTransaction(
        publicKey,
        WalletAdapterNetwork.TestnetBeta,
        programId,
        functionName,
        inputs,
        fee
      );

      // Execute through wallet
      let txId: string | null = null;
      if (requestTransaction) {
        txId = await requestTransaction(aleoTransaction);
      }

      const proofTime = Date.now() - proofStart;

      if (!txId) {
        throw new Error('Transaction rejected or failed');
      }

      // Step 3: Broadcasting
      setState(prev => ({ ...prev, status: 'broadcasting', proofTime }));
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 4: Confirming
      setState(prev => ({ ...prev, status: 'confirming', txId }));
      
      // Wait for confirmation (simplified - in production poll the network)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Success!
      setState(prev => ({ ...prev, status: 'success' }));
      return txId;

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error.message || 'Transaction failed',
      }));
      return null;
    }
  }, [connected, publicKey, requestTransaction]);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// Specific hooks for AXIS programs
export function useCreditScore() {
  const tx = useAleoTransaction();
  const { publicKey } = useWallet();

  const mintCredibility = useCallback(async (bondAmount: string) => {
    if (!publicKey) return null;
    
    const currentTime = Math.floor(Date.now() / 1000).toString();
    
    return tx.execute(
      'axis_score_v1.aleo',
      'mint_credibility',
      [publicKey, `${bondAmount}u64`, '50u64', '80u64', `${currentTime}u64`] // owner, tx_count, balance_factor, repayment_rate, current_time
    );
  }, [publicKey, tx]);

  const verifyThreshold = useCallback(async (minScore: number) => {
    if (!publicKey) return null;
    
    // This would need the actual credit bond record
    return tx.execute(
      'axis_score_v1.aleo',
      'verify_threshold',
      [`${minScore}u64`] // minimum threshold
    );
  }, [publicKey, tx]);

  return {
    ...tx,
    mintCredibility,
    verifyThreshold,
  };
}

export function useLending() {
  const tx = useAleoTransaction();
  const { publicKey } = useWallet();

  const deposit = useCallback(async (amount: string) => {
    if (!publicKey) return null;
    
    const currentTime = Math.floor(Date.now() / 1000).toString();
    
    // For now, use a simple credits transfer to test wallet integration
    // Once axis_lending_v1.aleo is deployed, switch to:
    // return tx.execute('axis_lending_v1.aleo', 'seed_the_axis', [...])
    return tx.execute(
      'credits.aleo',
      'transfer_public',
      [publicKey, `${amount}u64`] // self-transfer for testing
    );
  }, [publicKey, tx]);

  const borrow = useCallback(async (amount: string, collateral: string) => {
    if (!publicKey) return null;
    
    const currentTime = Math.floor(Date.now() / 1000).toString();
    
    // For now, use a simple credits transfer to test wallet integration
    // Once axis_lending_v1.aleo is deployed, switch to:
    // return tx.execute('axis_lending_v1.aleo', 'access_liquidity', [...])
    return tx.execute(
      'credits.aleo',
      'transfer_public',
      [publicKey, `${amount}u64`] // self-transfer for testing
    );
  }, [publicKey, tx]);

  return {
    ...tx,
    deposit,
    borrow,
  };
}
