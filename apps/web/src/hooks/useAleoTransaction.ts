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
      setState({ ...initialState, status: 'error', error: 'Connect Leo Wallet to sign transactions' });
      return null;
    }

    try {
      // Step 1: Preparing
      setState({ ...initialState, status: 'preparing' });

      // Step 2: Proving (ZK proof generation via Leo Wallet)
      setState(prev => ({ ...prev, status: 'proving' }));
      const proofStart = Date.now();

      const aleoTransaction = Transaction.createTransaction(
        publicKey,
        WalletAdapterNetwork.TestnetBeta,
        programId,
        functionName,
        inputs,
        fee,
        false // use public balance for fees
      );

      // Execute through Leo Wallet — real ZK proof generated here
      let txId: string | null = null;
      if (requestTransaction) {
        txId = await requestTransaction(aleoTransaction);
      }

      const proofTime = Date.now() - proofStart;

      if (!txId) {
        throw new Error('Transaction rejected by wallet');
      }

      // Step 3: Broadcasting
      setState(prev => ({ ...prev, status: 'broadcasting', proofTime }));
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 4: Confirming
      setState(prev => ({ ...prev, status: 'confirming', txId }));
      
      // Poll for confirmation (simplified — in production poll the network)
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

// ============================================================================
// AXIS v2 Program Hooks
// ============================================================================

// Program IDs — v2 (deployed to Aleo testnet)
const SCORE_PROGRAM = 'axis_score_v2.aleo';
const LENDING_PROGRAM = 'axis_lending_v2.aleo';

// ── Credit Score Hook ──────────────────────────────────────────────────────

export interface CreditFactors {
  repaymentHistory: number;      // 0-100: % of loans repaid on time
  positionDuration: number;      // 0-100: months active (capped)
  utilizationRate: number;       // 0-100: current utilization %
  protocolInteractions: number;  // 0-100: interaction frequency (capped)
  collateralDiversity: number;   // 0-100: diversity index (capped)
}

export function useCreditScore() {
  const tx = useAleoTransaction();
  const { publicKey } = useWallet();

  const computeCredibility = useCallback(async (factors: CreditFactors) => {
    if (!publicKey) return null;

    const currentTime = Math.floor(Date.now() / 1000).toString();
    return tx.execute(
      SCORE_PROGRAM,
      'compute_credibility',
      [
        publicKey,
        `${factors.repaymentHistory}u64`,
        `${factors.positionDuration}u64`,
        `${factors.utilizationRate}u64`,
        `${factors.protocolInteractions}u64`,
        `${factors.collateralDiversity}u64`,
        `${currentTime}u64`,
      ]
    );
  }, [publicKey, tx]);

  const verifyThreshold = useCallback(async (minScore: number) => {
    if (!publicKey) return null;

    return tx.execute(
      SCORE_PROGRAM,
      'verify_threshold',
      [`${minScore}u64`]
    );
  }, [publicKey, tx]);

  const createAuditToken = useCallback(async (verifierAddress: string, requiredScore: number) => {
    if (!publicKey) return null;

    const currentTime = Math.floor(Date.now() / 1000).toString();
    return tx.execute(
      SCORE_PROGRAM,
      'create_audit_token',
      [verifierAddress, `${requiredScore}u64`, `${currentTime}u64`]
    );
  }, [publicKey, tx]);

  const commitScore = useCallback(async () => {
    if (!publicKey) return null;

    return tx.execute(SCORE_PROGRAM, 'commit_score', []);
  }, [publicKey, tx]);

  return {
    ...tx,
    computeCredibility,
    verifyThreshold,
    createAuditToken,
    commitScore,
  };
}

// ── Lending Hook ───────────────────────────────────────────────────────────

export type LendingTier = 1 | 2 | 3;

export function useLending() {
  const tx = useAleoTransaction();
  const { publicKey } = useWallet();

  const deposit = useCallback(async (amount: string, lockDays: number = 30) => {
    if (!publicKey) return null;

    const currentTime = Math.floor(Date.now() / 1000).toString();
    return tx.execute(
      LENDING_PROGRAM,
      'seed_the_axis',
      [publicKey, `${amount}u64`, `${lockDays}u64`, `${currentTime}u64`]
    );
  }, [publicKey, tx]);

  const borrow = useCallback(async (amount: string, collateral: string, tier: LendingTier = 3) => {
    if (!publicKey) return null;

    const currentTime = Math.floor(Date.now() / 1000).toString();
    return tx.execute(
      LENDING_PROGRAM,
      'access_liquidity',
      [publicKey, `${amount}u64`, `${collateral}u64`, `${tier}u8`, `${currentTime}u64`]
    );
  }, [publicKey, tx]);

  const repay = useCallback(async (repayAmount: string) => {
    if (!publicKey) return null;

    return tx.execute(
      LENDING_PROGRAM,
      'repay_loan',
      [`${repayAmount}u64`]
    );
  }, [publicKey, tx]);

  const withdraw = useCallback(async () => {
    if (!publicKey) return null;

    const currentTime = Math.floor(Date.now() / 1000).toString();
    return tx.execute(
      LENDING_PROGRAM,
      'withdraw_liquidity',
      [`${currentTime}u64`]
    );
  }, [publicKey, tx]);

  return {
    ...tx,
    deposit,
    borrow,
    repay,
    withdraw,
  };
}
