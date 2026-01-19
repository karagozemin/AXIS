'use client';

import { motion } from 'framer-motion';
import { GlassCard, GradientText } from '@/components/shared';
import { 
  DefaultedLoans, 
  ComplianceOverview, 
  AuditTrail,
  ViewKeyInput,
  AuditTokenGenerator
} from '@/components/auditor';

export default function AuditorPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Auditor <GradientText variant="gold">Interface</GradientText>
          </h1>
          <p className="text-white/50">
            Private but Compliant — Selective disclosure for authorized auditors only
          </p>
        </div>

        {/* Auditor Badge */}
        <GlassCard variant="gold" className="px-4 py-2 flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-gold animate-pulse" />
          <div>
            <p className="text-sm font-medium text-gold">Verified Auditor</p>
            <p className="text-xs text-white/40 font-mono">aleo1aud...x7k3</p>
          </div>
          <ShieldIcon className="w-5 h-5 text-gold/60" />
        </GlassCard>
      </motion.div>

      {/* Compliance Overview Stats */}
      <ComplianceOverview />

      {/* View Key and Token Generation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ViewKeyInput onVerify={(key) => console.log('View key verified:', key)} />
        <AuditTokenGenerator />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Defaulted Loans - 2 columns */}
        <div className="lg:col-span-2">
          <DefaultedLoans />
        </div>

        {/* Audit Trail - 1 column */}
        <div>
          <AuditTrail />
        </div>
      </div>

      {/* Privacy Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <GlassCard className="p-4 border-gold/20">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-gold/10">
              <LockIcon className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-white mb-1">
                Zero-Knowledge Compliance
              </h4>
              <p className="text-xs text-white/50 leading-relaxed">
                All disclosures are cryptographically verified. You can only view loan details 
                for accounts that have explicitly granted you an AuditToken. Non-defaulted loans 
                remain completely private. This interface is compliant with regulatory requirements 
                while preserving user privacy.
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}
