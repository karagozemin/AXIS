# AXIS Protocol - Technical Architecture

> **Version:** 1.0.0 (Wave 1)  
> **Last Updated:** January 19, 2026  
> **Status:** Active Development

---

## Table of Contents

1. [System Overview](#system-overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Frontend Architecture](#frontend-architecture)
4. [Smart Contract Architecture](#smart-contract-architecture)
5. [Data Flow](#data-flow)
6. [Security Architecture](#security-architecture)
7. [Integration Points](#integration-points)
8. [Deployment Architecture](#deployment-architecture)

---

## System Overview

AXIS Protocol is a privacy-preserving, under-collateralized lending platform built on the Aleo blockchain. The system leverages zero-knowledge proofs to enable creditworthiness verification without exposing sensitive financial data.

### Core Principles

1. **Privacy by Default**: All user data and transactions are shielded
2. **Trust Minimization**: No centralized credit bureaus or oracles
3. **Capital Efficiency**: Under-collateralized loans based on on-chain behavior
4. **Composability**: Designed for integration with other Aleo DeFi protocols

### System Components

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            AXIS PROTOCOL                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐     │
│  │    Frontend     │    │  Leo Programs   │    │  Aleo Network   │     │
│  │   (Next.js)     │◄──►│  (Smart Cntrs)  │◄──►│   (Testnet)     │     │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘     │
│          │                      │                       │               │
│          │                      │                       │               │
│          ▼                      ▼                       ▼               │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐     │
│  │  Leo Wallet     │    │  axis_score     │    │   On-Chain      │     │
│  │   Adapter       │    │  axis_lending   │    │    Records      │     │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## High-Level Architecture

### Layer Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │  Landing    │  │  Dashboard  │  │   Borrow    │  │    Lend    │ │
│  │   Page      │  │   Overview  │  │    Flow     │  │    Flow    │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│                        APPLICATION LAYER                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │   Hooks     │  │  Contexts   │  │   Utils     │  │    Types   │ │
│  │useAleo...   │  │ LoanContext │  │  formatters │  │  CreditTier│ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│                        WALLET LAYER                                  │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                   Leo Wallet Adapter                             │ │
│  │  • Connect/Disconnect  • Sign Transactions  • Get Records       │ │
│  └─────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│                        BLOCKCHAIN LAYER                              │
│  ┌──────────────────────┐    ┌──────────────────────┐               │
│  │   axis_score_v1      │    │   axis_lending_v1    │               │
│  │   ───────────────    │    │   ────────────────   │               │
│  │   • calculate_score  │    │   • deposit          │               │
│  │   • get_tier         │    │   • borrow           │               │
│  │   • verify_score     │    │   • repay            │               │
│  └──────────────────────┘    └──────────────────────┘               │
├─────────────────────────────────────────────────────────────────────┤
│                        ALEO NETWORK                                  │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  Testnet → Mainnet  •  ZK Proofs  •  Shielded Records          │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.x | React framework with App Router |
| React | 18.x | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Styling |
| Framer Motion | 10.x | Animations |
| Leo Wallet Adapter | 0.2.x | Aleo wallet integration |

### Directory Structure

```
apps/web/src/
├── app/                          # Next.js App Router
│   ├── (landing)/                # Public routes (no auth)
│   │   └── page.tsx              # Landing page
│   ├── (dashboard)/              # Protected routes
│   │   ├── layout.tsx            # Dashboard layout + providers
│   │   ├── page.tsx              # Dashboard home
│   │   ├── borrow/page.tsx       # Access Liquidity
│   │   ├── lend/page.tsx         # Seed the Axis
│   │   ├── vaults/page.tsx       # Vault Overview
│   │   └── auditor/page.tsx      # Auditor Portal
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles + theme
│   └── providers.tsx             # App-wide providers
│
├── components/
│   ├── app/                      # Layout components
│   │   ├── Sidebar.tsx           # Navigation sidebar
│   │   ├── TopBar.tsx            # Header with notifications
│   │   └── WalletButton.tsx      # Wallet connect button
│   │
│   ├── borrow/                   # Borrowing components
│   │   ├── BorrowForm.tsx        # Main borrow form
│   │   ├── CreditScoreCard.tsx   # Score visualization
│   │   └── ZKProofAnimation.tsx  # Proof generation UI
│   │
│   ├── lend/                     # Lending components
│   │   ├── DepositForm.tsx       # Deposit form
│   │   └── LPPositions.tsx       # LP position list
│   │
│   ├── landing/                  # Landing page sections
│   │   ├── Hero.tsx              # Hero section
│   │   ├── Features.tsx          # Feature showcase
│   │   └── HowItWorks.tsx        # Process diagram
│   │
│   └── shared/                   # Reusable components
│       ├── GlassCard.tsx         # Glassmorphism card
│       ├── GradientText.tsx      # Gradient text effect
│       ├── TransactionModal.tsx  # TX status modal
│       └── index.ts              # Barrel exports
│
├── contexts/
│   └── LoanContext.tsx           # Loan/deposit state
│
├── hooks/
│   ├── index.ts                  # Hook exports
│   └── useAleoTransaction.ts     # Transaction execution
│
└── lib/
    ├── aleo/
    │   ├── types.ts              # Aleo-specific types
    │   └── programs.ts           # Program constants
    └── utils.ts                  # Utility functions
```

### Component Architecture

#### GlassCard Component

The foundation of our "Midnight Manhattan" design system:

```tsx
interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'gold' | 'vault';
  hover?: boolean;
}

// Variants:
// - default: Electric blue glow
// - gold: Gold/finance accent
// - vault: Special lending vault style
```

#### Transaction Hook

Central hook for all Aleo transactions:

```tsx
interface TransactionState {
  status: 'idle' | 'preparing' | 'proving' | 'confirming' | 'success' | 'error';
  txId: string | null;
  error: string | null;
  proofTime: number | null;
}

function useAleoTransaction() {
  // Real transaction execution via Leo Wallet
  const execute = async (program: string, fn: string, inputs: string[]) => {...}
  
  // Demo mode simulation (for hackathon)
  const executeDemo = async (program: string, fn: string) => {...}
  
  return { status, txId, error, proofTime, execute, executeDemo, reset };
}
```

### State Management

```
┌─────────────────────────────────────────────────────────┐
│                    STATE ARCHITECTURE                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────┐                                        │
│  │ WalletState │ ◄── Leo Wallet Adapter (external)      │
│  │ • connected │                                        │
│  │ • publicKey │                                        │
│  │ • wallet    │                                        │
│  └─────────────┘                                        │
│         │                                                │
│         ▼                                                │
│  ┌─────────────┐                                        │
│  │ LoanContext │ ◄── React Context (internal)           │
│  │ • loans     │                                        │
│  │ • deposits  │                                        │
│  │ • totals    │                                        │
│  └─────────────┘                                        │
│         │                                                │
│         ▼                                                │
│  ┌─────────────┐                                        │
│  │  Component  │ ◄── Local state (useState)             │
│  │   State     │                                        │
│  │ • formData  │                                        │
│  │ • UI state  │                                        │
│  └─────────────┘                                        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Smart Contract Architecture

### Program Overview

AXIS consists of two main Leo programs:

#### 1. axis_score_v1.aleo - Credit Scoring

```leo
program axis_score_v1.aleo {
    // Credit score record - private to owner
    record CreditScore {
        owner: address,
        score: u64,           // 300-850 range
        tier: u8,             // 1-5 tier
        last_updated: u64,    // Block height
    }

    // Calculate credit score from on-chain activity
    transition calculate_score(
        repayment_count: u64,
        default_count: u64,
        collateral_ratio_avg: u64
    ) -> CreditScore {...}

    // Get tier from score (public verification)
    transition get_tier(score: u64) -> u8 {...}

    // Verify score meets minimum threshold
    transition verify_minimum(score: CreditScore, min: u64) -> bool {...}
}
```

#### 2. axis_lending_v1.aleo - Lending Protocol

```leo
program axis_lending_v1.aleo {
    // Deposit record - LP receipt
    record Deposit {
        owner: address,
        amount: u64,          // Deposit amount in microcredits
        lock_until: u64,      // Block height for unlock
        pool_share: u64,      // Share of pool (basis points)
    }

    // Loan record - borrower's position
    record Loan {
        owner: address,
        principal: u64,       // Borrowed amount
        collateral: u64,      // Locked collateral
        interest_rate: u64,   // APR in basis points
        due_date: u64,        // Block height for repayment
    }

    // Deposit into lending pool
    transition deposit(
        amount: u64,
        lock_period: u64
    ) -> Deposit {...}

    // Borrow from pool
    transition borrow(
        amount: u64,
        collateral: u64,
        duration: u64
    ) -> Loan {...}

    // Repay loan
    transition repay(loan: Loan, amount: u64) -> Loan {...}

    // Withdraw deposit after lock period
    transition withdraw(deposit: Deposit) -> u64 {...}
}
```

### Record Structure

```
┌─────────────────────────────────────────────────────────┐
│                    RECORD TYPES                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  CreditScore Record (Private)                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ owner: aleo1...                                     │ │
│  │ score: 742                                          │ │
│  │ tier: 4                                             │ │
│  │ last_updated: 1234567                               │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  Deposit Record (Private)                               │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ owner: aleo1...                                     │ │
│  │ amount: 10000000000 (10,000 ALEO)                   │ │
│  │ lock_until: 1334567                                 │ │
│  │ pool_share: 50 (0.50%)                              │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  Loan Record (Private)                                  │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ owner: aleo1...                                     │ │
│  │ principal: 5000000000 (5,000 ALEO)                  │ │
│  │ collateral: 2500000000 (2,500 ALEO @ 50%)           │ │
│  │ interest_rate: 275 (2.75% APR)                      │ │
│  │ due_date: 1434567                                   │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Credit Scoring Algorithm

```
┌─────────────────────────────────────────────────────────────────┐
│                    CREDIT SCORE CALCULATION                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Base Score: 500                                               │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                    POSITIVE FACTORS                      │   │
│   ├─────────────────────────────────────────────────────────┤   │
│   │ • Successful Repayments: +10 per repayment (max +200)   │   │
│   │ • On-time Payments: +5 per on-time (max +100)           │   │
│   │ • High Collateral Ratio: +2 per 10% above min           │   │
│   │ • Account Age: +1 per 1000 blocks (max +50)             │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                    NEGATIVE FACTORS                      │   │
│   ├─────────────────────────────────────────────────────────┤   │
│   │ • Defaults: -50 per default                              │   │
│   │ • Late Payments: -10 per late payment                    │   │
│   │ • Liquidations: -30 per liquidation                      │   │
│   │ • Low Collateral History: -5 per instance                │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   Final Score = clamp(Base + Positives - Negatives, 300, 850)   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Borrow Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        BORROW FLOW                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. USER INITIATES                                              │
│     ┌─────────┐                                                 │
│     │  User   │ ──► Enters amount, duration                     │
│     └────┬────┘                                                 │
│          │                                                       │
│  2. CREDIT CHECK                                                │
│          ▼                                                       │
│     ┌─────────────────┐                                         │
│     │ axis_score_v1   │ ──► Returns tier & collateral ratio     │
│     │ .get_tier()     │                                         │
│     └────────┬────────┘                                         │
│              │                                                   │
│  3. LOAN CREATION                                               │
│              ▼                                                   │
│     ┌─────────────────┐                                         │
│     │ axis_lending_v1 │ ──► Creates Loan record                 │
│     │ .borrow()       │ ──► Locks collateral                    │
│     └────────┬────────┘ ──► Transfers principal to user         │
│              │                                                   │
│  4. CONFIRMATION                                                │
│              ▼                                                   │
│     ┌─────────────────┐                                         │
│     │  Transaction    │ ──► ZK proof verified                   │
│     │   Confirmed     │ ──► Record stored on-chain              │
│     └─────────────────┘                                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Deposit Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        DEPOSIT FLOW                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. LP INITIATES                                                │
│     ┌─────────┐                                                 │
│     │   LP    │ ──► Enters amount, lock period                  │
│     └────┬────┘                                                 │
│          │                                                       │
│  2. POOL CALCULATION                                            │
│          ▼                                                       │
│     ┌─────────────────┐                                         │
│     │  Calculate      │ ──► Pool share %                        │
│     │  Share & Yield  │ ──► Expected yield                      │
│     └────────┬────────┘                                         │
│              │                                                   │
│  3. DEPOSIT EXECUTION                                           │
│              ▼                                                   │
│     ┌─────────────────┐                                         │
│     │ axis_lending_v1 │ ──► Creates Deposit record (LP NFT)     │
│     │ .deposit()      │ ──► Transfers funds to pool             │
│     └────────┬────────┘                                         │
│              │                                                   │
│  4. RECEIPT                                                     │
│              ▼                                                   │
│     ┌─────────────────┐                                         │
│     │  Deposit Record │ ──► Serves as proof of deposit          │
│     │   (AXIS-LP)     │ ──► Required for withdrawal             │
│     └─────────────────┘                                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Transaction Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                   TRANSACTION LIFECYCLE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   IDLE ──► PREPARING ──► PROVING ──► CONFIRMING ──► SUCCESS     │
│     │          │            │            │             │         │
│     │          │            │            │             │         │
│     │     Build TX     Generate ZK    Broadcast    Finalized    │
│     │     structure      proof       to network                 │
│     │                                                            │
│     └──────────────────────── ERROR ◄────────────────────────────│
│                                 │                                │
│                          Retry / Cancel                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Security Architecture

### Threat Model

| Threat | Mitigation |
|--------|------------|
| Credit score manipulation | ZK proofs verify score calculation |
| Collateral under-reporting | On-chain verification of locked funds |
| Front-running | Shielded transactions hide details |
| Oracle manipulation | On-chain activity only (no external oracles) |
| Smart contract bugs | Formal verification + audit (Wave 7) |
| Wallet compromise | Standard wallet security practices |

### Privacy Guarantees

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRIVACY MODEL                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PUBLIC (On-chain, visible)                                     │
│  ─────────────────────────                                      │
│  • Program existence                                            │
│  • Transaction occurred (not details)                           │
│  • Total pool size (aggregate)                                  │
│                                                                  │
│  PRIVATE (ZK-protected)                                         │
│  ─────────────────────                                          │
│  • User credit scores                                           │
│  • Loan amounts & terms                                         │
│  • Deposit amounts & positions                                  │
│  • Collateral ratios                                            │
│  • Repayment history                                            │
│  • User addresses (shielded)                                    │
│                                                                  │
│  SELECTIVELY DISCLOSED (Auditor mode)                           │
│  ─────────────────────────────────────                          │
│  • Credit tier (not exact score)                                │
│  • Loan existence (not amounts)                                 │
│  • Pool participation (not positions)                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Access Control

```leo
// Only record owner can use their records
transition repay(loan: Loan, amount: u64) -> Loan {
    // Loan record ownership verified by Aleo runtime
    // No explicit check needed - built into record model
    ...
}

// Selective disclosure for auditors
transition disclose_tier(score: CreditScore, auditor: address) -> u8 {
    // Creates proof of tier without revealing exact score
    return score.tier;
}
```

---

## Integration Points

### Leo Wallet Adapter

```tsx
// Wallet connection
import { 
  useWallet,
  WalletProvider,
  WalletModalProvider 
} from '@demox-labs/aleo-wallet-adapter-react';

// Transaction execution
const { requestTransaction, publicKey, connected } = useWallet();

// Build and send transaction
const tx = Transaction.createTransaction(
  publicKey,
  WalletAdapterNetwork.TestnetBeta,
  'axis_lending_v1.aleo',
  'deposit',
  [amount, lockPeriod],
  1_000_000 // fee
);
await requestTransaction(tx);
```

### Aleo Network

```typescript
// Network endpoints
const TESTNET_API = 'https://api.explorer.provable.com/v1';
const TESTNET_BROADCAST = `${TESTNET_API}/testnet/transaction/broadcast`;

// Program deployment
snarkos developer deploy axis_lending_v1.aleo \
  --private-key $PRIVATE_KEY \
  --query $TESTNET_API \
  --broadcast $TESTNET_BROADCAST \
  --path ./build \
  --priority-fee 1000000
```

---

## Deployment Architecture

### Current (Wave 1 - Demo Mode)

```
┌─────────────────────────────────────────────────────────────────┐
│                    WAVE 1 DEPLOYMENT                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐                                           │
│  │     Vercel       │ ◄── Next.js Frontend                      │
│  │   (Frontend)     │     localhost:3000 (dev)                  │
│  └────────┬─────────┘                                           │
│           │                                                      │
│           ▼                                                      │
│  ┌──────────────────┐                                           │
│  │   Demo Mode      │ ◄── Simulated transactions                │
│  │   (Local State)  │     No real on-chain activity             │
│  └──────────────────┘                                           │
│                                                                  │
│  ┌──────────────────┐                                           │
│  │ Leo Programs     │ ◄── Compiled, ready for deployment        │
│  │ (Build artifacts)│     ./programs/*/build/                   │
│  └──────────────────┘                                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Target (Wave 2+ - Testnet)

```
┌─────────────────────────────────────────────────────────────────┐
│                    TESTNET DEPLOYMENT                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐                                           │
│  │     Vercel       │ ◄── Production frontend                   │
│  │   (Frontend)     │     axis-protocol.vercel.app              │
│  └────────┬─────────┘                                           │
│           │                                                      │
│           ▼                                                      │
│  ┌──────────────────┐      ┌──────────────────┐                 │
│  │   Leo Wallet     │ ──►  │  Aleo Testnet    │                 │
│  │   (Signing)      │      │   (Network)      │                 │
│  └──────────────────┘      └────────┬─────────┘                 │
│                                      │                           │
│                                      ▼                           │
│                            ┌──────────────────┐                 │
│                            │  axis_score_v1   │                 │
│                            │  axis_lending_v1 │                 │
│                            │  (Deployed)      │                 │
│                            └──────────────────┘                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Target (Wave 10 - Mainnet)

```
┌─────────────────────────────────────────────────────────────────┐
│                    MAINNET DEPLOYMENT                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐      ┌──────────────────┐                 │
│  │     CDN          │      │   Monitoring     │                 │
│  │   (Cloudflare)   │      │   (Datadog)      │                 │
│  └────────┬─────────┘      └──────────────────┘                 │
│           │                                                      │
│           ▼                                                      │
│  ┌──────────────────┐                                           │
│  │     Vercel       │ ◄── Production frontend                   │
│  │   (Frontend)     │     axis-protocol.io                      │
│  └────────┬─────────┘                                           │
│           │                                                      │
│           ▼                                                      │
│  ┌──────────────────┐      ┌──────────────────┐                 │
│  │   Leo Wallet     │ ──►  │  Aleo Mainnet    │                 │
│  │   (Signing)      │      │   (Network)      │                 │
│  └──────────────────┘      └────────┬─────────┘                 │
│                                      │                           │
│                            ┌─────────┴─────────┐                │
│                            ▼                   ▼                │
│                   ┌──────────────┐    ┌──────────────┐          │
│                   │ axis_score   │    │ axis_lending │          │
│                   │ (Audited)    │    │ (Audited)    │          │
│                   └──────────────┘    └──────────────┘          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Appendix

### A. Environment Variables

```bash
# apps/web/.env.local
NEXT_PUBLIC_ALEO_NETWORK=testnet          # testnet | mainnet
NEXT_PUBLIC_DEMO_MODE=true                # true | false
NEXT_PUBLIC_AXIS_SCORE_PROGRAM=axis_score_v1.aleo
NEXT_PUBLIC_AXIS_LENDING_PROGRAM=axis_lending_v1.aleo
```

### B. Program Constants

```typescript
// lib/aleo/programs.ts
export const PROGRAMS = {
  SCORE: 'axis_score_v1.aleo',
  LENDING: 'axis_lending_v1.aleo',
};

export const CREDIT_TIERS = {
  1: { min: 300, max: 499, collateral: 80, rate: 5.00 },
  2: { min: 500, max: 599, collateral: 70, rate: 4.25 },
  3: { min: 600, max: 699, collateral: 60, rate: 3.50 },
  4: { min: 700, max: 799, collateral: 50, rate: 2.75 },
  5: { min: 800, max: 850, collateral: 40, rate: 2.00 },
};
```

### C. Type Definitions

```typescript
// lib/aleo/types.ts
interface CreditTier {
  tier: number;
  label: string;
  minCollateral: number;
  maxBorrow: number;
  interestRate: number;
  color: string;
}

interface Loan {
  amount: number;
  collateral: number;
  duration: string;
  interestRate: number;
  txId: string;
  timestamp: number;
}

interface Deposit {
  amount: number;
  lockPeriod: number;
  expectedYield: number;
  txId: string;
  timestamp: number;
}
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-19 | AXIS Team | Initial architecture (Wave 1) |

---

<p align="center">
  <strong>AXIS Protocol - The Center of Private Finance</strong>
</p>
