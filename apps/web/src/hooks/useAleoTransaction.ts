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

      // Step 4: Confirming — poll for real on-chain TX ID (at1...)
      setState(prev => ({ ...prev, status: 'confirming' }));

      const realTxId = await resolveRealTransactionId(
        walletTrackingId, 
        walletTxStatus, 
        getExecution
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
  }, [connected, publicKey, requestTransaction, walletTxStatus, getExecution]);

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
 * Resolve the real on-chain at1... transaction ID from the wallet's tracking UUID.
 * 
 * Strategy:
 * 1. If the ID already starts with "at1", it's real — return immediately
 * 2. Poll walletTxStatus until "Completed" / "Finalized"
 * 3. Once confirmed, call getExecution to extract the real at1... TX ID
 * 4. If getExecution fails, search recent transactions via node API
 * 5. Timeout after 3 minutes
 */
async function resolveRealTransactionId(
  trackingId: string,
  walletTxStatus: ((txId: string) => Promise<string>) | undefined,
  getExecution: ((txId: string) => Promise<string>) | undefined,
): Promise<string> {
  // If already a real Aleo TX ID, return it
  if (trackingId.startsWith('at1')) {
    return trackingId;
  }

  const start = Date.now();

  // Phase 1: Wait for wallet to confirm the transaction
  while (Date.now() - start < MAX_POLL_TIME) {
    // Try to get execution data (contains real TX ID)
    if (getExecution) {
      try {
        const executionData = await getExecution(trackingId);
        // executionData may be a JSON string or contain the at1... ID
        const realId = extractAleoTxId(executionData);
        if (realId) return realId;
      } catch {
        // Not ready yet — keep polling
      }
    }

    // Check transaction status via wallet
    if (walletTxStatus) {
      try {
        const statusStr = await walletTxStatus(trackingId);
        const status = statusStr.toLowerCase();

        // Extract at1... from status string if embedded
        const embeddedId = extractAleoTxId(statusStr);
        if (embeddedId) return embeddedId;

        if (status === 'failed' || status === 'rejected') {
          throw new Error(`Transaction ${status} on-chain`);
        }

        // If completed but no at1... found yet, try getExecution one more time
        if (status === 'completed' || status === 'finalized' || status === 'accepted') {
          if (getExecution) {
            try {
              const executionData = await getExecution(trackingId);
              const realId = extractAleoTxId(executionData);
              if (realId) return realId;
            } catch {
              // Fall through to node API search
            }
          }
          // Confirmed but can't get real ID — try node API
          const nodeId = await searchNodeForRecentTx(trackingId);
          if (nodeId) return nodeId;
          
          // Last resort: return tracking ID (user can still check wallet)
          return trackingId;
        }
      } catch (error: any) {
        if (error.message?.includes('failed') || error.message?.includes('rejected')) {
          throw error;
        }
      }
    }

    await sleep(POLL_INTERVAL);
  }

  throw new Error('Transaction confirmation timed out (3 min). Check your wallet for status.');
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
