'use client';

import { BorrowForm } from '@/components/borrow';
import { CreditScoreCard } from '@/components/dashboard';
import { BorrowPrivacyShield } from '@/components/shared';

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

          {/* Privacy Shield */}
          <BorrowPrivacyShield />

          {/* v2 Tier-Based Loan Terms */}
          <div className="bg-midnight-800/30 backdrop-blur-sm border border-midnight-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">v2 Tier-Based Terms</h3>
            <div className="space-y-3">
              {/* Tier 1 */}
              <div className="p-3 rounded-lg bg-electric/5 border border-electric/20">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-electric">Axis Elite</span>
                  <span className="text-xs text-electric bg-electric/10 px-2 py-0.5 rounded">≥ 720</span>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                  <div><span className="text-gray-500">Collateral</span><br/><span className="text-white">50%</span></div>
                  <div><span className="text-gray-500">LTV</span><br/><span className="text-white">200%</span></div>
                  <div><span className="text-gray-500">APR</span><br/><span className="text-white">3.5%</span></div>
                </div>
              </div>
              {/* Tier 2 */}
              <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-amber-400">Core</span>
                  <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">620-719</span>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                  <div><span className="text-gray-500">Collateral</span><br/><span className="text-white">75%</span></div>
                  <div><span className="text-gray-500">LTV</span><br/><span className="text-white">133%</span></div>
                  <div><span className="text-gray-500">APR</span><br/><span className="text-white">5.0%</span></div>
                </div>
              </div>
              {/* Tier 3 */}
              <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-red-400">Entry</span>
                  <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded">{'< 620'}</span>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                  <div><span className="text-gray-500">Collateral</span><br/><span className="text-white">90%</span></div>
                  <div><span className="text-gray-500">LTV</span><br/><span className="text-white">111%</span></div>
                  <div><span className="text-gray-500">APR</span><br/><span className="text-white">8.0%</span></div>
                </div>
              </div>
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
