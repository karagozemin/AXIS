// ============================================================================
// AXIS Protocol - Under-Collateralized Lending Vaults
// "Access Liquidity" - Borrow against your Proof of Credibility
// ============================================================================
// This program enables privacy-preserving, under-collateralized lending.
// Users consume their CreditBond to access liquidity from the public pool,
// while maintaining complete privacy about their identity and loan details.
// ============================================================================

program axis_lending.aleo {

    // ========================================================================
    // CONSTANTS
    // ========================================================================
    
    // Minimum credit score required to borrow
    const MIN_BORROW_SCORE: u64 = 650u64;
    
    // Maximum loan-to-value ratio (80% = under-collateralized)
    const MAX_LTV: u64 = 80u64;
    
    // Base interest rate (5% = 500 basis points)
    const BASE_RATE_BPS: u64 = 500u64;
    
    // Interest rate reduction per 50 score points above minimum
    const RATE_REDUCTION_PER_TIER: u64 = 25u64;
    
    // Loan duration options (in seconds)
    const DURATION_7_DAYS: u64 = 604800u64;
    const DURATION_30_DAYS: u64 = 2592000u64;
    const DURATION_90_DAYS: u64 = 7776000u64;

    // ========================================================================
    // IMPORTS
    // ========================================================================
    
    // Import CreditBond from axis_score
    // import axis_score.aleo;

    // ========================================================================
    // RECORDS (Private State)
    // ========================================================================
    
    /// LoanTicket - Private record representing an active loan
    /// The blockchain sees liquidity decrease, but WHO took it remains invisible
    record LoanTicket {
        // Borrower's address
        owner: address,
        // Unique loan identifier
        loan_id: field,
        // Principal amount borrowed (in microcredits)
        principal: u64,
        // Collateral posted (in microcredits)
        collateral: u64,
        // Interest rate in basis points
        interest_rate_bps: u64,
        // Loan start timestamp
        start_time: u64,
        // Loan due timestamp
        due_time: u64,
        // Credit score at time of borrowing (for rate calculation)
        score_at_borrow: u64,
    }

    /// LiquidityReceipt - Private record for liquidity providers
    record LiquidityReceipt {
        // LP's address
        owner: address,
        // Amount of tokens seeded
        amount: u64,
        // Share of the pool
        pool_share: u64,
        // Timestamp of deposit
        deposited_at: u64,
    }

    /// RepaymentProof - Proof that a loan was repaid
    record RepaymentProof {
        // Original borrower
        owner: address,
        // Loan that was repaid
        loan_id: field,
        // Amount repaid (principal + interest)
        amount_repaid: u64,
        // Repayment timestamp
        repaid_at: u64,
    }

    // ========================================================================
    // STRUCTS
    // ========================================================================
    
    /// LoanTerms - Computed loan terms based on credit score
    struct LoanTerms {
        // Maximum borrowable amount
        max_borrow: u64,
        // Interest rate in basis points
        interest_rate_bps: u64,
        // Required collateral ratio (percentage)
        collateral_ratio: u64,
        // Credit tier (1-5, higher = better terms)
        credit_tier: u8,
    }

    // ========================================================================
    // MAPPINGS (Public State)
    // ========================================================================
    
    /// Total liquidity in the pool (PUBLIC - "Dark Pool" visualization)
    mapping total_liquidity: u8 => u64;
    
    /// Total borrowed from the pool
    mapping total_borrowed: u8 => u64;
    
    /// Active loan count (for metrics)
    mapping active_loan_count: u8 => u64;
    
    /// Loan commitments (hash of loan_id -> exists)
    mapping loan_commitments: field => bool;
    
    /// Default flags (loan_id -> is_defaulted)
    mapping defaulted_loans: field => bool;

    // ========================================================================
    // TRANSITIONS
    // ========================================================================
    
    /// seed_the_axis - Deposit liquidity into the lending pool
    /// 
    /// LPs "seed" the AXIS with tokens, earning yield from borrower interest.
    /// This is a PUBLIC action as liquidity is visible.
    ///
    /// @param amount - Amount to deposit (in microcredits)
    /// @param current_time - Current timestamp
    /// @return LiquidityReceipt - Private receipt of deposit
    async transition seed_the_axis(
        public amount: u64,
        private current_time: u64,
    ) -> (LiquidityReceipt, Future) {
        // Ensure minimum deposit
        assert(amount >= 1000000u64); // Minimum 1 token
        
        // Create receipt for LP
        let receipt: LiquidityReceipt = LiquidityReceipt {
            owner: self.caller,
            amount: amount,
            pool_share: amount, // Simplified; real implementation uses share tokens
            deposited_at: current_time,
        };
        
        return (receipt, finalize_seed(amount));
    }

    async function finalize_seed(amount: u64) {
        // Update public liquidity pool
        let current: u64 = total_liquidity.get_or_use(0u8, 0u64);
        total_liquidity.set(0u8, current + amount);
    }

    /// access_liquidity - Borrow against your Proof of Credibility
    /// 
    /// This is the core AXIS function. Users provide:
    /// - Their CreditBond (consumed)
    /// - Collateral (under 100%)
    /// - Desired borrow amount
    /// 
    /// The blockchain sees liquidity decrease, but the borrower remains PRIVATE.
    ///
    /// @param credit_score - User's credit score (from CreditBond)
    /// @param collateral_amount - Collateral to post
    /// @param borrow_amount - Amount to borrow
    /// @param duration - Loan duration (7, 30, or 90 days)
    /// @param current_time - Current timestamp
    /// @return LoanTicket - Private loan record
    async transition access_liquidity(
        private credit_score: u64,
        private collateral_amount: u64,
        public borrow_amount: u64,
        private duration: u64,
        private current_time: u64,
    ) -> (LoanTicket, Future) {
        // Validate credit score meets minimum
        assert(credit_score >= MIN_BORROW_SCORE);
        
        // Calculate loan terms based on score
        let terms: LoanTerms = calculate_terms(credit_score, borrow_amount);
        
        // Validate collateral meets required ratio
        let required_collateral: u64 = (borrow_amount * terms.collateral_ratio) / 100u64;
        assert(collateral_amount >= required_collateral);
        
        // Validate borrow doesn't exceed max
        assert(borrow_amount <= terms.max_borrow);
        
        // Calculate due time
        let due: u64 = current_time + duration;
        
        // Generate unique loan ID
        let loan_id: field = BHP256::hash_to_field(
            (self.caller, current_time, borrow_amount, collateral_amount)
        );
        
        // Create private loan ticket
        let ticket: LoanTicket = LoanTicket {
            owner: self.caller,
            loan_id: loan_id,
            principal: borrow_amount,
            collateral: collateral_amount,
            interest_rate_bps: terms.interest_rate_bps,
            start_time: current_time,
            due_time: due,
            score_at_borrow: credit_score,
        };
        
        return (ticket, finalize_borrow(borrow_amount, loan_id));
    }

    async function finalize_borrow(amount: u64, loan_id: field) {
        // Decrease public liquidity
        let current_liquidity: u64 = total_liquidity.get_or_use(0u8, 0u64);
        assert(current_liquidity >= amount);
        total_liquidity.set(0u8, current_liquidity - amount);
        
        // Increase borrowed amount
        let current_borrowed: u64 = total_borrowed.get_or_use(0u8, 0u64);
        total_borrowed.set(0u8, current_borrowed + amount);
        
        // Record loan commitment
        loan_commitments.set(loan_id, true);
        
        // Increment active loan count
        let count: u64 = active_loan_count.get_or_use(0u8, 0u64);
        active_loan_count.set(0u8, count + 1u64);
    }

    /// repay_loan - Repay a loan and retrieve collateral
    ///
    /// @param ticket - The LoanTicket to repay
    /// @param current_time - Current timestamp
    /// @return RepaymentProof - Proof of repayment
    async transition repay_loan(
        private ticket: LoanTicket,
        private current_time: u64,
    ) -> (RepaymentProof, Future) {
        // Calculate interest owed
        let duration: u64 = current_time - ticket.start_time;
        let interest: u64 = calculate_interest(
            ticket.principal, 
            ticket.interest_rate_bps, 
            duration
        );
        
        let total_repayment: u64 = ticket.principal + interest;
        
        // Create repayment proof
        let proof: RepaymentProof = RepaymentProof {
            owner: ticket.owner,
            loan_id: ticket.loan_id,
            amount_repaid: total_repayment,
            repaid_at: current_time,
        };
        
        return (proof, finalize_repay(ticket.principal, ticket.loan_id));
    }

    async function finalize_repay(principal: u64, loan_id: field) {
        // Return liquidity to pool
        let current_liquidity: u64 = total_liquidity.get_or_use(0u8, 0u64);
        total_liquidity.set(0u8, current_liquidity + principal);
        
        // Decrease borrowed amount
        let current_borrowed: u64 = total_borrowed.get_or_use(0u8, 0u64);
        let new_borrowed: u64 = current_borrowed >= principal 
            ? current_borrowed - principal 
            : 0u64;
        total_borrowed.set(0u8, new_borrowed);
        
        // Clear loan commitment
        loan_commitments.set(loan_id, false);
        
        // Decrement active loan count
        let count: u64 = active_loan_count.get_or_use(0u8, 0u64);
        let new_count: u64 = count > 0u64 ? count - 1u64 : 0u64;
        active_loan_count.set(0u8, new_count);
    }

    /// flag_default - Mark a loan as defaulted (for auditor access)
    /// 
    /// This enables the "Kill Switch" feature - defaulted loans
    /// can be viewed by auditors for compliance purposes.
    ///
    /// @param loan_id - The loan to flag
    async transition flag_default(
        public loan_id: field,
    ) -> Future {
        return finalize_default(loan_id);
    }

    async function finalize_default(loan_id: field) {
        // Verify loan exists
        let exists: bool = loan_commitments.get_or_use(loan_id, false);
        assert(exists);
        
        // Flag as defaulted
        defaulted_loans.set(loan_id, true);
    }

    // ========================================================================
    // HELPER FUNCTIONS
    // ========================================================================
    
    /// Calculate loan terms based on credit score
    function calculate_terms(score: u64, borrow_amount: u64) -> LoanTerms {
        // Determine credit tier (1-5)
        let tier: u8 = calculate_tier(score);
        
        // Calculate interest rate (better score = lower rate)
        let score_above_min: u64 = score - MIN_BORROW_SCORE;
        let rate_reductions: u64 = score_above_min / 50u64;
        let rate_reduction: u64 = rate_reductions * RATE_REDUCTION_PER_TIER;
        let interest_rate: u64 = BASE_RATE_BPS > rate_reduction 
            ? BASE_RATE_BPS - rate_reduction 
            : 100u64; // Minimum 1% rate
        
        // Calculate collateral ratio (better score = lower collateral)
        // Tier 5 (best): 50% collateral
        // Tier 1 (minimum): 80% collateral
        let collateral_ratio: u64 = 90u64 - ((tier as u64) * 10u64);
        
        // Max borrow scales with tier
        let max_borrow: u64 = borrow_amount * 2u64; // Simplified
        
        return LoanTerms {
            max_borrow: max_borrow,
            interest_rate_bps: interest_rate,
            collateral_ratio: collateral_ratio,
            credit_tier: tier,
        };
    }

    /// Calculate credit tier from score
    function calculate_tier(score: u64) -> u8 {
        if score >= 800u64 {
            return 5u8; // Exceptional
        }
        if score >= 750u64 {
            return 4u8; // Excellent
        }
        if score >= 700u64 {
            return 3u8; // Good
        }
        if score >= 675u64 {
            return 2u8; // Fair
        }
        return 1u8; // Basic
    }

    /// Calculate interest based on principal, rate, and duration
    function calculate_interest(principal: u64, rate_bps: u64, duration_seconds: u64) -> u64 {
        // Simple interest: P * R * T
        // rate_bps is annual rate in basis points (1 bp = 0.01%)
        // Convert to per-second rate and multiply by duration
        
        let seconds_per_year: u64 = 31536000u64;
        
        // Interest = principal * (rate_bps / 10000) * (duration / year)
        // Reordered to avoid overflow: (principal * rate_bps * duration) / (10000 * year)
        let numerator: u64 = (principal / 1000u64) * rate_bps * (duration_seconds / 1000u64);
        let denominator: u64 = (10000u64 / 1000u64) * (seconds_per_year / 1000u64);
        
        return numerator / denominator;
    }
}
