'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/shared';

interface AuditEvent {
  id: string;
  type: 'reveal' | 'flag' | 'verify' | 'export';
  description: string;
  loanId?: string;
  timestamp: string;
  auditor: string;
}

const mockAuditEvents: AuditEvent[] = [
  {
    id: '1',
    type: 'reveal',
    description: 'Borrower data revealed',
    loanId: 'at1qx7...m3k9',
    timestamp: '2 hours ago',
    auditor: 'aleo1aud...x7k3',
  },
  {
    id: '2',
    type: 'flag',
    description: 'Loan flagged as defaulted',
    loanId: 'at1zk4...p2w8',
    timestamp: '5 hours ago',
    auditor: 'System',
  },
  {
    id: '3',
    type: 'verify',
    description: 'Audit token verified',
    loanId: 'at1hd2...k9x3',
    timestamp: '1 day ago',
    auditor: 'aleo1aud...x7k3',
  },
  {
    id: '4',
    type: 'export',
    description: 'Compliance report exported',
    timestamp: '2 days ago',
    auditor: 'aleo1aud...x7k3',
  },
  {
    id: '5',
    type: 'flag',
    description: 'Loan flagged as defaulted',
    loanId: 'at1mn8...y5v2',
    timestamp: '3 days ago',
    auditor: 'System',
  },
  {
    id: '6',
    type: 'verify',
    description: 'Auditor credentials verified',
    timestamp: '1 week ago',
    auditor: 'Registry',
  },
];

const eventConfig = {
  reveal: {
    icon: <EyeIcon />,
    color: 'text-electric',
    bgColor: 'bg-electric/10',
  },
  flag: {
    icon: <AlertIcon />,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
  },
  verify: {
    icon: <CheckIcon />,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
  },
  export: {
    icon: <DocumentIcon />,
    color: 'text-gold',
    bgColor: 'bg-gold/10',
  },
};

export function AuditTrail() {
  return (
    <GlassCard className="p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Audit Trail</h3>
        <button className="text-xs text-electric hover:text-electric-400 transition-colors">
          View All
        </button>
      </div>

      <div className="space-y-1">
        {mockAuditEvents.map((event, index) => {
          const config = eventConfig[event.type];
          
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative"
            >
              {/* Timeline line */}
              {index < mockAuditEvents.length - 1 && (
                <div className="absolute left-[18px] top-10 w-0.5 h-full bg-glass-border" />
              )}

              <div className="flex gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors">
                {/* Icon */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${config.bgColor}`}>
                  <div className={config.color}>
                    {config.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{event.description}</p>
                  {event.loanId && (
                    <p className="text-xs font-mono text-white/40 mt-0.5">
                      {event.loanId}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-white/30">{event.timestamp}</span>
                    <span className="text-xs text-white/20">•</span>
                    <span className="text-xs text-white/30">{event.auditor}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ZK Privacy Notice */}
      <div className="mt-6 pt-4 border-t border-glass-border">
        <div className="flex items-center gap-2 text-xs text-white/30">
          <ShieldIcon className="w-4 h-4" />
          <span>All audit actions are cryptographically logged</span>
        </div>
      </div>
    </GlassCard>
  );
}

function EyeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}
