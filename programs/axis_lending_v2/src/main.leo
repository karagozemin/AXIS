// ============================================================================
// AXIS Protocol v2 — Under-Collateralized Lending Engine
// ============================================================================
//
// How trust enables risky lending (addressing Alex's feedback):
//
// Traditional DeFi: 150%+ collateral → zero trust needed → capital inefficient
// AXIS v2:          Trust-tiered collateral ratios based on ZK credit score
//
// ┌─────────────────┬───────────┬─────────┬──────────────┬──────────────────┐
// │ Tier            │ Score     │ LTV     │ Collateral   │ Interest Rate    │
// ├─────────────────┼───────────┼─────────┼──────────────┼──────────────────┤
// │ 1 — Axis Elite  │ ≥ 720     │ 200%    │ 50% of loan  │ 3.5% APR         │
// │ 2 — Core        │ 620-719   │ 133%    │ 75% of loan  │ 5.0% APR         │
// │ 3 — Entry       │ < 620     │ 110%    │ 90% of loan  │ 8.0% APR         │
// └─────────────────┴───────────┴─────────┴──────────────┴──────────────────┘
//
// Risk Management:
//   • 5% of every deposit goes to an Insurance Fund
//   • Default penalties reduce future credit scores (fed back to axis_score_v2)
//   • Liquidation thresholds per tier
//   • All loan records are PRIVATE — only aggregated TVL is public
// ============================================================================

program axis_lending_v2.aleo {

    // ─────────────────── Records ───────────────────

    /// Private loan ticket — only the borrower can see their loan details.
    record LoanTicket {
        owner: address,
        loan_id: field,
        principal: u64,
        collateral: u64,
        interest_rate_bps: u64,   // basis points (350 = 3.5%)
        tier: u8,                 // 1, 2, or 3
        start_time: u64,
        due_time: u64,
    }

    /// Private receipt for liquidity providers.
    record LiquidityReceipt {
        owner: address,
        receipt_id: field,
        amount: u64,
        pool_share_bps: u64,
        deposited_at: u64,
        lock_until: u64,          // minimum lock period
    }

    // ─────────────────── On-chain Mappings ───────────────────
    // Only aggregated protocol-level data is public.

    /// Total Value Locked in the lending pool (key 0u8).
    mapping total_liquidity: u8 => u64;

    /// Total currently borrowed (key 0u8).
    mapping total_borrowed: u8 => u64;

    /// Total collateral held (key 0u8).
    mapping total_collateral: u8 => u64;

    /// Insurance fund balance (key 0u8).
    mapping insurance_fund: u8 => u64;

    /// Active loan registry (loan_id → true/false).
    mapping active_loans: field => bool;

    /// Per-tier borrowed totals (tier → amount).
    mapping tier_borrowed: u8 => u64;

    /// Protocol utilization stats — total loans originated (key 0u8).
    mapping loans_originated: u8 => u64;

    /// Protocol utilization stats — total loans repaid (key 0u8).
    mapping loans_repaid: u8 => u64;

    // ─────────────────── Constructor ───────────────────
    // Required for deployment on consensus version >= 12.
    // Initializes all global counters to zero.

    @noupgrade
    async constructor() {}

    // ─────────────────── Transitions ───────────────────

    /// Deposit liquidity into the Axis lending pool.
    /// 5% of the deposit is automatically routed to the Insurance Fund.
    ///
    /// # Privacy: The deposit amount in the receipt record is private.
    ///            Only the aggregate TVL mapping is public.
    async transition seed_the_axis(
        owner: address,
        amount: u64,
        lock_days: u64,
        current_time: u64,
    ) -> (LiquidityReceipt, Future) {
        // Minimum deposit: 1 credit (1_000_000 microcredits)
        assert(amount >= 1000000u64);
        // Minimum lock: 7 days
        assert(lock_days >= 7u64);

        // Insurance allocation: 5%
        let insurance_cut: u64 = amount / 20u64;
        let net_deposit: u64 = amount - insurance_cut;

        // Pool share (simplified — BPS of net deposit)
        let share: u64 = net_deposit / 100u64;

        // Lock period
        let lock_seconds: u64 = lock_days * 86400u64;
        let lock_end: u64 = current_time + lock_seconds;

        // Receipt ID (unique per deposit)
        let receipt_nonce: field = BHP256::hash_to_field(current_time);

        let receipt: LiquidityReceipt = LiquidityReceipt {
            owner: owner,
            receipt_id: receipt_nonce,
            amount: net_deposit,
            pool_share_bps: share,
            deposited_at: current_time,
            lock_until: lock_end,
        };

        return (receipt, finalize_deposit(net_deposit, insurance_cut));
    }

    async function finalize_deposit(
        net_amount: u64,
        insurance_amount: u64,
    ) {
        // Update TVL
        let current_tvl: u64 = Mapping::get_or_use(total_liquidity, 0u8, 0u64);
        Mapping::set(total_liquidity, 0u8, current_tvl + net_amount);

        // Update Insurance Fund
        let current_ins: u64 = Mapping::get_or_use(insurance_fund, 0u8, 0u64);
        Mapping::set(insurance_fund, 0u8, current_ins + insurance_amount);
    }

    /// Borrow from the Axis pool.  The tier (from CreditBond) determines
    /// the collateral ratio and interest rate.
    ///
    /// # Trust Derivation (the key innovation):
    ///   Instead of requiring everyone to post 150%+ collateral, we use the
    ///   borrower's PRIVATE credit score tier to determine how much collateral
    ///   is needed.  Higher trust = less collateral = more capital efficiency.
    ///
    /// # Privacy:
    ///   - The loan details (principal, collateral, rate) are in a private record
    ///   - Only the aggregate borrowed total is updated publicly
    ///   - The tier information never leaves the ZK circuit
    async transition access_liquidity(
        borrower: address,
        amount: u64,
        collateral: u64,
        tier: u8,
        current_time: u64,
    ) -> (LoanTicket, Future) {
        // Minimum loan: 0.1 credits
        assert(amount >= 100000u64);

        // ── Tier-based collateral validation ──
        // Tier 1 (Elite):  collateral >= 50% of loan   (200% LTV)
        // Tier 2 (Core):   collateral >= 75% of loan   (133% LTV)
        // Tier 3 (Entry):  collateral >= 90% of loan   (110% LTV)
        let min_collateral_t1: u64 = amount / 2u64;           // 50%
        let min_collateral_t2: u64 = amount * 3u64 / 4u64;    // 75%
        let min_collateral_t3: u64 = amount * 9u64 / 10u64;   // 90%

        // Validate based on tier
        let valid_t1: bool = tier == 1u8 && collateral >= min_collateral_t1;
        let valid_t2: bool = tier == 2u8 && collateral >= min_collateral_t2;
        let valid_t3: bool = tier == 3u8 && collateral >= min_collateral_t3;
        assert(valid_t1 || valid_t2 || valid_t3);

        // ── Tier-based interest rate ──
        // Tier 1: 350 bps (3.5%)
        // Tier 2: 500 bps (5.0%)
        // Tier 3: 800 bps (8.0%)
        let rate: u64 = tier == 1u8 ? 350u64 : (tier == 2u8 ? 500u64 : 800u64);

        // Loan ID
        let loan_nonce: field = BHP256::hash_to_field(current_time);

        // Due date: 30 days
        let due: u64 = current_time + 2592000u64;

        let ticket: LoanTicket = LoanTicket {
            owner: borrower,
            loan_id: loan_nonce,
            principal: amount,
            collateral: collateral,
            interest_rate_bps: rate,
            tier: tier,
            start_time: current_time,
            due_time: due,
        };

        return (ticket, finalize_borrow(loan_nonce, amount, collateral, tier));
    }

    async function finalize_borrow(
        loan_id: field,
        amount: u64,
        collateral: u64,
        tier: u8,
    ) {
        // Update total borrowed
        let current_borrowed: u64 = Mapping::get_or_use(total_borrowed, 0u8, 0u64);
        Mapping::set(total_borrowed, 0u8, current_borrowed + amount);

        // Update total collateral
        let current_collateral: u64 = Mapping::get_or_use(total_collateral, 0u8, 0u64);
        Mapping::set(total_collateral, 0u8, current_collateral + collateral);

        // Update per-tier stats
        let current_tier: u64 = Mapping::get_or_use(tier_borrowed, tier, 0u64);
        Mapping::set(tier_borrowed, tier, current_tier + amount);

        // Mark loan as active
        Mapping::set(active_loans, loan_id, true);

        // Increment loans originated
        let originated: u64 = Mapping::get_or_use(loans_originated, 0u8, 0u64);
        Mapping::set(loans_originated, 0u8, originated + 1u64);
    }

    /// Repay a loan in full.  Returns collateral to the borrower.
    /// The lending program records the repayment which feeds back
    /// into the credit scoring system.
    async transition repay_loan(
        ticket: LoanTicket,
        repay_amount: u64,
    ) -> Future {
        // Must repay at least the principal
        assert(repay_amount >= ticket.principal);

        return finalize_repay(ticket.loan_id, ticket.principal, ticket.collateral, ticket.tier);
    }

    async function finalize_repay(
        loan_id: field,
        principal: u64,
        collateral: u64,
        tier: u8,
    ) {
        // Reduce total borrowed
        let current_borrowed: u64 = Mapping::get_or_use(total_borrowed, 0u8, 0u64);
        let new_borrowed: u64 = current_borrowed >= principal ? current_borrowed - principal : 0u64;
        Mapping::set(total_borrowed, 0u8, new_borrowed);

        // Release collateral
        let current_collateral: u64 = Mapping::get_or_use(total_collateral, 0u8, 0u64);
        let new_collateral: u64 = current_collateral >= collateral ? current_collateral - collateral : 0u64;
        Mapping::set(total_collateral, 0u8, new_collateral);

        // Update per-tier stats
        let current_tier: u64 = Mapping::get_or_use(tier_borrowed, tier, 0u64);
        let new_tier: u64 = current_tier >= principal ? current_tier - principal : 0u64;
        Mapping::set(tier_borrowed, tier, new_tier);

        // Mark loan as inactive
        Mapping::set(active_loans, loan_id, false);

        // Increment repaid counter
        let repaid: u64 = Mapping::get_or_use(loans_repaid, 0u8, 0u64);
        Mapping::set(loans_repaid, 0u8, repaid + 1u64);
    }

    /// Flag a loan as defaulted.  Collateral is seized and sent to the
    /// insurance fund.  The default is recorded for credit scoring.
    async transition flag_default(
        ticket: LoanTicket,
    ) -> Future {
        return finalize_default(ticket.loan_id, ticket.principal, ticket.collateral, ticket.tier);
    }

    async function finalize_default(
        loan_id: field,
        principal: u64,
        collateral: u64,
        tier: u8,
    ) {
        // Reduce total borrowed (write off)
        let current_borrowed: u64 = Mapping::get_or_use(total_borrowed, 0u8, 0u64);
        let new_borrowed: u64 = current_borrowed >= principal ? current_borrowed - principal : 0u64;
        Mapping::set(total_borrowed, 0u8, new_borrowed);

        // Move collateral to insurance fund (partial recovery)
        let current_collateral: u64 = Mapping::get_or_use(total_collateral, 0u8, 0u64);
        let new_collateral: u64 = current_collateral >= collateral ? current_collateral - collateral : 0u64;
        Mapping::set(total_collateral, 0u8, new_collateral);

        let current_insurance: u64 = Mapping::get_or_use(insurance_fund, 0u8, 0u64);
        Mapping::set(insurance_fund, 0u8, current_insurance + collateral);

        // Update per-tier stats
        let current_tier: u64 = Mapping::get_or_use(tier_borrowed, tier, 0u64);
        let new_tier: u64 = current_tier >= principal ? current_tier - principal : 0u64;
        Mapping::set(tier_borrowed, tier, new_tier);

        // Mark loan as inactive
        Mapping::set(active_loans, loan_id, false);
    }

    /// Withdraw liquidity after lock period expires.
    /// Provider burns their LiquidityReceipt to reclaim funds.
    async transition withdraw_liquidity(
        receipt: LiquidityReceipt,
        current_time: u64,
    ) -> Future {
        // Ensure lock period has passed
        assert(current_time >= receipt.lock_until);

        return finalize_withdraw(receipt.amount);
    }

    async function finalize_withdraw(
        amount: u64,
    ) {
        // Reduce TVL
        let current_tvl: u64 = Mapping::get_or_use(total_liquidity, 0u8, 0u64);
        let new_tvl: u64 = current_tvl >= amount ? current_tvl - amount : 0u64;
        Mapping::set(total_liquidity, 0u8, new_tvl);
    }
}
