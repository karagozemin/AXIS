'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { GlassCard, GradientText } from '@/components/shared';

/**
 * Hero Section - "Digital NYC Skyline" Theme
 * 
 * Features:
 * - Animated Manhattan skyline silhouette in background
 * - Floating orbs with Electric Blue and Gold accents
 * - Terminal grid overlay for cyberpunk aesthetic
 * - ZK circuit animation hints
 */
export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-void">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-manhattan" />
      
      {/* Grid overlay - Terminal aesthetic */}
      <div className="absolute inset-0 bg-grid opacity-60" />
      
      {/* NYC Skyline Background */}
      <div className="absolute inset-x-0 bottom-0 h-80 pointer-events-none">
        <NYCSkyline />
      </div>

      {/* Floating orbs - Electric Blue */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(0, 212, 255, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.6, 0.4],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating orbs - Gold */}
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3],
          x: [0, -20, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Circuit pattern overlay */}
      <div className="absolute inset-0 circuit-pattern opacity-30" />

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-6 pt-32 pb-40">
        <div className="flex flex-col items-center text-center">
          
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="mb-8"
          >
            <img 
              src="/axis-logo.png" 
              alt="AXIS Protocol" 
              className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-[0_0_30px_rgba(0,212,255,0.5)]"
            />
          </motion.div>

          {/* "Built on Aleo" Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          >
            <GlassCard className="inline-flex items-center gap-3 px-5 py-2.5 mb-10">
              <span className="status-dot active" />
              <span className="text-sm text-white/80 font-medium tracking-wide">
                Powered by Zero-Knowledge Proofs
              </span>
              <span className="text-xs text-electric font-mono">ALEO</span>
            </GlassCard>
          </motion.div>

          {/* Main Title - AXIS */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
            className="mb-6"
          >
            <h1 className="text-8xl md:text-9xl font-bold tracking-tighter">
              <GradientText animate className="text-shadow-electric">
                AXIS
              </GradientText>
            </h1>
          </motion.div>

          {/* Slogan */}
          <motion.p
            className="text-2xl md:text-3xl text-white/90 font-light mb-8 tracking-wide"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          >
            The Center of Private Finance.
          </motion.p>

          {/* Value proposition */}
          <motion.p
            className="text-lg text-white/50 max-w-2xl mb-14 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
          >
            Under-collateralized lending powered by your{' '}
            <span className="text-electric font-medium">Proof of Credibility</span>.
            Access liquidity without exposing your financial history.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-wrap justify-center gap-5 mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
          >
            <Link href="/borrow" className="btn-primary glow-effect group">
              <span className="relative z-10 flex items-center gap-2">
                Access Liquidity
                <svg 
                  className="w-5 h-5 transition-transform group-hover:translate-x-1" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
            <Link href="https://github.com/karagozemin/AXIS" target="_blank" className="btn-secondary">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Read Documentation
              </span>
            </Link>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: 'easeOut' }}
          >
            <StatCard 
              value="100%" 
              label="Private" 
              sublabel="ZK-Verified"
              icon={<ShieldIcon />}
            />
            <StatCard 
              value="<80%" 
              label="Collateral Ratio" 
              sublabel="Under-Collateralized"
              icon={<VaultIcon />}
              variant="gold"
            />
            <StatCard 
              value="∞" 
              label="Credit Portability" 
              sublabel="Cross-Chain Ready"
              icon={<CircuitIcon />}
            />
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-void to-transparent pointer-events-none" />
    </section>
  );
}

/**
 * Stat Card Component
 */
interface StatCardProps {
  value: string;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  variant?: 'default' | 'gold';
}

function StatCard({ value, label, sublabel, icon, variant = 'default' }: StatCardProps) {
  return (
    <GlassCard 
      variant={variant === 'gold' ? 'gold' : 'default'} 
      className="p-6 text-center group"
    >
      <div className={`
        w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center
        ${variant === 'gold' 
          ? 'bg-gold/10 text-gold group-hover:bg-gold/20' 
          : 'bg-electric/10 text-electric group-hover:bg-electric/20'
        }
        transition-colors duration-300
      `}>
        {icon}
      </div>
      <div className={`
        text-4xl font-bold font-mono mb-2
        ${variant === 'gold' ? 'text-gold' : 'text-electric'}
      `}>
        {value}
      </div>
      <div className="text-white font-medium mb-1">{label}</div>
      <div className="text-white/40 text-sm">{sublabel}</div>
    </GlassCard>
  );
}

/**
 * NYC Skyline SVG - Animated Manhattan silhouette
 */
function NYCSkyline() {
  return (
    <svg
      viewBox="0 0 1920 300"
      className="w-full h-full opacity-20"
      preserveAspectRatio="xMidYMax slice"
    >
      <defs>
        <linearGradient id="skylineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#00D4FF" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="skylineGold" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {/* Building silhouettes - stylized Manhattan */}
      <g fill="url(#skylineGradient)">
        {/* Empire State style */}
        <motion.rect 
          x="100" y="80" width="40" height="220" rx="2"
          initial={{ height: 0, y: 300 }}
          animate={{ height: 220, y: 80 }}
          transition={{ duration: 1, delay: 0.2 }}
        />
        <motion.rect 
          x="110" y="40" width="20" height="40" rx="2"
          initial={{ height: 0, y: 80 }}
          animate={{ height: 40, y: 40 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        />
        <motion.rect 
          x="117" y="10" width="6" height="30" rx="1"
          initial={{ height: 0, y: 40 }}
          animate={{ height: 30, y: 10 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        />
        
        {/* More buildings... */}
        <motion.rect x="180" y="120" width="50" height="180" rx="2"
          initial={{ height: 0, y: 300 }}
          animate={{ height: 180, y: 120 }}
          transition={{ duration: 0.9, delay: 0.3 }}
        />
        <motion.rect x="260" y="160" width="35" height="140" rx="2"
          initial={{ height: 0, y: 300 }}
          animate={{ height: 140, y: 160 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        />
        <motion.rect x="320" y="100" width="60" height="200" rx="2"
          initial={{ height: 0, y: 300 }}
          animate={{ height: 200, y: 100 }}
          transition={{ duration: 1, delay: 0.2 }}
        />
        <motion.rect x="400" y="140" width="45" height="160" rx="2"
          initial={{ height: 0, y: 300 }}
          animate={{ height: 160, y: 140 }}
          transition={{ duration: 0.85, delay: 0.35 }}
        />
        
        {/* Freedom Tower style */}
        <motion.rect x="500" y="60" width="55" height="240" rx="2"
          initial={{ height: 0, y: 300 }}
          animate={{ height: 240, y: 60 }}
          transition={{ duration: 1.1, delay: 0.1 }}
        />
        <motion.polygon 
          points="527.5,0 510,60 545,60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        />
        
        {/* More NYC buildings */}
        <motion.rect x="580" y="130" width="40" height="170" rx="2"
          initial={{ height: 0, y: 300 }}
          animate={{ height: 170, y: 130 }}
          transition={{ duration: 0.9, delay: 0.25 }}
        />
        <motion.rect x="650" y="90" width="50" height="210" rx="2"
          initial={{ height: 0, y: 300 }}
          animate={{ height: 210, y: 90 }}
          transition={{ duration: 1, delay: 0.15 }}
        />
        <motion.rect x="720" y="150" width="35" height="150" rx="2"
          initial={{ height: 0, y: 300 }}
          animate={{ height: 150, y: 150 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        />
        <motion.rect x="780" y="110" width="55" height="190" rx="2"
          initial={{ height: 0, y: 300 }}
          animate={{ height: 190, y: 110 }}
          transition={{ duration: 0.95, delay: 0.2 }}
        />
        
        {/* Chrysler style */}
        <motion.rect x="860" y="70" width="45" height="230" rx="2"
          initial={{ height: 0, y: 300 }}
          animate={{ height: 230, y: 70 }}
          transition={{ duration: 1.05, delay: 0.15 }}
        />
        <motion.rect x="872" y="50" width="21" height="20" rx="8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        />
        
        {/* Continue pattern */}
        <motion.rect x="940" y="140" width="40" height="160" rx="2"
          initial={{ height: 0, y: 300 }}
          animate={{ height: 160, y: 140 }}
          transition={{ duration: 0.85, delay: 0.3 }}
        />
        <motion.rect x="1010" y="100" width="60" height="200" rx="2"
          initial={{ height: 0, y: 300 }}
          animate={{ height: 200, y: 100 }}
          transition={{ duration: 1, delay: 0.2 }}
        />
        <motion.rect x="1100" y="130" width="45" height="170" rx="2"
          initial={{ height: 0, y: 300 }}
          animate={{ height: 170, y: 130 }}
          transition={{ duration: 0.9, delay: 0.25 }}
        />
        <motion.rect x="1170" y="80" width="50" height="220" rx="2"
          initial={{ height: 0, y: 300 }}
          animate={{ height: 220, y: 80 }}
          transition={{ duration: 1, delay: 0.15 }}
        />
        <motion.rect x="1250" y="150" width="35" height="150" rx="2"
          initial={{ height: 0, y: 300 }}
          animate={{ height: 150, y: 150 }}
          transition={{ duration: 0.8, delay: 0.35 }}
        />
        <motion.rect x="1310" y="110" width="55" height="190" rx="2"
          initial={{ height: 0, y: 300 }}
          animate={{ height: 190, y: 110 }}
          transition={{ duration: 0.95, delay: 0.2 }}
        />
        <motion.rect x="1390" y="90" width="45" height="210" rx="2"
          initial={{ height: 0, y: 300 }}
          animate={{ height: 210, y: 90 }}
          transition={{ duration: 1, delay: 0.15 }}
        />
        <motion.rect x="1460" y="140" width="40" height="160" rx="2"
          initial={{ height: 0, y: 300 }}
          animate={{ height: 160, y: 140 }}
          transition={{ duration: 0.85, delay: 0.3 }}
        />
        <motion.rect x="1530" y="70" width="55" height="230" rx="2"
          initial={{ height: 0, y: 300 }}
          animate={{ height: 230, y: 70 }}
          transition={{ duration: 1.05, delay: 0.1 }}
        />
        <motion.rect x="1610" y="120" width="50" height="180" rx="2"
          initial={{ height: 0, y: 300 }}
          animate={{ height: 180, y: 120 }}
          transition={{ duration: 0.9, delay: 0.25 }}
        />
        <motion.rect x="1690" y="100" width="45" height="200" rx="2"
          initial={{ height: 0, y: 300 }}
          animate={{ height: 200, y: 100 }}
          transition={{ duration: 0.95, delay: 0.2 }}
        />
        <motion.rect x="1760" y="130" width="60" height="170" rx="2"
          initial={{ height: 0, y: 300 }}
          animate={{ height: 170, y: 130 }}
          transition={{ duration: 0.9, delay: 0.25 }}
        />
        <motion.rect x="1850" y="90" width="40" height="210" rx="2"
          initial={{ height: 0, y: 300 }}
          animate={{ height: 210, y: 90 }}
          transition={{ duration: 1, delay: 0.15 }}
        />
      </g>
      
      {/* Glowing windows - scattered dots */}
      <g fill="#00D4FF">
        {[...Array(50)].map((_, i) => (
          <motion.circle
            key={i}
            cx={120 + (i * 35) % 1680}
            cy={150 + (i * 17) % 120}
            r="1.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0] }}
            transition={{ 
              duration: 2 + Math.random() * 2, 
              delay: Math.random() * 3,
              repeat: Infinity,
              repeatType: 'reverse'
            }}
          />
        ))}
      </g>
    </svg>
  );
}

/**
 * Icons
 */
function ShieldIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function VaultIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
    </svg>
  );
}

function CircuitIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />
    </svg>
  );
}
