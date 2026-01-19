// ============================================================================
// AXIS Protocol - Under-Collateralized Lending Vaults
// ============================================================================

program axis_lending_v1.aleo {

    record LoanTicket {
        owner: address,
        loan_id: field,
        principal: u64,
        collateral: u64,
        interest_rate_bps: u64,
        start_time: u64,
        due_time: u64,
    }

    record LiquidityReceipt {
        owner: address,
        amount: u64,
        pool_share_bps: u64,
        deposited_at: u64,
    }

    mapping total_liquidity: u8 => u64;
    mapping total_borrowed: u8 => u64;
    mapping active_loans: field => bool;

    transition seed_the_axis(
        owner: address,
        amount: u64,
        current_time: u64,
    ) -> LiquidityReceipt {
        assert(amount >= 1000000u64);
        
        let share: u64 = amount / 100u64;
        
        return LiquidityReceipt {
            owner: owner,
            amount: amount,
            pool_share_bps: share,
            deposited_at: current_time,
        };
    }

    async transition access_liquidity(
        borrower: address,
        amount: u64,
        collateral: u64,
        current_time: u64,
    ) -> (LoanTicket, Future) {
        assert(amount >= 100000u64);
        assert(collateral >= amount / 2u64);
        
        let loan_nonce: field = BHP256::hash_to_field(borrower);
        let due: u64 = current_time + 2592000u64;
        
        let ticket: LoanTicket = LoanTicket {
            owner: borrower,
            loan_id: loan_nonce,
            principal: amount,
            collateral: collateral,
            interest_rate_bps: 500u64,
            start_time: current_time,
            due_time: due,
        };
        
        return (ticket, finalize_borrow(loan_nonce, amount));
    }

    async function finalize_borrow(
        loan_id: field,
        amount: u64,
    ) {
        let current: u64 = Mapping::get_or_use(total_borrowed, 0u8, 0u64);
        Mapping::set(total_borrowed, 0u8, current + amount);
        Mapping::set(active_loans, loan_id, true);
    }

    async transition repay_loan(
        ticket: LoanTicket,
        repay_amount: u64,
    ) -> Future {
        assert(repay_amount >= ticket.principal);
        
        return finalize_repay(ticket.loan_id, ticket.principal);
    }

    async function finalize_repay(
        loan_id: field,
        principal: u64,
    ) {
        let current: u64 = Mapping::get_or_use(total_borrowed, 0u8, 0u64);
        let new_total: u64 = current >= principal ? current - principal : 0u64;
        Mapping::set(total_borrowed, 0u8, new_total);
        Mapping::set(active_loans, loan_id, false);
    }
}
