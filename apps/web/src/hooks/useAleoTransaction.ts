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
  const { 
    connected, 
    publicKey, 
    requestTransaction,
    requestExecution,
    transactionStatus: walletTxStatus,
    getExecution,
  } = useWallet();
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

      // Try requestExecution first (returns real at1... TX ID on newer wallets),
      // fall back to requestTransaction (returns UUID tracking ID)
      let rawTxId: string | null = null;
      
      if (requestExecution) {
        try {
          rawTxId = await requestExecution(aleoTransaction);
        } catch {
          // requestExecution not supported, fall back
        }
      }
      
      if (!rawTxId && requestTransaction) {
        rawTxId = await requestTransaction(aleoTransaction);
      }

      const proofTime = Date.now() - proofStart;

      if (!rawTxId) {
        throw new Error('Transaction rejected by wallet');
      }

      // Step 3: Broadcasting  
      setState(prev => ({ ...prev, status: 'broadcasting', proofTime }));

      // Step 4: Confirm + resolve real TX ID
      setState(prev => ({ ...prev, status: 'confirming' }));

      // If we already got a real at1... ID, we're done
      if (rawTxId.startsWith('at1')) {
        // Still wait for on-chain confirmation
        await waitForOnChainConfirmation(rawTxId);
        setState(prev => ({ ...prev, status: 'success', txId: rawTxId }));
        return rawTxId;
      }

      // We got a UUID — need to resolve real TX ID
      const realTxId = await resolveRealTransactionId(
        rawTxId,
        walletTxStatus,
        getExecution,
      );

      setState(prev => ({ ...prev, status: 'success', txId: realTxId }));
      return realTxId;

    } catch (error: any) {
      const msg = error.message || 'Transaction failed';
      setState(prev => ({
        ...prev,
        status: 'error',
        error: msg,
      }));
      return null;
    }
  }, [connected, publicKey, requestTransaction, requestExecution, walletTxStatus, getExecution]);

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
 * Wait for a known at1... TX to appear on-chain.
 */
async function waitForOnChainConfirmation(txId: string): Promise<void> {
  const apiBase = process.env.NEXT_PUBLIC_ALEO_RPC_URL || 'https://api.explorer.provable.com/v1';
  const start = Date.now();

  while (Date.now() - start < MAX_POLL_TIME) {
    try {
      const res = await fetch(`${apiBase}/testnet/transaction/${txId}`);
      if (res.ok) return; // Found on-chain
    } catch {
      // Network error, keep trying
    }
    await sleep(POLL_INTERVAL);
  }
  // Don't throw — TX might still be propagating
}

/**
 * Resolve the real on-chain at1... transaction ID from the wallet's tracking UUID.
 * 
 * Leo Wallet returns a UUID (e.g. "e9416ec1-0853-4c..."). 
 * We need to poll wallet APIs and/or the node to get the real at1... ID.
 */
async function resolveRealTransactionId(
  trackingId: string,
  walletTxStatus: ((txId: string) => Promise<string>) | undefined,
  getExecution: ((txId: string) => Promise<string>) | undefined,
): Promise<string> {
  if (trackingId.startsWith('at1')) return trackingId;

  const start = Date.now();

  while (Date.now() - start < MAX_POLL_TIME) {
    
    // Strategy 1: getExecution may return data containing real TX ID
    if (getExecution) {
      try {
        const executionData = await getExecution(trackingId);
        const realId = extractAleoTxId(executionData);
        if (realId) return realId;
      } catch {
        // Not ready yet
      }
    }

    // Strategy 2: transactionStatus may embed or return real TX ID
    if (walletTxStatus) {
      try {
        const statusStr = await walletTxStatus(trackingId);
        
        // Check if status string contains an at1... ID
        const embeddedId = extractAleoTxId(statusStr);
        if (embeddedId) return embeddedId;

        const status = statusStr.toLowerCase();
        
        if (status === 'failed' || status === 'rejected') {
          throw new Error(`Transaction ${status} on-chain`);
        }

        if (status === 'completed' || status === 'finalized' || status === 'accepted') {
          // Confirmed — try getExecution one final time
          if (getExecution) {
            try {
              const executionData = await getExecution(trackingId);
              const realId = extractAleoTxId(executionData);
              if (realId) return realId;
            } catch { /* fall through */ }
          }
          // Wallet says confirmed but we can't get the at1... ID
          // Return UUID — user sees "Transaction Complete" but link won't work on explorer
          return trackingId;
        }
      } catch (error: any) {
        if (error.message?.includes('failed') || error.message?.includes('rejected')) {
          throw error;
        }
      }
    }

    // Strategy 3: Neither wallet method available — just wait and return UUID
    // (Leo Wallet already confirmed the TX internally when requestTransaction resolved)
    if (!walletTxStatus && !getExecution) {
      // The wallet already handled everything — requestTransaction only returns 
      // after the TX is broadcast. We can't get the real at1... ID without wallet support.
      // Return the UUID so at least the user sees something.
      return trackingId;
    }

    await sleep(POLL_INTERVAL);
  }

  // Timeout — return what we have
  return trackingId;
}

/**
 * Extract an at1... transaction ID from any string (status response, execution data, etc.)
 */
function extractAleoTxId(data: string): string | null {
  if (!data) return null;
  // Aleo TX IDs are "at1" followed by 58 alphanumeric chars
  const match = data.match(/at1[a-z0-9]{58,62}/i);
  return match ? match[0] : null;
}

/**
 * Search Aleo node API for a recent transaction (fallback when wallet doesn't provide real TX ID)
 */
async function searchNodeForRecentTx(trackingId: string): Promise<string | null> {
  const apiBase = process.env.NEXT_PUBLIC_ALEO_RPC_URL || 'https://api.explorer.provable.com/v1';
  
  try {
    // Try direct lookup with the tracking ID
    const res = await fetch(`${apiBase}/testnet/transaction/${trackingId}`);
    if (res.ok) {
      const data = await res.json();
      if (data?.id) return data.id;
      const textId = extractAleoTxId(JSON.stringify(data));
      if (textId) return textId;
    }
  } catch {
    // Not found — expected for UUID tracking IDs
  }

  return null;
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
