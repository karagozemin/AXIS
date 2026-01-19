/**
 * AXIS Protocol - Aleo TypeScript Types
 * 
 * Type definitions for Aleo program interactions,
 * matching the Leo struct definitions.
 */

// ============================================================================
// axis_score.aleo Types
// ============================================================================

/**
 * Financial data used to compute credit score
 * Maps to: struct FinancialData in axis_score.leo
 */
export interface FinancialData {
  txCount: bigint;
  balanceFactor: bigint;
  repaymentRate: bigint;
  accountAgeDays: bigint;
  collateralHistory: bigint;
}

/**
 * Credit bond record (private)
 * Maps to: record CreditBond in axis_score.leo
 */
export interface CreditBond {
  owner: string;
  score: bigint;
  computedAt: bigint;
  expiresAt: bigint;
  nonce: string;
}

/**
 * Score verification result
 */
export interface ScoreVerification {
  meetsThreshold: boolean;
  isExpired: boolean;
}

// ============================================================================
// axis_lending.aleo Types
// ============================================================================

/**
 * Loan ticket record (private)
 * Maps to: record LoanTicket in axis_lending.leo
 */
export interface LoanTicket {
  owner: string;
  loanId: string;
  principal: bigint;
  collateral: bigint;
  interestRateBps: bigint;
  startTime: bigint;
  dueTime: bigint;
  scoreAtBorrow: bigint;
}

/**
 * Liquidity receipt record (private)
 * Maps to: record LiquidityReceipt in axis_lending.leo
 */
export interface LiquidityReceipt {
  owner: string;
  amount: bigint;
  poolShare: bigint;
  depositedAt: bigint;
}

/**
 * Loan terms computed from credit score
 * Maps to: struct LoanTerms in axis_lending.leo
 */
export interface LoanTerms {
  maxBorrow: bigint;
  interestRateBps: bigint;
  collateralRatio: bigint;
  creditTier: number;
}

/**
 * Repayment proof record
 * Maps to: record RepaymentProof in axis_lending.leo
 */
export interface RepaymentProof {
  owner: string;
  loanId: string;
  amountRepaid: bigint;
  repaidAt: bigint;
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
 * Credit tier definitions
 */
export const CREDIT_TIERS: CreditTierInfo[] = [
  {
    tier: 5,
    name: 'Exceptional',
    minScore: 800,
    maxScore: 850,
    color: '#FFD700', // Gold
    benefits: ['50% collateral ratio', '1.5% APR', 'Priority borrowing'],
  },
  {
    tier: 4,
    name: 'Excellent',
    minScore: 750,
    maxScore: 799,
    color: '#00D4FF', // Electric Blue
    benefits: ['60% collateral ratio', '2.5% APR', 'Extended terms'],
  },
  {
    tier: 3,
    name: 'Good',
    minScore: 700,
    maxScore: 749,
    color: '#4ADE80', // Green
    benefits: ['70% collateral ratio', '3.5% APR', 'Standard terms'],
  },
  {
    tier: 2,
    name: 'Fair',
    minScore: 675,
    maxScore: 699,
    color: '#FBBF24', // Yellow
    benefits: ['80% collateral ratio', '4.25% APR', 'Basic terms'],
  },
  {
    tier: 1,
    name: 'Basic',
    minScore: 650,
    maxScore: 674,
    color: '#F97316', // Orange
    benefits: ['80% collateral ratio', '5% APR', 'Short terms only'],
  },
];

/**
 * Get credit tier info from score
 */
export function getCreditTier(score: number): CreditTierInfo {
  for (const tier of CREDIT_TIERS) {
    if (score >= tier.minScore && score <= tier.maxScore) {
      return tier;
    }
  }
  return CREDIT_TIERS[CREDIT_TIERS.length - 1]; // Default to Basic
}
