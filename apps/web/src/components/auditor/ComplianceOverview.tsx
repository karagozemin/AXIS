'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/shared';

interface StatItem {
  label: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
}

export function ComplianceOverview() {
  const stats: StatItem[] = [
    {
      label: 'Total Monitored Loans',
      value: '1,247',
      change: '+23 this week',
      changeType: 'neutral',
      icon: <DocumentIcon />,
    },
    {
      label: 'Active Audit Tokens',
      value: '34',
      change: '2.7% of loans',
      changeType: 'neutral',
      icon: <KeyIcon />,
    },
    {
      label: 'Defaulted Loans',
      value: '7',
      change: '0.56% default rate',
      changeType: 'negative',
      icon: <AlertIcon />,
    },
    {
      label: 'Privacy Score',
      value: '98.2%',
      change: 'Excellent',
      changeType: 'positive',
      icon: <ShieldIcon />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <GlassCard className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-lg bg-electric/10 text-electric">
                {stat.icon}
              </div>
              {stat.changeType && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  stat.changeType === 'positive' 
                    ? 'bg-green-500/10 text-green-400'
                    : stat.changeType === 'negative'
                    ? 'bg-red-500/10 text-red-400'
                    : 'bg-white/5 text-white/40'
                }`}>
                  {stat.change}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-white font-mono mb-1">
              {stat.value}
            </p>
            <p className="text-sm text-white/50">{stat.label}</p>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
}

function DocumentIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}
