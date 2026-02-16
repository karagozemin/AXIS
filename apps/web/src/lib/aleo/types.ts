/**
 * AXIS Protocol - Aleo TypeScript Types
 * 
 * Type definitions for Aleo program interactions,
 * matching the Leo struct definitions.
 */

// ============================================================================
// axis_score_v2.aleo Types
// ============================================================================

/**
 * 5-Factor credit scoring inputs (all private in ZK circuit)
 * Maps to: compute_credibility inputs in axis_score_v2.aleo
 */
export interface CreditFactors {
  repaymentHistory: number;      // 0-100: % of loans repaid on time (35% weight)
  positionDuration: number;      // 0-100: months active, capped (25% weight)
  utilizationRate: number;       // 0-100: current utilization % (20% weight)
  protocolInteractions: number;  // 0-100: interaction frequency (10% weight)
  collateralDiversity: number;   // 0-100: diversity index (10% weight)
}

/**
 * Credit bond record (private)
 * Maps to: record CreditBond in axis_score_v2.aleo
 */
export interface CreditBond {
  owner: string;
  score: bigint;            // 300-850
  tier: number;             // 1 = Elite, 2 = Core, 3 = Entry
  computedAt: bigint;
  expiresAt: bigint;
  nonceHash: string;
}

/**
 * Audit token record (private) — proves score >= threshold to a verifier
 * Maps to: record AuditToken in axis_score_v2.aleo
 */
export interface AuditToken {
  owner: string;
  verifier: string;
  meetsThreshold: boolean;
  thresholdUsed: bigint;
  issuedAt: bigint;
}

// ============================================================================
// axis_lending.aleo Types
// ============================================================================

/**
 * Loan ticket record (private)
 * Maps to: record LoanTicket in axis_lending_v2.aleo
 */
export interface LoanTicket {
  owner: string;
  loanId: string;
  principal: bigint;
  collateral: bigint;
  interestRateBps: bigint;
  tier: number;              // 1 = Elite, 2 = Core, 3 = Entry
  startTime: bigint;
  dueTime: bigint;
}

/**
 * Liquidity receipt record (private)
 * Maps to: record LiquidityReceipt in axis_lending_v2.aleo
 */
export interface LiquidityReceipt {
  owner: string;
  receiptId: string;
  amount: bigint;
  poolShareBps: bigint;
  depositedAt: bigint;
  lockUntil: bigint;
}

/**
 * Loan terms computed from credit tier
 */
export interface LoanTerms {
  maxBorrow: bigint;
  interestRateBps: bigint;
  collateralRatio: bigint;
  tier: number;
}

// ============================================================================
// Pool State Types (from public mappings)
// ============================================================================

/**
 * Public pool state (from mappings)
 */
export interface PoolState {
  totalLiquidity: bigint;
  totalBorrowed: bigint;
  activeLoanCount: bigint;
  utilizationRate: number; // Calculated: borrowed / liquidity
}

// ============================================================================
// Transaction Types
// ============================================================================

/**
 * Transaction status
 */
export type TransactionStatus = 'pending' | 'confirmed' | 'failed';

/**
 * Transaction result
 */
export interface TransactionResult {
  transactionId: string;
  status: TransactionStatus;
  blockHeight?: number;
  error?: string;
}

/**
 * Proof generation progress
 */
export interface ProofProgress {
  stage: 'preparing' | 'generating' | 'finalizing';
  progress: number; // 0-100
  message: string;
}

// ============================================================================
// UI Types
// ============================================================================

/**
 * Credit tier display info
 */
export interface CreditTierInfo {
  tier: number;
  name: string;
  minScore: number;
  maxScore: number;
  color: string;
  benefits: string[];
}

/**
 * v2 Credit tier definitions — matches axis_lending_v2.aleo
 * Tier 1: Axis Elite (≥720) — 50% collateral, 200% LTV, 3.5% APR
 * Tier 2: Core (620-719)    — 75% collateral, 133% LTV, 5.0% APR
 * Tier 3: Entry (<620)      — 90% collateral, 110% LTV, 8.0% APR
 */
export const CREDIT_TIERS: CreditTierInfo[] = [
  {
    tier: 1,
    name: 'Axis Elite',
    minScore: 720,
    maxScore: 850,
    color: '#FFD700', // Gold
    benefits: ['50% collateral ratio', '200% LTV', '3.5% APR', 'Priority borrowing'],
  },
  {
    tier: 2,
    name: 'Core',
    minScore: 620,
    maxScore: 719,
    color: '#00D4FF', // Electric Blue
    benefits: ['75% collateral ratio', '133% LTV', '5.0% APR', 'Standard terms'],
  },
  {
    tier: 3,
    name: 'Entry',
    minScore: 300,
    maxScore: 619,
    color: '#F97316', // Orange
    benefits: ['90% collateral ratio', '110% LTV', '8.0% APR', 'Basic terms'],
  },
];

/**
 * Get credit tier info from score (v2 3-tier system, 300-850 range)
 */
export function getCreditTier(score: number): CreditTierInfo {
  for (const tier of CREDIT_TIERS) {
    if (score >= tier.minScore && score <= tier.maxScore) {
      return tier;
    }
  }
  return CREDIT_TIERS[CREDIT_TIERS.length - 1]; // Default to Entry
}
