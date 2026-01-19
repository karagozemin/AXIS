'use client';

import { BorrowForm } from '@/components/borrow';
import { CreditScoreCard } from '@/components/dashboard';

export default function BorrowPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Access Liquidity</h1>
        <p className="text-gray-400 mt-1">
          Borrow against your private credit score with zero-knowledge proofs
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Borrow Form */}
        <div className="col-span-12 lg:col-span-8">
          <BorrowForm />
        </div>

        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Credit Score */}
          <CreditScoreCard />

          {/* Loan Terms Info */}
          <div className="bg-midnight-800/30 backdrop-blur-sm border border-midnight-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Loan Terms</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Base APR</span>
                <span className="text-white">8.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Max LTV</span>
                <span className="text-white">150% (under-collateralized)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Loan Duration</span>
                <span className="text-white">Up to 90 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Origination Fee</span>
                <span className="text-white">0.5%</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-midnight-700">
              <p className="text-xs text-gray-500">
                Terms vary based on your Credit Tier. Higher tiers unlock better rates and higher limits.
              </p>
            </div>
          </div>

          {/* How it Works */}
          <div className="bg-midnight-800/30 backdrop-blur-sm border border-midnight-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">How It Works</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-accent-violet/20 text-accent-violet flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <div>
                  <div className="text-white text-sm font-medium">Mint Credit Bond</div>
                  <div className="text-gray-500 text-xs">Private ZK proof of your financial data</div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-accent-violet/20 text-accent-violet flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <div>
                  <div className="text-white text-sm font-medium">Request Loan</div>
                  <div className="text-gray-500 text-xs">Choose amount based on your tier</div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-accent-violet/20 text-accent-violet flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <div>
                  <div className="text-white text-sm font-medium">Receive Funds</div>
                  <div className="text-gray-500 text-xs">Instant ALEO to your wallet</div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-accent-gold/20 text-accent-gold flex items-center justify-center text-xs font-bold">
                  4
                </div>
                <div>
                  <div className="text-white text-sm font-medium">Repay & Build Credit</div>
                  <div className="text-gray-500 text-xs">On-time repayment boosts your score</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
