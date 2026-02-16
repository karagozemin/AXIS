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
  executeDemo: (programId: string, functionName: string) => Promise<string | null>;
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
      // Use public fee (not private records) for fee payment
      const aleoTransaction = Transaction.createTransaction(
        publicKey,
        WalletAdapterNetwork.TestnetBeta,
        programId,
        functionName,
        inputs,
        fee,
        false // feePrivate = false, use public balance for fees
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

  // Demo mode - simulate transaction without actual blockchain interaction
  const executeDemo = useCallback(async (
    programId: string,
    functionName: string,
  ): Promise<string | null> => {
    if (!connected || !publicKey) {
      setState({ ...initialState, status: 'error', error: 'Wallet not connected' });
      return null;
    }

    try {
      // Step 1: Preparing
      setState({ ...initialState, status: 'preparing' });
      await new Promise(resolve => setTimeout(resolve, 800));

      // Step 2: Proving (ZK proof generation simulation)
      setState(prev => ({ ...prev, status: 'proving' }));
      const proofStart = Date.now();
      
      // Simulate ZK proof generation (2-4 seconds)
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
      
      const proofTime = Date.now() - proofStart;

      // Generate demo transaction ID
      const demoTxId = `at1demo${Date.now().toString(36)}${Math.random().toString(36).substring(2, 15)}`;

      // Step 3: Broadcasting
      setState(prev => ({ ...prev, status: 'broadcasting', proofTime }));
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 4: Confirming
      setState(prev => ({ ...prev, status: 'confirming', txId: demoTxId }));
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Success!
      setState(prev => ({ ...prev, status: 'success' }));
      
      console.log(`[DEMO] Simulated ${programId}/${functionName} - TX: ${demoTxId}`);
      return demoTxId;

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error.message || 'Transaction failed',
      }));
      return null;
    }
  }, [connected, publicKey]);

  return {
    ...state,
    execute,
    executeDemo,
    reset,
  };
}

// ============================================================================
// AXIS v2 Program Hooks
// ============================================================================

// Program IDs — v2
const SCORE_PROGRAM = 'axis_score_v2.aleo';
const LENDING_PROGRAM = 'axis_lending_v2.aleo';

// Set to false once contracts are deployed to testnet
const DEMO_MODE = true;

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

  // Compute a privacy-preserving credit score using the 5-factor model.
  // All inputs remain private inside the ZK circuit.
  const computeCredibility = useCallback(async (factors: CreditFactors) => {
    if (!publicKey) return null;

    if (DEMO_MODE) {
      return tx.executeDemo(SCORE_PROGRAM, 'compute_credibility');
    }

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

  // Verify that a CreditBond meets a minimum threshold (private check).
  const verifyThreshold = useCallback(async (minScore: number) => {
    if (!publicKey) return null;

    if (DEMO_MODE) {
      return tx.executeDemo(SCORE_PROGRAM, 'verify_threshold');
    }

    return tx.execute(
      SCORE_PROGRAM,
      'verify_threshold',
      [`${minScore}u64`]
    );
  }, [publicKey, tx]);

  // Generate an AuditToken for a verifier (lending pool).
  // Proves "score >= threshold" without revealing the actual score.
  const createAuditToken = useCallback(async (verifierAddress: string, requiredScore: number) => {
    if (!publicKey) return null;

    if (DEMO_MODE) {
      return tx.executeDemo(SCORE_PROGRAM, 'create_audit_token');
    }

    const currentTime = Math.floor(Date.now() / 1000).toString();
    return tx.execute(
      SCORE_PROGRAM,
      'create_audit_token',
      [verifierAddress, `${requiredScore}u64`, `${currentTime}u64`]
    );
  }, [publicKey, tx]);

  // Commit score hash on-chain (proves freshness without revealing score).
  const commitScore = useCallback(async () => {
    if (!publicKey) return null;

    if (DEMO_MODE) {
      return tx.executeDemo(SCORE_PROGRAM, 'commit_score');
    }

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

  // Deposit liquidity into the Axis pool.
  // 5% automatically goes to the Insurance Fund.
  const deposit = useCallback(async (amount: string, lockDays: number = 30) => {
    if (!publicKey) return null;

    if (DEMO_MODE) {
      return tx.executeDemo(LENDING_PROGRAM, 'seed_the_axis');
    }

    const currentTime = Math.floor(Date.now() / 1000).toString();
    return tx.execute(
      LENDING_PROGRAM,
      'seed_the_axis',
      [publicKey, `${amount}u64`, `${lockDays}u64`, `${currentTime}u64`]
    );
  }, [publicKey, tx]);

  // Borrow from the pool with tier-based collateral requirements.
  //   Tier 1 (Elite): 50% collateral, 3.5% APR
  //   Tier 2 (Core):  75% collateral, 5.0% APR
  //   Tier 3 (Entry): 90% collateral, 8.0% APR
  const borrow = useCallback(async (amount: string, collateral: string, tier: LendingTier = 3) => {
    if (!publicKey) return null;

    if (DEMO_MODE) {
      return tx.executeDemo(LENDING_PROGRAM, 'access_liquidity');
    }

    const currentTime = Math.floor(Date.now() / 1000).toString();
    return tx.execute(
      LENDING_PROGRAM,
      'access_liquidity',
      [publicKey, `${amount}u64`, `${collateral}u64`, `${tier}u8`, `${currentTime}u64`]
    );
  }, [publicKey, tx]);

  // Repay a loan in full.
  const repay = useCallback(async (repayAmount: string) => {
    if (!publicKey) return null;

    if (DEMO_MODE) {
      return tx.executeDemo(LENDING_PROGRAM, 'repay_loan');
    }

    return tx.execute(
      LENDING_PROGRAM,
      'repay_loan',
      [`${repayAmount}u64`]
    );
  }, [publicKey, tx]);

  // Withdraw liquidity (after lock period expires).
  const withdraw = useCallback(async () => {
    if (!publicKey) return null;

    if (DEMO_MODE) {
      return tx.executeDemo(LENDING_PROGRAM, 'withdraw_liquidity');
    }

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
