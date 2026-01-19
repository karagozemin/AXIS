# AXIS

<div align="center">
  <h3>The Center of Private Finance.</h3>
  <p>Under-collateralized, privacy-preserving lending powered by Zero-Knowledge Proofs on Aleo.</p>
  
  <p>
    <strong>Wall Street meets Cyberpunk</strong> · NYC 🗽
  </p>
</div>

---

## 🎯 Overview

**AXIS** is a next-generation DeFi protocol that enables **under-collateralized lending** using **Zero-Knowledge Proofs**. Users can access liquidity by proving their creditworthiness through a **Proof of Credibility**—without revealing their underlying financial data.

### Key Features

- 🔐 **100% Private** — Your credit score and loan details are never revealed on-chain
- 📉 **<80% Collateral** — Borrow with less collateral than traditional DeFi
- 🏛️ **Institutional Ready** — Selective disclosure for compliance ("Private but Compliant")
- ⚡ **ZK-Powered** — Built on Aleo's zero-knowledge architecture

---

## 🏗️ Architecture

```
AXIS/
├── apps/
│   └── web/                    # Next.js 14 Frontend
│       ├── src/
│       │   ├── app/            # App Router pages
│       │   ├── components/     # React components
│       │   ├── hooks/          # Custom hooks (useAleoWorker)
│       │   ├── lib/            # Utilities & Aleo SDK
│       │   └── workers/        # Web Workers for ZK proofs
│       └── ...
│
├── programs/                   # Leo Smart Contracts
│   ├── axis_score/             # Proof of Credibility
│   │   └── src/main.leo
│   └── axis_lending/           # Under-collateralized Vaults
│       └── src/main.leo
│
└── packages/                   # Shared packages (future)
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 20.0.0
- **pnpm** >= 9.0.0
- **Leo CLI** (for program development)

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

### Building Leo Programs

```bash
# Build all programs
cd programs
chmod +x build-all.sh
./build-all.sh
```

---

## 📜 Smart Contracts

### axis_score.aleo — Proof of Credibility

Computes a privacy-preserving credit score (300-850) without revealing underlying financial data.

**Key Transitions:**
- `mint_credibility` — Generate a private CreditBond record
- `commit_score` — Publish a public hash commitment
- `verify_threshold` — Prove score meets minimum without revealing exact value
- `create_audit_token` — Selective disclosure for compliance

### axis_lending.aleo — Under-Collateralized Vaults

Enables privacy-preserving borrowing using Proof of Credibility.

**Key Transitions:**
- `seed_the_axis` — Deposit liquidity (LP)
- `access_liquidity` — Borrow against CreditBond
- `repay_loan` — Repay and retrieve collateral
- `flag_default` — Mark loan as defaulted (for auditor access)

---

## 🎨 Brand Guidelines

**Theme:** Midnight Manhattan  
**Palette:**
- Background: Deep Void Black (`#050505`)
- Primary: Electric Blue (`#00D4FF`)
- Accent: Solid Gold (`#FFD700`)
- Text: Sharp White

**Copywriting:**
- *Borrow* → "Access Liquidity"
- *Lend* → "Seed the Axis"
- *Credit Score* → "Proof of Credibility"

---

## 📅 Roadmap

### Phase 1: Foundation (Waves 1-2)
- [x] `axis_score.leo` — CreditBond record & mint_credibility transition
- [x] Landing page with "Digital NYC Skyline"

### Phase 2: Vaults (Waves 3-4)
- [ ] `axis_lending.leo` — Liquidity pools & private borrowing
- [ ] Vault UI with glassmorphism design

### Phase 3: Compliance (Waves 5-6)
- [ ] Auditor Interface — Selective disclosure for defaulted loans
- [ ] "Private but Compliant" feature set

### Phase 4: Interface (Waves 7-8)
- [ ] "Bloomberg Terminal" style dashboard
- [ ] Real-time "Dark Pool" visualization
- [ ] ZK proof generation progress indicators

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Smart Contracts** | Leo (Aleo) |
| **Frontend** | Next.js 14, TypeScript |
| **Styling** | Tailwind CSS, Framer Motion |
| **Blockchain** | Aleo Network |
| **SDK** | @provablehq/sdk |
| **Build** | Turborepo, pnpm |

---

## 🏆 WaveHack Criteria

| Criteria | Weight | How AXIS Wins |
|----------|--------|---------------|
| **Privacy** | 40% | Records for all user data; selective disclosure for compliance |
| **Technical** | 20% | Hybrid state model (mappings + records); ZK credit scoring |
| **Practicality** | 10% | Real-world use case: under-collateralized lending |

---

## 📄 License

MIT

---

<div align="center">
  <p>Built with 🖤 in NYC for Aleo WaveHack</p>
</div>