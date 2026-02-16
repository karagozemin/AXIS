<p align="center">
  <img src="./apps/web/public/axis-logo.png" alt="AXIS Protocol" width="200" />
</p>

<h1 align="center">AXIS Protocol</h1>

<p align="center">
  <strong>Privacy-Preserving Under-Collateralized Lending on Aleo</strong>
</p>

<p align="center">
  <em>"The Center of Private Finance"</em>
</p>

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#key-features">Features</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#wave-roadmap">Roadmap</a> •
  <a href="#team">Team</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Aleo-Testnet-00D4FF?style=for-the-badge" alt="Aleo Testnet" />
  <img src="https://img.shields.io/badge/Leo-3.4.0-FFD700?style=for-the-badge" alt="Leo 3.4.0" />
  <img src="https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge" alt="Next.js 14" />
  <img src="https://img.shields.io/badge/WaveHack-2026-8B5CF6?style=for-the-badge" alt="WaveHack 2026" />
  <img src="https://img.shields.io/badge/Deployed-Testnet%20Live-00FF88?style=for-the-badge" alt="Deployed" />
</p>

---

## 🚀 Testnet Deployment (Live)

| Program | Status | Explorer |
|---------|--------|----------|
| `axis_score_v2.aleo` | ✅ **DEPLOYED** | [View on Explorer](https://explorer.aleo.org/program/axis_score_v2.aleo) |
| `axis_lending_v2.aleo` | ✅ **DEPLOYED** | [View on Explorer](https://explorer.aleo.org/program/axis_lending_v2.aleo) |

**Deployer**: `aleo1fzpxupyv6cmnkacw85f533wtv33lazvy386vzjsatkjgm4gfqg9sk6a375`

---

## 🌟 Overview

**AXIS** (Aleo eXtended Identity Score) is a revolutionary DeFi protocol that enables **under-collateralized lending** through **privacy-preserving credit scoring** on the Aleo blockchain.

Traditional DeFi requires 150%+ collateralization, locking billions in capital. AXIS changes this by:

- 🔐 **Zero-Knowledge Credit Scores**: Prove creditworthiness without revealing financial history
- 💰 **Under-Collateralized Loans**: Borrow with as little as 40% collateral (Tier 5 users)
- 🏦 **Dark Pool Liquidity**: Private lending pools with competitive yields
- 🛡️ **Privacy-First Design**: All transactions are shielded by default

### The Problem

| Traditional DeFi | AXIS Protocol |
|-----------------|---------------|
| 150%+ collateral required | As low as 40% collateral |
| No credit history | Privacy-preserving credit scoring |
| Public transactions | Fully shielded transactions |
| Capital inefficient | Capital efficient lending |

---

## ✨ Key Features

### 🎯 Privacy-Preserving Credit Score

```
┌─────────────────────────────────────────────────────────────┐
│                    AXIS CREDIT SCORING                       │
├─────────────────────────────────────────────────────────────┤
│  On-Chain Activity  ──┐                                      │
│  Repayment History  ──┼──▶  ZK Circuit  ──▶  Private Score  │
│  Collateral Ratio   ──┘        │                 │          │
│                                ▼                 ▼          │
│                         Zero-Knowledge     Tier 1-5         │
│                            Proof          Attestation       │
└─────────────────────────────────────────────────────────────┘
```

**v2 5-Factor Weighted Scoring Model:**

| Factor | Weight | Description |
|--------|--------|-------------|
| Repayment History | 35% | On-time loan repayments |
| Position Duration | 25% | Long-term protocol engagement |
| Utilization Rate | 20% | Responsible credit usage |
| Protocol Loyalty | 10% | Interaction frequency |
| Collateral Diversity | 10% | Risk diversification |

**Credit Tiers & Benefits (v2):**

| Tier | Name | Score Range | Collateral | LTV | Interest Rate |
|------|------|-------------|------------|-----|---------------|
| 1 | Axis Elite | ≥ 720 | 50% | 200% | 3.5% APR |
| 2 | Core | 620-719 | 75% | 133% | 5.0% APR |
| 3 | Entry | < 620 | 90% | 110% | 8.0% APR |

> 📄 See [docs/CREDIT_SCORING.md](docs/CREDIT_SCORING.md) for the full credit scoring whitepaper.

### 🏊 Dark Pool Liquidity ("Seed the Axis")

Liquidity providers can:
- Deposit ALEO to earn yield (12.4% APY average)
- Choose lock periods (30/90/180/365 days) for bonus yields
- Receive AXIS-LP NFT receipts as proof of deposit
- Maintain complete privacy on their positions

### 🔒 Zero-Knowledge Proofs

Every transaction generates a ZK proof:
- Credit score calculations are private
- Loan terms are verifiable without revealing amounts
- Collateral positions are hidden from public view
- Repayment history builds score without exposure

### 🏛️ Institutional Ready ("Private but Compliant")

- Selective disclosure for regulatory compliance
- Auditor verification portal
- KYC/AML compatible architecture
- Institutional-grade security

---

## 🏗️ Architecture

```
AXIS/
├── apps/
│   └── web/                    # Next.js 14 Frontend
│       ├── src/
│       │   ├── app/            # App Router pages
│       │   │   ├── (landing)/  # Public landing page
│       │   │   └── (dashboard)/ # Protected dashboard
│       │   ├── components/     # React components
│       │   │   ├── app/        # Layout components
│       │   │   ├── borrow/     # Borrowing UI
│       │   │   ├── landing/    # Landing page sections
│       │   │   ├── lend/       # Lending/Deposit UI
│       │   │   └── shared/     # Reusable components
│       │   ├── contexts/       # React contexts (LoanContext)
│       │   ├── hooks/          # Custom hooks (useAleoTransaction)
│       │   └── lib/            # Utilities & Aleo SDK
│       └── public/             # Static assets
│
├── programs/
│   ├── axis_score_v2/          # Credit Score v2 (DEPLOYED)
│   │   └── src/main.leo        # 5-factor ZK credit scoring
│   ├── axis_lending_v2/        # Lending v2 (DEPLOYED)
│   │   └── src/main.leo        # Tier-based lending + insurance
│   ├── axis_score/             # v1 (deprecated)
│   └── axis_lending/           # v1 (deprecated)
│
├── docs/
│   ├── ARCHITECTURE.md         # Technical architecture
│   └── CREDIT_SCORING.md       # Credit scoring whitepaper
│
└── packages/                   # Shared packages (future)
```

> 📚 See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed technical documentation.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **pnpm** 8+
- **Leo CLI** 3.4.0+ (for smart contract development)
- **Leo Wallet** browser extension

### Installation

```bash
# Clone the repository
git clone https://github.com/karagozemin/AXIS.git
cd AXIS

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Environment Setup

Create `apps/web/.env.local`:

```bash
NEXT_PUBLIC_ALEO_NETWORK=testnet
NEXT_PUBLIC_DEMO_MODE=true
```

### Building Leo Programs

```bash
# Navigate to program directory
cd programs/axis_score

# Build the program
leo build

# Run tests (when available)
leo test

# Deploy to testnet (requires ALEO credits)
snarkos developer deploy axis_score_v1.aleo \
  --private-key <YOUR_PRIVATE_KEY> \
  --query https://api.explorer.provable.com/v1 \
  --broadcast https://api.explorer.provable.com/v1/testnet/transaction/broadcast \
  --path ./build \
  --priority-fee 1000000
```

---

## 🌊 Wave Roadmap

AXIS is being developed through the **Aleo WaveHack** program, a 10-wave hackathon spanning January to June 2026 with **$50,000 USDT** total allocation.

---

### 🌊 Wave 1: Foundation ✅
**January 20 - February 3, 2026** 

**Status: COMPLETE** ✅

#### Deliverables Completed:

**Infrastructure & Setup**
- [x] Monorepo architecture (pnpm workspaces + Turborepo)
- [x] Next.js 14 with App Router & TypeScript strict mode
- [x] Tailwind CSS with custom "Midnight Manhattan" theme
- [x] ESLint + Prettier configuration

**UI/UX Design System**
- [x] Glassmorphism component library (GlassCard, GradientText)
- [x] Custom color palette (void, electric, gold)
- [x] Framer Motion animations throughout
- [x] Responsive design for all viewports

**Landing Page**
- [x] Hero section with animated gradient mesh
- [x] Feature showcase with hover effects
- [x] "How it Works" flow diagram
- [x] Call-to-action buttons with proper routing

**Dashboard**
- [x] Sidebar navigation with active states
- [x] TopBar with gas price & notifications
- [x] Dashboard overview with stats cards
- [x] Credit score visualization (animated ring)
- [x] Active loans & deposits tracking

**Borrow Flow ("Access Liquidity")**
- [x] BorrowForm with amount slider
- [x] Collateral ratio calculator
- [x] Duration selection (7d/30d/90d)
- [x] Loan terms preview
- [x] Interest rate display based on tier

**Lend Flow ("Seed the Axis")**
- [x] DepositForm with amount input
- [x] Lock period selection (30/90/180/365 days)
- [x] LP receipt preview
- [x] Estimated yield calculation

**Vault Overview**
- [x] Pool statistics display
- [x] Active loans list
- [x] Deposits list
- [x] Activity history

**Wallet Integration**
- [x] Leo Wallet Adapter setup (@demox-labs/aleo-wallet-adapter-react)
- [x] Connect/disconnect functionality
- [x] Wallet state in sidebar
- [x] **Wallet required for all transactions**

**Transaction System**
- [x] TransactionModal with status tracking
- [x] ZK proof visualization animation
- [x] Demo mode for simulated transactions
- [x] "DEMO MODE" badge for mock transactions
- [x] Proof time display

**Leo Smart Contracts**
- [x] `axis_score_v1.aleo` - Credit scoring program (compiled)
- [x] `axis_lending_v1.aleo` - Lending program (compiled)
- [x] Basic transition functions defined

**Context & State Management**
- [x] LoanContext for tracking user activity
- [x] Notification system with activity dropdown
- [x] Cross-page state synchronization

---

### 🌊 Wave 2: Smart Contract Deployment ✅
**February 3 - February 17, 2026** 

**Status: COMPLETE** ✅

#### Deliverables Completed:

**Smart Contracts Redesigned & Deployed**
- [x] `axis_score_v2.aleo` — 5-factor weighted credit scoring engine (deployed to testnet)
- [x] `axis_lending_v2.aleo` — Tier-based under-collateralized lending (deployed to testnet)
- [x] Constructor support for consensus version 12
- [x] CreditBond & AuditToken private records
- [x] LoanTicket & LiquidityReceipt private records
- [x] On-chain mappings for protocol stats (TVL, insurance fund, tier distribution)
- [x] Insurance fund mechanism (5% of deposits)
- [x] Default penalty & collateral seizure logic

**Credit Scoring Whitepaper**
- [x] [CREDIT_SCORING.md](docs/CREDIT_SCORING.md) — Full whitepaper addressing reviewer feedback
- [x] 5-factor model: Repayment (35%), Duration (25%), Utilization (20%), Loyalty (10%), Diversity (10%)
- [x] Trust derivation via AuditToken (3-step ZK handshake)
- [x] Risk management framework (insurance fund, tiered collateral, default loop)
- [x] Mathematical specification with formal formulas
- [x] Security analysis (attack vectors, trust assumptions)

**Privacy UX Overhaul**
- [x] PrivacyShield components (Borrow, Deposit, Score variants)
- [x] ZK-HIDDEN / PUBLIC badges showing what data stays private vs on-chain
- [x] CreditScoreCard with 5-factor breakdown + ZK proof visualization
- [x] Tier-based BorrowForm (Elite/Core/Entry with collateral/LTV/APR)
- [x] Privacy shields integrated on borrow, lend, and vault pages

**Frontend v2 Hooks**
- [x] `useCreditScore()` — computeCredibility, verifyThreshold, createAuditToken, commitScore
- [x] `useLending()` — deposit with lockDays, borrow with tier, repay, withdraw
- [x] Updated to reference `axis_score_v2.aleo` and `axis_lending_v2.aleo`

**Technical Focus:**
- Leo program deployment with constructor (consensus v12)
- 5-factor ZK credit scoring circuit
- Tier-based collateral/LTV risk management

---

### 🌊 Wave 3: Score Integration & Real Transactions
**February 17 - March 3, 2026** 

**Status: IN PROGRESS** 🔄

**Goals:**
- [ ] Connect frontend to live testnet contracts (disable demo mode)
- [ ] Real ZK proof generation in browser via Aleo SDK
- [ ] Score decay mechanism (time-based bond expiry)
- [ ] Score improvement suggestions UI
- [ ] Historical score tracking from on-chain mappings
- [ ] Tier upgrade notifications
- [ ] On-chain activity analyzer for repayment_count / default_count
- [ ] Transaction history from chain explorer

**Technical Focus:**
- Aleo SDK wallet integration for real transactions
- Reading on-chain mapping state
- Browser-side ZK proof generation performance

---

### 🌊 Wave 4: Full Lending Protocol
**March 3 - March 17, 2026** 

**Status: PLANNED** ⏳

**Goals:**
- [ ] Complete loan lifecycle (borrow → repay → close)
- [ ] Collateral management system
- [ ] Interest rate calculations on-chain
- [ ] Liquidation mechanism
- [ ] Partial repayment support
- [ ] Loan extension feature
- [ ] Health factor monitoring
- [ ] Loan notifications

**Technical Focus:**
- State machine for loan lifecycle
- Automated liquidation triggers
- Interest accrual calculations

---

### 🌊 Wave 5: Liquidity Pools
**March 17 - March 31, 2026** 

**Status: PLANNED** ⏳

**Goals:**
- [ ] Multi-asset pool support
- [ ] Dynamic yield calculation
- [ ] LP token (AXIS-LP) implementation
- [ ] Pool utilization metrics
- [ ] Withdrawal queue system
- [ ] Emergency pause mechanism
- [ ] Pool analytics dashboard
- [ ] Yield farming incentives

**Technical Focus:**
- AMM-style pool mechanics
- Yield optimization algorithms
- Risk management systems

---

### 🌊 Wave 6: Auditor & Governance
**March 31 - April 14, 2026** 

**Status: PLANNED** ⏳

**Goals:**
- [ ] Auditor verification portal
- [ ] Selective disclosure system
- [ ] Governance token design
- [ ] Proposal creation system
- [ ] Voting mechanism
- [ ] Treasury management
- [ ] Protocol parameter adjustment
- [ ] Community dashboard

**Technical Focus:**
- DAO infrastructure on Aleo
- Privacy-preserving voting
- On-chain governance execution

---

### 🌊 Wave 7: Security & Optimization
**April 14 - April 28, 2026** 

**Status: PLANNED** ⏳

**Goals:**
- [ ] Security audit preparation
- [ ] Formal verification of contracts
- [ ] Gas optimization pass
- [ ] Stress testing suite
- [ ] Bug bounty program launch
- [ ] Documentation overhaul
- [ ] Performance benchmarks
- [ ] Edge case testing

**Technical Focus:**
- Leo program security patterns
- Circuit optimization
- Comprehensive testing

---

### 🌊 Wave 8: Integration & APIs
**April 28 - May 12, 2026** 

**Status: PLANNED** ⏳

**Goals:**
- [ ] REST API for integrations
- [ ] TypeScript SDK for developers
- [ ] Webhook system
- [ ] Price oracle integration
- [ ] Cross-protocol compatibility
- [ ] Mobile wallet support
- [ ] Developer documentation
- [ ] Integration examples

**Technical Focus:**
- API design & rate limiting
- Oracle integration patterns
- SDK architecture

---

### 🌊 Wave 9: Mainnet Preparation
**May 12 - May 26, 2026**

**Status: PLANNED** ⏳

**Goals:**
- [ ] Mainnet deployment scripts
- [ ] Migration strategy
- [ ] Final security review
- [ ] Performance optimization
- [ ] User onboarding flow
- [ ] Marketing materials
- [ ] Launch checklist completion
- [ ] Backup & recovery procedures

**Technical Focus:**
- Production deployment
- Monitoring & alerting
- Rollback procedures

---

### 🌊 Wave 10: Launch & Growth 🚀
**May 26 - June 9, 2026** 

**Status: PLANNED** ⏳

**Goals:**
- [ ] **Mainnet launch** 🚀
- [ ] Initial liquidity provision
- [ ] Community onboarding
- [ ] Partnership announcements
- [ ] Growth marketing campaign
- [ ] Analytics dashboard
- [ ] Post-launch support
- [ ] Roadmap for future development

**Technical Focus:**
- Production monitoring
- User support systems
- Growth infrastructure

---

## 📊 Progress Summary

| Wave | Status | Progress | Key Milestone |
|------|--------|----------|---------------|
| Wave 1 | ✅ Complete | 100% | UI + Wallet Integration |
| Wave 2 | 🔄 Next | 0% | Testnet Deployment |
| Wave 3 | ⏳ Planned | 0% | Credit Scoring Engine |
| Wave 4 | ⏳ Planned | 0% | Full Lending Protocol |
| Wave 5 | ⏳ Planned | 0% | Liquidity Pools |
| Wave 6 | ⏳ Planned | 0% | Governance |
| Wave 7 | ⏳ Planned | 0% | Security Audit |
| Wave 8 | ⏳ Planned | 0% | APIs & SDK |
| Wave 9 | ⏳ Planned | 0% | Mainnet Prep |
| Wave 10 | ⏳ Planned | 0% | Launch 🚀 |

**Total Allocation: $50,000 USDT**

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Blockchain** | Aleo (Leo 3.4.0) |
| **Frontend** | Next.js 14, React 18, TypeScript |
| **Styling** | Tailwind CSS, Framer Motion |
| **Wallet** | Leo Wallet Adapter |
| **State** | React Context + Custom Hooks |
| **Build** | pnpm, Turborepo |
| **Testing** | Vitest, Playwright (planned) |
| **Deployment** | Vercel (frontend), Aleo Testnet |

---

## 🔒 Security Considerations

AXIS takes security seriously:

- ✅ All smart contracts will undergo professional audit (Wave 7)
- ✅ Bug bounty program launching in Wave 7
- ✅ Formal verification planned for core contracts
- ✅ Multi-sig treasury management (Wave 6)
- ✅ Emergency pause mechanisms
- ✅ Rate limiting on all operations
- ✅ Input validation at all layers

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

```bash
# Fork the repo
git clone https://github.com/karagozemin/AXIS.git

# Create your feature branch
git checkout -b feature/amazing-feature

# Make your changes
# ...

# Commit your changes
git commit -m 'Add amazing feature'

# Push to the branch
git push origin feature/amazing-feature

# Open a Pull Request
```

### Development Guidelines

- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Keep commits atomic and well-described

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🔗 Links

- **Live Demo**: [https://axis-protocol.vercel.app]
- **Documentation**: [docs/](docs/)
- **Architecture**: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Aleo**: [aleo.org](https://aleo.org)
- **Leo Wallet**: [Leo Wallet](https://www.leo.app/)

---

## 👥 Team

Built by passionate developers for the Aleo ecosystem.

---

<p align="center">
  <strong>Built with 💜 for Aleo WaveHack 2026</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Privacy-First-8B5CF6?style=flat-square" alt="Privacy First" />
  <img src="https://img.shields.io/badge/Zero-Knowledge-00D4FF?style=flat-square" alt="Zero Knowledge" />
  <img src="https://img.shields.io/badge/Under--Collateralized-FFD700?style=flat-square" alt="Under-Collateralized" />
</p>

<p align="center">
  <em>"The Center of Private Finance"</em>
</p>
