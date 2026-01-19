// ============================================================================
// AXIS Protocol - Privacy-Preserving Credit Score
// "Proof of Credibility" - The foundation of under-collateralized lending
// ============================================================================
// This program computes a credit score (300-850) without revealing the 
// underlying financial data. Users maintain full privacy while proving
// their creditworthiness to access liquidity.
// ============================================================================

program axis_score.aleo {

    // ========================================================================
    // CONSTANTS
    // ========================================================================
    
    const MAX_SCORE: u64 = 850u64;
    const MIN_SCORE: u64 = 300u64;
    const BASE_SCORE: u64 = 500u64;

    // ========================================================================
    // RECORDS (Private State)
    // ========================================================================
    
    /// CreditBond - A private record proving creditworthiness
    /// This is the "Proof of Credibility" that users hold privately
    /// and selectively disclose to access under-collateralized loans.
    record CreditBond {
        // Owner of this credit bond
        owner: address,
        // Computed credit score (300-850)
        score: u64,
        // Timestamp when score was computed
        computed_at: u64,
        // Expiration timestamp (scores expire after 30 days)
        expires_at: u64,
        // Unique nonce for commitment verification
        nonce: field,
    }

    /// AuditToken - Selective disclosure for compliance
    /// Only created when user opts into institutional borrowing
    record AuditToken {
        // The auditor who can view this
        auditor: address,
        // Owner of the loan
        borrower: address,
        // The loan ID this token is tied to
        loan_id: field,
        // Encrypted score data (viewable by auditor)
        score_commitment: field,
    }

    // ========================================================================
    // STRUCTS
    // ========================================================================
    
    /// FinancialData - Private inputs for score computation
    /// This data is NEVER revealed on-chain, only the resulting score
    struct FinancialData {
        // On-chain transaction history (count)
        tx_count: u64,
        // Average balance factor (0-100 scaled)
        balance_factor: u64,
        // Loan repayment rate (0-100 percentage)
        repayment_rate: u64,
        // Account age in days
        account_age_days: u64,
        // Historical collateral ratio (0-100 scaled)
        collateral_history: u64,
    }

    /// ScoreComponents - Breakdown of score calculation
    struct ScoreComponents {
        tx_activity: u64,
        balance_health: u64,
        repayment_history: u64,
        account_maturity: u64,
        collateral_track: u64,
    }

    // ========================================================================
    // MAPPINGS (Public State)
    // ========================================================================
    
    /// Public commitment of score (hash) - allows verification without exposure
    mapping score_commitments: address => field;
    
    /// Timestamp of last score update
    mapping last_updated: address => u64;
    
    /// Number of active CreditBonds per address (for rate limiting)
    mapping bond_count: address => u64;

    // ========================================================================
    // TRANSITIONS
    // ========================================================================
    
    /// mint_credibility - Compute a private credit score and mint a CreditBond
    /// 
    /// This is the core function of AXIS. Users provide their financial data
    /// privately, and receive a CreditBond record that proves their score
    /// without revealing the underlying data.
    ///
    /// @param data - Private financial metrics (never revealed)
    /// @param current_time - Current timestamp
    /// @return CreditBond - Private record with score
    transition mint_credibility(
        private data: FinancialData,
        private current_time: u64,
    ) -> CreditBond {
        // Calculate individual score components
        let components: ScoreComponents = calculate_components(data);
        
        // Compute weighted final score
        let raw_score: u64 = compute_weighted_score(components);
        
        // Clamp to valid range (300-850)
        let final_score: u64 = clamp_score(raw_score);
        
        // Bond expires in 30 days (30 * 24 * 60 * 60 = 2592000 seconds)
        let expiration: u64 = current_time + 2592000u64;
        
        // Generate unique nonce for this bond
        let bond_nonce: field = BHP256::hash_to_field(
            (self.caller, current_time, final_score, data.tx_count)
        );
        
        // Return the private CreditBond
        return CreditBond {
            owner: self.caller,
            score: final_score,
            computed_at: current_time,
            expires_at: expiration,
            nonce: bond_nonce,
        };
    }

    /// commit_score - Publish a hash commitment of your score
    /// 
    /// This allows public verification that a score exists without
    /// revealing the actual score value.
    ///
    /// @param bond - The CreditBond to commit
    /// @return Future for async finalization
    async transition commit_score(
        private bond: CreditBond,
    ) -> Future {
        // Compute public commitment (hash of score + nonce)
        let commitment: field = BHP256::hash_to_field(
            (bond.owner, bond.score, bond.nonce)
        );
        
        return finalize_commit(bond.owner, commitment, bond.computed_at);
    }

    async function finalize_commit(
        owner: address,
        commitment: field,
        timestamp: u64,
    ) {
        // Store public commitment
        score_commitments.set(owner, commitment);
        last_updated.set(owner, timestamp);
        
        // Increment bond count
        let current_count: u64 = bond_count.get_or_use(owner, 0u64);
        bond_count.set(owner, current_count + 1u64);
    }

    /// verify_threshold - Prove score meets minimum without revealing exact value
    /// 
    /// This is used by lending protocols to verify creditworthiness
    /// without learning the actual score.
    ///
    /// @param bond - The CreditBond to verify
    /// @param min_required - Minimum score threshold
    /// @param current_time - Current timestamp (to check expiration)
    /// @return bool - True if score >= min_required and not expired
    transition verify_threshold(
        private bond: CreditBond,
        public min_required: u64,
        public current_time: u64,
    ) -> bool {
        // Check bond hasn't expired
        let is_valid: bool = bond.expires_at > current_time;
        
        // Check score meets threshold
        let meets_threshold: bool = bond.score >= min_required;
        
        // Both conditions must be true
        return is_valid && meets_threshold;
    }

    /// create_audit_token - Generate selective disclosure for compliance
    /// 
    /// Users can optionally create an AuditToken that allows a specific
    /// auditor to view their score data. This enables "Private but Compliant"
    /// institutional lending.
    ///
    /// @param bond - The CreditBond to create audit access for
    /// @param auditor - Address of the authorized auditor
    /// @param loan_id - The loan this audit token is tied to
    /// @return AuditToken - Selective disclosure record
    transition create_audit_token(
        private bond: CreditBond,
        private auditor: address,
        private loan_id: field,
    ) -> AuditToken {
        // Create encrypted commitment for auditor
        let score_data: field = BHP256::hash_to_field(
            (bond.owner, bond.score, bond.computed_at, auditor)
        );
        
        return AuditToken {
            auditor: auditor,
            borrower: bond.owner,
            loan_id: loan_id,
            score_commitment: score_data,
        };
    }

    // ========================================================================
    // HELPER FUNCTIONS
    // ========================================================================
    
    /// Calculate individual score components from financial data
    function calculate_components(data: FinancialData) -> ScoreComponents {
        // Transaction activity score (max 100 points)
        // More on-chain activity = higher score
        let tx_score: u64 = data.tx_count < 100u64 
            ? data.tx_count 
            : 100u64;
        
        // Balance health score (max 100 points)
        // Higher average balance = higher score
        let balance: u64 = data.balance_factor < 100u64
            ? data.balance_factor
            : 100u64;
        
        // Repayment history score (max 200 points - HIGHEST WEIGHT)
        // Perfect repayment history is critical for under-collateralized lending
        let repayment: u64 = data.repayment_rate * 2u64;
        
        // Account maturity score (max 50 points)
        // Older accounts are more trustworthy (1 point per 30 days, max 50)
        let age_points: u64 = data.account_age_days / 30u64;
        let age_score: u64 = age_points < 50u64 ? age_points : 50u64;
        
        // Collateral track record (max 100 points)
        // History of maintaining healthy collateral ratios
        let collateral: u64 = data.collateral_history < 100u64
            ? data.collateral_history
            : 100u64;
        
        return ScoreComponents {
            tx_activity: tx_score,
            balance_health: balance,
            repayment_history: repayment,
            account_maturity: age_score,
            collateral_track: collateral,
        };
    }

    /// Compute weighted final score from components
    function compute_weighted_score(components: ScoreComponents) -> u64 {
        // Total possible: 100 + 100 + 200 + 50 + 100 = 550 points
        // Map to 300-850 range (550 point spread)
        let total: u64 = 
            components.tx_activity +
            components.balance_health +
            components.repayment_history +
            components.account_maturity +
            components.collateral_track;
        
        // BASE_SCORE (500) + earned points = final score
        // This naturally maps 0 -> 500, 550 -> 1050 (clamped to 850)
        return BASE_SCORE + total;
    }

    /// Clamp score to valid credit score range
    function clamp_score(score: u64) -> u64 {
        if score < MIN_SCORE {
            return MIN_SCORE;
        }
        if score > MAX_SCORE {
            return MAX_SCORE;
        }
        return score;
    }
}
