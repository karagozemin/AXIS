'use client';

import { DepositForm, LPPositions } from '@/components/lend';
import { DepositPrivacyShield } from '@/components/shared';

export default function LendPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Seed the Axis</h1>
        <p className="text-gray-400 mt-1">
          Provide liquidity to the Dark Pool and earn yield on under-collateralized loans
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Deposit Form */}
        <div className="col-span-12 lg:col-span-7">
          <DepositForm />
        </div>

        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          {/* Pool Stats */}
          <div className="bg-midnight-800/30 backdrop-blur-sm border border-midnight-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Pool Statistics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Total Value Locked</span>
                  <span className="text-white font-semibold">$2,450,000</span>
                </div>
                <div className="h-2 bg-midnight-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent-gold to-amber-500"
                    style={{ width: '75%' }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-midnight-800/50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Current APY</div>
                  <div className="text-xl font-bold text-accent-gold">12.4%</div>
                </div>
                <div className="bg-midnight-800/50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Utilization</div>
                  <div className="text-xl font-bold text-white">68.5%</div>
                </div>
              </div>
              <div className="pt-3 border-t border-midnight-700 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total LPs</span>
                  <span className="text-white">324</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Lock Period</span>
                  <span className="text-white">87 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Yield Paid</span>
                  <span className="text-green-400">+$145,230</span>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Info */}
          <div className="bg-midnight-800/30 backdrop-blur-sm border border-midnight-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Risk Disclosure</h3>
            <div className="space-y-3 text-sm text-gray-400">
              <p>
                By providing liquidity, you are lending to borrowers with under-collateralized positions
                backed by their private credit scores.
              </p>
              <p>
                The protocol maintains a reserve fund to cover potential defaults, but capital is still at risk.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-xs">Historical default rate: 0.8%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent-gold" />
                <span className="text-xs">Insurance fund: 5% of every deposit</span>
              </div>
            </div>
          </div>

          {/* Privacy Shield */}
          <DepositPrivacyShield />
        </div>
      </div>

      {/* LP Positions */}
      <div className="mt-8">
        <LPPositions />
      </div>
    </div>
  );
}
