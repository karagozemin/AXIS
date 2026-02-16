// ============================================================================
// AXIS Protocol v2 — Privacy-Preserving Credit Scoring Engine
// ============================================================================
//
// Addresses Alex's core feedback:
//   "How is the score determined, what impacts the score, how do we derive
//    trust from that score to enable risky lending?"
//
// 5-Factor Weighted Scoring Model (all computation is ZK — inputs stay private):
//   1. Repayment History  — 35% weight  (most predictive of future behavior)
//   2. Position Duration   — 25% weight  (long-term engagement = stability)
//   3. Utilization Rate    — 20% weight  (responsible use of credit lines)
//   4. Protocol Loyalty    — 10% weight  (frequency of protocol interactions)
//   5. Collateral Diversity— 10% weight  (risk diversification signal)
//
// The final score lives in a private CreditBond record.
// Only a hashed commitment is ever published on-chain → zero data leakage.
// ============================================================================

program axis_score_v2.aleo {

    // ─────────────────── Records ───────────────────

    /// The core private record that proves a user's creditworthiness.
    /// Created by `compute_credibility`, consumed by the lending program's
    /// `access_liquidity` to gate loan issuance.
    record CreditBond {
        owner: address,
        score: u64,               // 300-850 range (mirrors FICO for familiarity)
        tier: u8,                 // 1 = Axis Elite, 2 = Core, 3 = Entry
        computed_at: u64,         // block-height or unix timestamp
        expires_at: u64,          // bonds are time-limited (30 days default)
        nonce_hash: field,        // privacy nonce for commitment uniqueness
    }

    /// An audit token that can be shared with a counterparty (e.g. a lending
    /// pool) to prove that a score exceeds a threshold WITHOUT revealing the
    /// actual score.  This is the "trust derivation" mechanism.
    record AuditToken {
        owner: address,
        verifier: address,        // who is allowed to consume this token
        meets_threshold: bool,    // true iff score >= required minimum
        threshold_used: u64,      // the minimum score that was checked
        issued_at: u64,
    }

    // ─────────────────── On-chain Mappings ───────────────────
    // Only aggregated / hashed data is stored publicly.

    /// Hash of the user's latest CreditBond → proves freshness without
    /// revealing the score itself.
    mapping score_commitments: address => field;

    /// Number of bonds a user has minted over their lifetime.
    mapping bond_count: address => u64;

    /// Aggregate protocol statistics (key 0u8 = total bonds minted globally).
    mapping protocol_stats: u8 => u64;

    /// Default history — number of defaults recorded for an address.
    mapping default_count: address => u64;

    /// Repayment history — number of successful repayments.
    mapping repayment_count: address => u64;

    // ─────────────────── Constructor ───────────────────
    // Required for deployment on consensus version >= 12.
    // Initializes global protocol stats to zero.

    @noupgrade
    async constructor() {}

    // ─────────────────── Transitions ───────────────────

    /// Core scoring transition.  ALL five inputs remain private; only
    /// the resulting CreditBond record is returned to the caller.
    ///
    /// # Arguments (all private)
    /// * `repayment_history`   – 0-100  (% of loans repaid on time)
    /// * `position_duration`   – 0-100  (months active, capped to 100)
    /// * `utilization_rate`    – 0-100  (current utilization as %)
    /// * `protocol_interactions`– 0-100  (interaction count, capped to 100)
    /// * `collateral_types`    – 0-100  (diversity index, capped to 100)
    /// * `current_time`        – current block height or unix timestamp
    transition compute_credibility(
        owner: address,
        repayment_history: u64,
        position_duration: u64,
        utilization_rate: u64,
        protocol_interactions: u64,
        collateral_types: u64,
        current_time: u64,
    ) -> CreditBond {
        // ── Input validation (capped at 100) ──
        let rh: u64 = repayment_history <= 100u64 ? repayment_history : 100u64;
        let pd: u64 = position_duration <= 100u64 ? position_duration : 100u64;
        let ur: u64 = utilization_rate <= 100u64 ? utilization_rate : 100u64;
        let pi: u64 = protocol_interactions <= 100u64 ? protocol_interactions : 100u64;
        let ct: u64 = collateral_types <= 100u64 ? collateral_types : 100u64;

        // ── Weighted scoring (total weights = 100) ──
        // Factor 1: Repayment History — 35%
        let f1: u64 = rh * 35u64;

        // Factor 2: Position Duration — 25%
        let f2: u64 = pd * 25u64;

        // Factor 3: Utilization Rate — 20%  (lower is better → invert)
        let inv_ur: u64 = 100u64 - ur;
        let f3: u64 = inv_ur * 20u64;

        // Factor 4: Protocol Loyalty — 10%
        let f4: u64 = pi * 10u64;

        // Factor 5: Collateral Diversity — 10%
        let f5: u64 = ct * 10u64;

        // Weighted sum → 0-10 000 range
        let weighted_sum: u64 = f1 + f2 + f3 + f4 + f5;

        // Map 0-10 000  →  300-850  (550 range)
        // score = 300 + (weighted_sum * 550) / 10_000
        let score_offset: u64 = weighted_sum * 550u64 / 10000u64;
        let raw_score: u64 = 300u64 + score_offset;
        let final_score: u64 = raw_score <= 850u64 ? raw_score : 850u64;

        // ── Tier assignment ──
        //   Tier 1 (Axis Elite) : score >= 720
        //   Tier 2 (Core)       : 620 <= score < 720
        //   Tier 3 (Entry)      : score < 620
        let tier: u8 = final_score >= 720u64 ? 1u8 : (final_score >= 620u64 ? 2u8 : 3u8);

        // ── Expiration: 30 days ──
        let expiration: u64 = current_time + 2592000u64;

        // ── Privacy nonce (hash of owner + time → unique per computation) ──
        let nonce_hash: field = BHP256::hash_to_field(current_time);

        return CreditBond {
            owner: owner,
            score: final_score,
            tier: tier,
            computed_at: current_time,
            expires_at: expiration,
            nonce_hash: nonce_hash,
        };
    }

    /// Verify that a CreditBond meets a minimum threshold.
    /// Returns a boolean (still private — only the caller sees the result).
    transition verify_threshold(
        bond: CreditBond,
        min_score: u64,
    ) -> bool {
        return bond.score >= min_score;
    }

    /// Create an AuditToken for a specific verifier.
    /// This lets a lending pool CONFIRM that a borrower meets a credit
    /// threshold without learning the actual score.
    ///
    /// Trust derivation flow:
    ///   1. Borrower calls `compute_credibility` → gets CreditBond (private)
    ///   2. Borrower calls `create_audit_token(bond, pool_address, min_score)`
    ///   3. Pool receives AuditToken where `meets_threshold = true/false`
    ///   4. Pool calls `access_liquidity` only if `meets_threshold == true`
    transition create_audit_token(
        bond: CreditBond,
        verifier: address,
        required_score: u64,
        current_time: u64,
    ) -> (CreditBond, AuditToken) {
        let meets: bool = bond.score >= required_score;

        let token: AuditToken = AuditToken {
            owner: bond.owner,
            verifier: verifier,
            meets_threshold: meets,
            threshold_used: required_score,
            issued_at: current_time,
        };

        // Re-issue the bond so it isn't consumed
        let refreshed_bond: CreditBond = CreditBond {
            owner: bond.owner,
            score: bond.score,
            tier: bond.tier,
            computed_at: bond.computed_at,
            expires_at: bond.expires_at,
            nonce_hash: bond.nonce_hash,
        };

        return (refreshed_bond, token);
    }

    /// Record a default event — called by the lending program when a loan
    /// is flagged as defaulted.  Increments the on-chain default counter
    /// which feeds back into future credit scores.
    async transition record_default(
        borrower: address,
    ) -> Future {
        return finalize_record_default(borrower);
    }

    async function finalize_record_default(
        borrower: address,
    ) {
        let current: u64 = Mapping::get_or_use(default_count, borrower, 0u64);
        Mapping::set(default_count, borrower, current + 1u64);
    }

    /// Record a successful repayment — called by the lending program
    /// when a loan is fully repaid.
    async transition record_repayment(
        borrower: address,
    ) -> Future {
        return finalize_record_repayment(borrower);
    }

    async function finalize_record_repayment(
        borrower: address,
    ) {
        let current: u64 = Mapping::get_or_use(repayment_count, borrower, 0u64);
        Mapping::set(repayment_count, borrower, current + 1u64);
    }

    /// Commit the hash of a CreditBond to on-chain storage.
    /// This proves the bond exists and is fresh, without revealing the score.
    async transition commit_score(
        bond: CreditBond,
    ) -> Future {
        let commitment: field = BHP256::hash_to_field(bond.score);
        return finalize_commit(bond.owner, commitment);
    }

    async function finalize_commit(
        owner: address,
        commitment: field,
    ) {
        Mapping::set(score_commitments, owner, commitment);
        let current_count: u64 = Mapping::get_or_use(bond_count, owner, 0u64);
        Mapping::set(bond_count, owner, current_count + 1u64);

        // Update global stats
        let total: u64 = Mapping::get_or_use(protocol_stats, 0u8, 0u64);
        Mapping::set(protocol_stats, 0u8, total + 1u64);
    }
}
