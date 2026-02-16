# AXIS Protocol — Credit Scoring & Trust Derivation Model

> **Version 2.0** — February 2026  
> A technical specification for privacy-preserving credit scoring on Aleo

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [The Problem](#the-problem)
3. [Scoring Model](#scoring-model)
4. [Trust Derivation](#trust-derivation)
5. [Risk Management](#risk-management)
6. [Privacy Architecture](#privacy-architecture)
7. [Mathematical Specification](#mathematical-specification)
8. [Security Analysis](#security-analysis)

---

## 1. Executive Summary

AXIS Protocol introduces a **privacy-preserving credit scoring system** that enables **under-collateralized lending** in DeFi — something traditionally impossible without trust.

The core innovation: **Zero-Knowledge credit scores** that prove creditworthiness without revealing the underlying financial data. A borrower can demonstrate they qualify for a loan tier without disclosing their repayment history, account age, utilization patterns, or any other sensitive financial information.

### Key Question Addressed

> *"How is the score determined, what impacts the score, how do we derive trust from that score to enable risky lending?"*

**Answer**: The score is determined by a 5-factor weighted model computed entirely within a ZK circuit. Trust is derived through **AuditTokens** — cryptographic proofs that attest "this user meets threshold X" without revealing the actual score. This trust enables tiered lending where higher-trust borrowers post less collateral.

---

## 2. The Problem

### Current DeFi Lending

| Metric | Traditional DeFi | Target |
|--------|-----------------|--------|
| Collateral Ratio | 150-200% | 50-90% |
| Capital Efficiency | ~50% | ~100-200% |
| Privacy | None (all on-chain) | Full privacy |
| Credit History | Not used | Core mechanism |
| Trust Model | Trustless (over-collateralized) | Trust-derived (ZK proofs) |

**Over-collateralization** is the only trust mechanism in current DeFi. This is:
- **Capital inefficient**: Lock $150 to borrow $100
- **Exclusionary**: Blocks users without large capital reserves
- **Privacy-violating**: All positions are publicly visible

---

## 3. Scoring Model

### 3.1 Five-Factor Weighted Model

The AXIS credit score is computed from **five independent factors**, each contributing to a final score in the **300-850** range (matching the familiar FICO scale for intuitive understanding).

```
┌──────────────────────────┬────────┬──────────────────────────────────────────┐
│ Factor                   │ Weight │ Rationale                                │
├──────────────────────────┼────────┼──────────────────────────────────────────┤
│ 1. Repayment History     │  35%   │ Most predictive of future behavior.      │
│                          │        │ Percentage of loans repaid on time.      │
├──────────────────────────┼────────┼──────────────────────────────────────────┤
│ 2. Position Duration     │  25%   │ Long-term engagement signals stability.  │
│                          │        │ Months active on the protocol (capped).  │
├──────────────────────────┼────────┼──────────────────────────────────────────┤
│ 3. Utilization Rate      │  20%   │ Responsible use of available credit.     │
│                          │        │ Lower utilization = better score.        │
├──────────────────────────┼────────┼──────────────────────────────────────────┤
│ 4. Protocol Loyalty      │  10%   │ Frequency of protocol interactions.      │
│                          │        │ More interactions = more data = trust.   │
├──────────────────────────┼────────┼──────────────────────────────────────────┤
│ 5. Collateral Diversity  │  10%   │ Risk diversification signal.             │
│                          │        │ Multiple asset types = lower risk.       │
└──────────────────────────┴────────┴──────────────────────────────────────────┘
```

### 3.2 Why These Weights?

The weights are based on established credit scoring research (Fair Isaac, VantageScore) adapted for DeFi:

- **Repayment History (35%)**: In traditional finance, payment history is the #1 predictor of default. The same applies on-chain — a user who has repaid 10 loans on time is statistically unlikely to default on the 11th.

- **Position Duration (25%)**: Account age correlates with stability. New accounts are inherently riskier. In DeFi, this maps to how long a user has been actively participating in the protocol.

- **Utilization Rate (20%)**: Users who borrow 90% of their available credit are at higher risk of default than those who borrow 30%. We **invert** this factor so that lower utilization produces a higher score.

- **Protocol Loyalty (10%)**: Repeated, consistent interaction with the protocol builds behavioral data. More data points = higher confidence in the score.

- **Collateral Diversity (10%)**: Users who post collateral across multiple asset types are more resilient to single-asset price shocks.

### 3.3 Score Calculation

Each factor is normalized to a **0-100 scale**, then weighted:

$$S_{weighted} = \sum_{i=1}^{5} w_i \cdot f_i$$

Where:
- $w_1 = 35, w_2 = 25, w_3 = 20, w_4 = 10, w_5 = 10$ (sum = 100)
- $f_i \in [0, 100]$ for each factor
- $S_{weighted} \in [0, 10000]$

The weighted sum is then mapped to the 300-850 range:

$$Score = 300 + \frac{S_{weighted} \times 550}{10000}$$

This produces:
- **Minimum score**: 300 (all factors at 0)
- **Maximum score**: 850 (all factors at 100)
- **Median expected**: ~575 (50% on all factors)

### 3.4 Tier Assignment

| Tier | Name | Score Range | Characteristics |
|------|------|-------------|-----------------|
| 1 | **Axis Elite** | ≥ 720 | Proven track record, long history, responsible usage |
| 2 | **Core** | 620 – 719 | Good standing, building history |
| 3 | **Entry** | < 620 | New users, limited history, higher risk |

---

## 4. Trust Derivation

### 4.1 The Core Question

> *"How do we derive trust from that score to enable risky lending?"*

### 4.2 The AuditToken Mechanism

Trust is derived through a **three-step cryptographic handshake**:

```
Step 1: Score Computation (Private)
┌─────────────────────────────────────────────────┐
│  Borrower calls compute_credibility()            │
│  Inputs: 5 private factors → all hidden in ZK    │
│  Output: CreditBond record (PRIVATE to borrower) │
│  On-chain: Only hash(score) committed            │
└─────────────────────────────────────────────────┘
                      │
                      ▼
Step 2: Trust Proof Generation (Private)
┌─────────────────────────────────────────────────┐
│  Borrower calls create_audit_token()             │
│  Inputs: CreditBond + pool_address + threshold   │
│  Output: AuditToken with meets_threshold=T/F     │
│  The pool learns ONLY: "yes, qualifies" or "no"  │
│  The pool NEVER learns the actual score           │
└─────────────────────────────────────────────────┘
                      │
                      ▼
Step 3: Collateral-Reduced Borrowing (Private)
┌─────────────────────────────────────────────────┐
│  Borrower calls access_liquidity(tier)           │
│  Tier determines collateral requirement:          │
│    Tier 1: 50% collateral  (vs 150% standard)   │
│    Tier 2: 75% collateral                         │
│    Tier 3: 90% collateral                         │
│  Loan details in PRIVATE LoanTicket record       │
│  On-chain: Only aggregate borrowed total updated │
└─────────────────────────────────────────────────┘
```

### 4.3 Why This Creates Trust

1. **Verifiability**: The ZK proof guarantees the score was computed correctly. The lending pool doesn't need to trust the borrower's claim — the math is verified by the Aleo VM.

2. **Non-forgeable**: A borrower cannot fabricate a high score. The `compute_credibility` transition enforces the scoring formula within the ZK circuit.

3. **Selective disclosure**: The borrower reveals the minimum information needed (tier qualification) without exposing their financial profile.

4. **Economic alignment**: Higher-tier borrowers get better rates, creating a positive feedback loop — good behavior → better scores → cheaper capital.

---

## 5. Risk Management

### 5.1 Insurance Fund

Every deposit to the lending pool allocates **5% to an Insurance Fund**:

$$Insurance_{contribution} = \frac{Deposit}{20}$$

This fund absorbs losses from defaults, protecting liquidity providers.

### 5.2 Tiered Collateral Requirements

| Tier | Min Collateral | LTV Ratio | Annual Rate | Risk Level |
|------|---------------|-----------|-------------|------------|
| 1 — Elite | 50% of loan | 200% | 3.5% APR (350 bps) | Low |
| 2 — Core | 75% of loan | 133% | 5.0% APR (500 bps) | Medium |
| 3 — Entry | 90% of loan | 111% | 8.0% APR (800 bps) | High |

### 5.3 Default Penalty Loop

When a loan defaults:

```
flag_default() → Collateral seized → Insurance Fund ↑
                                    ↓
                    record_default() → default_count ↑ for borrower
                                    ↓
                    Next compute_credibility() → repayment_history ↓
                                    ↓
                    Lower score → Higher tier → More collateral required
```

This creates a **self-correcting system**: defaults make future borrowing more expensive, discouraging strategic defaults.

### 5.4 Protocol Health Metrics (Public)

While individual positions are private, the protocol publishes aggregate metrics for transparency:

| Mapping | Description | Purpose |
|---------|-------------|---------|
| `total_liquidity` | TVL in lending pool | Protocol health |
| `total_borrowed` | Outstanding loans | Utilization tracking |
| `total_collateral` | Held collateral | Solvency verification |
| `insurance_fund` | Insurance balance | Risk buffer visibility |
| `tier_borrowed` | Per-tier breakdown | Risk distribution |
| `loans_originated` | Total loans created | Growth metric |
| `loans_repaid` | Total loans repaid | Health metric |

---

## 6. Privacy Architecture

### 6.1 What's Private vs. Public

```
┌──────────────────────────────────────────────────────────┐
│                    PRIVATE (ZK)                           │
├──────────────────────────────────────────────────────────┤
│  ✓ Individual credit scores                              │
│  ✓ Scoring factor inputs (repayment %, duration, etc.)   │
│  ✓ Loan amounts and terms                                │
│  ✓ Collateral positions                                  │
│  ✓ Interest rates applied                                │
│  ✓ Deposit amounts                                       │
│  ✓ Borrower-lender relationships                         │
│  ✓ AuditToken threshold results                          │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                    PUBLIC (On-chain)                       │
├──────────────────────────────────────────────────────────┤
│  ✓ Aggregate TVL                                         │
│  ✓ Total borrowed (sum, not individual)                  │
│  ✓ Insurance fund balance                                │
│  ✓ Per-tier borrowed totals (not per-user)               │
│  ✓ Hash of credit score commitments                      │
│  ✓ Bond count per address                                │
│  ✓ Default/repayment counts per address                  │
└──────────────────────────────────────────────────────────┘
```

### 6.2 Aleo's Privacy Model

AXIS leverages Aleo's unique execution model:

- **Records**: Private state owned by users. Only the record owner can decrypt and use them. `CreditBond`, `LoanTicket`, `LiquidityReceipt`, and `AuditToken` are all records.

- **Mappings**: Public on-chain state. Used for aggregate protocol metrics only.

- **Transitions**: Execute inside a ZK circuit. All inputs are private by default. The prover (user) generates a proof that the computation was correct without revealing the inputs.

---

## 7. Mathematical Specification

### 7.1 Score Function

$$f: \mathbb{Z}_{101}^5 \rightarrow [300, 850]$$

$$f(rh, pd, ur, pi, ct) = 300 + \left\lfloor \frac{(35 \cdot rh + 25 \cdot pd + 20 \cdot (100 - ur) + 10 \cdot pi + 10 \cdot ct) \times 550}{10000} \right\rfloor$$

Where:
- $rh$ = repayment history $\in [0, 100]$
- $pd$ = position duration $\in [0, 100]$  
- $ur$ = utilization rate $\in [0, 100]$ (inverted: lower is better)
- $pi$ = protocol interactions $\in [0, 100]$
- $ct$ = collateral types $\in [0, 100]$

### 7.2 Tier Function

$$tier(s) = \begin{cases} 1 & \text{if } s \geq 720 \\ 2 & \text{if } 620 \leq s < 720 \\ 3 & \text{if } s < 620 \end{cases}$$

### 7.3 Collateral Requirement

$$C_{min}(tier, P) = \begin{cases} P / 2 & \text{if } tier = 1 \\ 3P / 4 & \text{if } tier = 2 \\ 9P / 10 & \text{if } tier = 3 \end{cases}$$

Where $P$ is the loan principal.

### 7.4 Interest Rate

$$r(tier) = \begin{cases} 350 \text{ bps} & \text{if } tier = 1 \\ 500 \text{ bps} & \text{if } tier = 2 \\ 800 \text{ bps} & \text{if } tier = 3 \end{cases}$$

### 7.5 Insurance Contribution

$$I(d) = \lfloor d / 20 \rfloor$$

Where $d$ is the deposit amount in microcredits.

---

## 8. Security Analysis

### 8.1 Attack Vectors & Mitigations

| Attack | Description | Mitigation |
|--------|-------------|------------|
| **Score Inflation** | Submitting false inputs to get a higher score | ZK circuit enforces input constraints; on-chain mappings (default_count, repayment_count) are authoritative |
| **Sybil Attack** | Creating multiple identities to reset credit | Bond expiration + on-chain default history persists per address |
| **Strategic Default** | Intentionally defaulting after receiving under-collateralized loan | Default penalty loop → lower future scores → higher collateral requirements |
| **Score Replay** | Reusing an old CreditBond | Expiration field (30 days); bonds consumed on use |
| **Collateral Manipulation** | Claiming wrong tier to get lower collateral | Tier validated in ZK circuit against actual score |

### 8.2 Trust Assumptions

1. **Aleo VM correctness**: We trust that Aleo's ZK execution model correctly enforces transition logic.
2. **Input oracle**: Currently, factor inputs are self-reported. Future versions will integrate on-chain oracles for repayment history and default counts.
3. **Time accuracy**: Block height used as time proxy; minor inaccuracies are acceptable.

### 8.3 Future Improvements (Wave 3+)

- **Cross-program calls**: `axis_lending_v2` will directly invoke `axis_score_v2.record_repayment()` for atomic credit updates
- **Decentralized oracles**: On-chain data feeds for factor inputs
- **Score portability**: Export AuditTokens for use across multiple DeFi protocols
- **Governance**: DAO-controlled weight adjustments via on-chain voting

---

*AXIS Protocol — Enabling trust in trustless systems through zero-knowledge proofs.*
