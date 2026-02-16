'use client';

import { useState, useCallback, useRef } from 'react';
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
const POLL_INTERVAL = 4000;   // 4 seconds between polls
const MAX_POLL_TIME = 300000; // 5 minutes max wait
const NODE_API = 'https://api.explorer.provable.com/v1/testnet';

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
  // Track the target program for on-chain search
  const targetProgramRef = useRef<string | null>(null);

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

    targetProgramRef.current = programId;

    try {
      // Step 1: Preparing
      setState({ ...initialState, status: 'preparing' });
      await sleep(300); // Brief UI feedback

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

      console.log('[AXIS TX] Submitting to Leo Wallet:', { programId, functionName, inputs: inputs.length });

      // Try requestExecution first, then fallback to requestTransaction
      let rawTxId: string | null = null;
      
      if (requestExecution) {
        try {
          console.log('[AXIS TX] Using requestExecution...');
          rawTxId = await requestExecution(aleoTransaction);
          console.log('[AXIS TX] requestExecution returned:', rawTxId);
        } catch (e: any) {
          console.log('[AXIS TX] requestExecution failed:', e?.message);
        }
      }
      
      if (!rawTxId && requestTransaction) {
        console.log('[AXIS TX] Falling back to requestTransaction...');
        rawTxId = await requestTransaction(aleoTransaction);
        console.log('[AXIS TX] requestTransaction returned:', rawTxId);
      }

      const proofTime = Date.now() - proofStart;

      if (!rawTxId) {
        throw new Error('Transaction rejected by wallet');
      }

      // Step 3: Broadcasting — wallet already did this, brief visual step
      setState(prev => ({ ...prev, status: 'broadcasting', proofTime }));
      await sleep(1500);

      // Step 4: Confirm — actually wait for on-chain confirmation
      setState(prev => ({ ...prev, status: 'confirming' }));

      // Resolve the real on-chain TX ID
      const realTxId = await resolveTransactionId(
        rawTxId,
        programId,
        walletTxStatus,
        getExecution,
      );

      console.log('[AXIS TX] Final TX ID:', realTxId);
      setState(prev => ({ ...prev, status: 'success', txId: realTxId }));
      return realTxId;

    } catch (error: any) {
      const msg = error.message || 'Transaction failed';
      console.error('[AXIS TX] Error:', msg);
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
 * Resolve the real on-chain at1... transaction ID.
 * 
 * Strategy:
 * 1. If wallet returned at1... directly, verify on-chain and return
 * 2. Poll wallet transactionStatus(uuid) for status changes
 * 3. On "Completed", call getExecution(uuid) to extract at1... ID  
 * 4. In parallel, search on-chain for recent transactions to our program
 * 5. Return whichever finds the real ID first
 */
async function resolveTransactionId(
  rawId: string,
  programId: string,
  walletTxStatus: ((txId: string) => Promise<string>) | undefined,
  getExecution: ((txId: string) => Promise<string>) | undefined,
): Promise<string> {
  // If already an at1... ID, just confirm on-chain
  if (rawId.startsWith('at1')) {
    console.log('[AXIS TX] Got at1 ID directly, waiting for on-chain confirmation...');
    await waitForOnChainConfirmation(rawId);
    return rawId;
  }

  console.log('[AXIS TX] Got wallet tracking UUID:', rawId, '— resolving real TX ID...');
  
  // Record the block height at submission time for on-chain search
  let startHeight: number | null = null;
  try {
    const heightRes = await fetch(`${NODE_API}/latest/height`);
    if (heightRes.ok) {
      startHeight = parseInt(await heightRes.text());
      console.log('[AXIS TX] Start block height:', startHeight);
    }
  } catch { /* ignore */ }

  const start = Date.now();
  let walletConfirmed = false;

  while (Date.now() - start < MAX_POLL_TIME) {
    // === Strategy A: Poll wallet for status ===
    if (walletTxStatus) {
      try {
        const statusStr = await walletTxStatus(rawId);
        console.log('[AXIS TX] Wallet status:', statusStr);

        // Check if response contains at1... ID
        const embeddedId = extractAleoTxId(statusStr);
        if (embeddedId) {
          console.log('[AXIS TX] Found at1 ID in wallet status:', embeddedId);
          return embeddedId;
        }

        const status = statusStr?.toLowerCase?.() || '';

        if (status.includes('fail') || status.includes('reject')) {
          throw new Error(`Transaction ${status} on-chain`);
        }

        if (status.includes('complet') || status.includes('final') || status.includes('accept')) {
          walletConfirmed = true;
          console.log('[AXIS TX] Wallet says confirmed!');
          
          // Try getExecution to extract real ID
          if (getExecution) {
            try {
              const execData = await getExecution(rawId);
              console.log('[AXIS TX] getExecution returned:', typeof execData === 'string' ? execData.slice(0, 100) : execData);
              const realId = extractAleoTxId(typeof execData === 'string' ? execData : JSON.stringify(execData));
              if (realId) {
                console.log('[AXIS TX] Found at1 ID from getExecution:', realId);
                return realId;
              }
            } catch (e: any) {
              console.log('[AXIS TX] getExecution error:', e?.message);
            }
          }
        }
      } catch (error: any) {
        if (error.message?.includes('fail') || error.message?.includes('reject')) {
          throw error;
        }
        console.log('[AXIS TX] transactionStatus error (may not be supported):', error?.message);
      }
    }

    // === Strategy B: Search on-chain for the program transaction ===
    if (startHeight) {
      try {
        const onChainId = await searchOnChainForProgram(programId, startHeight);
        if (onChainId) {
          console.log('[AXIS TX] Found at1 ID on-chain:', onChainId);
          return onChainId;
        }
      } catch { /* ignore search errors */ }
    }

    // If wallet confirmed but we can't find at1... ID after extra attempts, stop
    if (walletConfirmed) {
      // Give it 2 more on-chain search attempts
      for (let i = 0; i < 3; i++) {
        await sleep(POLL_INTERVAL);
        if (startHeight) {
          const onChainId = await searchOnChainForProgram(programId, startHeight);
          if (onChainId) return onChainId;
        }
      }
      // Wallet confirmed but couldn't resolve at1... ID
      console.log('[AXIS TX] Wallet confirmed but could not resolve at1 ID');
      return rawId;
    }

    // If no wallet methods available, rely solely on on-chain search
    if (!walletTxStatus && !getExecution) {
      console.log('[AXIS TX] No wallet polling methods — using on-chain search only');
      // Wait for transaction to appear on-chain (the wallet has already broadcast it)
      // Give it at least 30 seconds of on-chain search
      const searchStart = Date.now();
      while (Date.now() - searchStart < 60000) {
        await sleep(POLL_INTERVAL);
        if (startHeight) {
          const onChainId = await searchOnChainForProgram(programId, startHeight);
          if (onChainId) return onChainId;
        }
      }
      // Couldn't find it on-chain either
      return rawId;
    }

    await sleep(POLL_INTERVAL);
  }

  // Timeout — return what we have
  console.log('[AXIS TX] Timeout — returning tracking ID');
  return rawId;
}

/**
 * Search the Aleo blockchain for recent transactions involving a specific program.
 * Scans blocks from startHeight to current height looking for transitions 
 * matching the target program ID.
 */
async function searchOnChainForProgram(
  programId: string,
  startHeight: number,
): Promise<string | null> {
  try {
    const heightRes = await fetch(`${NODE_API}/latest/height`);
    if (!heightRes.ok) return null;
    const currentHeight = parseInt(await heightRes.text());

    // Search from startHeight to current, max 20 blocks at a time to avoid too many requests
    const from = Math.max(startHeight - 2, 0); // include a couple blocks before
    const to = currentHeight;
    
    if (to - from > 100) return null; // Safety: don't scan too many blocks

    for (let h = to; h >= from; h--) {
      try {
        const blockRes = await fetch(`${NODE_API}/block/${h}`);
        if (!blockRes.ok) continue;
        
        const block = await blockRes.json();
        const txns = block?.transactions;
        if (!txns || !Array.isArray(txns) || txns.length === 0) continue;

        for (const confirmed of txns) {
          const tx = confirmed?.transaction;
          if (!tx || typeof tx !== 'object') continue;
          
          const execution = tx.execution;
          if (!execution || typeof execution !== 'object') continue;

          const transitions = execution.transitions;
          if (!transitions || !Array.isArray(transitions)) continue;

          for (const tr of transitions) {
            if (tr.program === programId) {
              const txId = tx.id;
              if (txId && typeof txId === 'string' && txId.startsWith('at1')) {
                return txId;
              }
            }
          }
        }
      } catch {
        // Individual block fetch failed, continue
      }
    }
  } catch {
    // API error
  }
  return null;
}

/**
 * Wait for a known at1... TX to appear on-chain.
 */
async function waitForOnChainConfirmation(txId: string): Promise<void> {
  const start = Date.now();

  while (Date.now() - start < MAX_POLL_TIME) {
    try {
      const res = await fetch(`${NODE_API}/transaction/${txId}`);
      if (res.ok) {
        console.log('[AXIS TX] Confirmed on-chain:', txId);
        return;
      }
    } catch {
      // Network error, keep trying
    }
    await sleep(POLL_INTERVAL);
  }
  // Don't throw — TX might still be propagating
}

/**
 * Extract an at1... transaction ID from any string
 */
function extractAleoTxId(data: any): string | null {
  if (!data) return null;
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  const match = str.match(/at1[a-z0-9]{58,62}/i);
  return match ? match[0] : null;
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
