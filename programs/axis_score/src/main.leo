// ============================================================================
// AXIS Protocol - Privacy-Preserving Credit Score
// ============================================================================

program axis_score_v1.aleo {

    record CreditBond {
        owner: address,
        score: u64,
        computed_at: u64,
        expires_at: u64,
    }

    mapping score_commitments: address => field;
    mapping bond_count: address => u64;

    transition mint_credibility(
        owner: address,
        tx_count: u64,
        balance_factor: u64,
        repayment_rate: u64,
        current_time: u64,
    ) -> CreditBond {
        let base: u64 = 500u64;
        let tx_bonus: u64 = tx_count / 10u64;
        let tx_points: u64 = tx_bonus < 100u64 ? tx_bonus : 100u64;
        let balance_points: u64 = balance_factor < 100u64 ? balance_factor : 100u64;
        let repay_bonus: u64 = repayment_rate * 3u64 / 2u64;
        let repay_points: u64 = repay_bonus < 150u64 ? repay_bonus : 150u64;
        let raw_score: u64 = base + tx_points + balance_points + repay_points;
        let final_score: u64 = raw_score < 850u64 ? raw_score : 850u64;
        let expiration: u64 = current_time + 2592000u64;

        return CreditBond {
            owner: owner,
            score: final_score,
            computed_at: current_time,
            expires_at: expiration,
        };
    }

    transition verify_threshold(
        bond: CreditBond,
        min_score: u64,
    ) -> bool {
        return bond.score >= min_score;
    }

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
    }
}
