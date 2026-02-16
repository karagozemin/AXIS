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

// Poll interval and limits for transaction confirmation
const POLL_INTERVAL = 3000;   // 3 seconds between polls
const MAX_POLL_TIME = 180000; // 3 minutes max wait

export function useAleoTransaction(): UseAleoTransactionReturn {
  const { connected, publicKey, requestTransaction, transactionStatus: walletTxStatus } = useWallet();
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
      // Returns a wallet-internal tracking ID (UUID format)
      let walletTrackingId: string | null = null;
      if (requestTransaction) {
        walletTrackingId = await requestTransaction(aleoTransaction);
      }

      const proofTime = Date.now() - proofStart;

      if (!walletTrackingId) {
        throw new Error('Transaction rejected by wallet');
      }

      // Step 3: Broadcasting
      setState(prev => ({ ...prev, status: 'broadcasting', proofTime }));

      // Step 4: Confirming — poll wallet for actual on-chain confirmation
      setState(prev => ({ ...prev, status: 'confirming' }));

      // Poll transactionStatus until confirmed or timeout
      const confirmedTxId = await pollForConfirmation(walletTrackingId, walletTxStatus);

      // Use the real at1... TX ID if we got one, otherwise use tracking ID
      const finalTxId = confirmedTxId || walletTrackingId;
      
      setState(prev => ({ ...prev, status: 'success', txId: finalTxId }));
      return finalTxId;

    } catch (error: any) {
      const msg = error.message || 'Transaction failed';
      setState(prev => ({
        ...prev,
        status: 'error',
        error: msg,
      }));
      return null;
    }
  }, [connected, publicKey, requestTransaction, walletTxStatus]);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * Poll Leo Wallet's transactionStatus until confirmed or timeout.
 * 
 * Known Leo Wallet status values:
 *   "Pending"   — proof generated, not yet broadcast / not yet confirmed
 *   "Completed" — confirmed on-chain
 *   "Finalized" — finalized on-chain  
 *   "Failed"    — rejected by network
 *   "Rejected"  — user cancelled
 * 
 * If the status response itself contains an at1... TX ID we extract it.
 */
async function pollForConfirmation(
  trackingId: string,
  walletTxStatus: ((txId: string) => Promise<string>) | undefined,
): Promise<string | null> {
  if (!walletTxStatus) {
    // Wallet doesn't support status polling — fallback to API polling
    return await pollNodeForTransaction(trackingId);
  }

  const start = Date.now();

  while (Date.now() - start < MAX_POLL_TIME) {
    try {
      const statusStr = await walletTxStatus(trackingId);
      const status = statusStr.toLowerCase();

      // Check for completion
      if (status === 'completed' || status === 'finalized' || status === 'accepted') {
        // The trackingId might already be the real at1... id after completion
        if (trackingId.startsWith('at1')) {
          return trackingId;
        }
        // Otherwise try to fetch real TX ID from the node
        return trackingId;
      }

      // Check for failure
      if (status === 'failed' || status === 'rejected') {
        throw new Error(`Transaction ${status} on-chain`);
      }

      // Still pending — wait and retry
      await sleep(POLL_INTERVAL);
    } catch (error: any) {
      // If polling itself fails (e.g. wallet disconnected), throw
      if (error.message?.includes('failed') || error.message?.includes('rejected')) {
        throw error;
      }
      // For other errors (network issues), keep polling
      await sleep(POLL_INTERVAL);
    }
  }

  throw new Error('Transaction confirmation timed out (3 min). Check explorer for status.');
}

/**
 * Fallback: poll the Aleo node API directly for a transaction.
 */
async function pollNodeForTransaction(txId: string): Promise<string | null> {
  const apiBase = process.env.NEXT_PUBLIC_ALEO_RPC_URL || 'https://api.explorer.provable.com/v1';
  const start = Date.now();

  while (Date.now() - start < MAX_POLL_TIME) {
    try {
      const res = await fetch(`${apiBase}/testnet/transaction/${txId}`);
      if (res.ok) {
        const data = await res.json();
        // If confirmed, return the TX ID
        if (data && (data.id || data.transaction_id)) {
          return data.id || data.transaction_id || txId;
        }
      }
    } catch {
      // Network error — keep polling
    }
    await sleep(POLL_INTERVAL);
  }

  throw new Error('Transaction confirmation timed out (3 min). Check explorer for status.');
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
