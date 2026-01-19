'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ZKProofAnimationProps {
  onComplete?: () => void;
  status?: 'preparing' | 'proving' | 'solving' | 'finalizing' | 'complete';
  message?: string;
  inline?: boolean;
}

export function ZKProofAnimation({ 
  onComplete, 
  status: externalStatus,
  message: externalMessage,
  inline = false 
}: ZKProofAnimationProps) {
  const [stage, setStage] = useState<'preparing' | 'solving' | 'finalizing' | 'complete'>('preparing');
  const [progress, setProgress] = useState(0);

  // Map external status to internal stage
  const effectiveStage = externalStatus === 'proving' ? 'solving' : (externalStatus || stage) as typeof stage;

  useEffect(() => {
    // If external status is provided, don't run the internal timer
    if (externalStatus) return;

    const timeline = [
      { stage: 'preparing' as const, duration: 800, progress: 15 },
      { stage: 'solving' as const, duration: 2000, progress: 85 },
      { stage: 'finalizing' as const, duration: 500, progress: 100 },
      { stage: 'complete' as const, duration: 300, progress: 100 },
    ];

    let currentIndex = 0;
    let elapsed = 0;

    const interval = setInterval(() => {
      elapsed += 50;
      
      const current = timeline[currentIndex];
      const stageElapsed = elapsed - timeline.slice(0, currentIndex).reduce((a, b) => a + b.duration, 0);
      
      if (stageElapsed >= current.duration && currentIndex < timeline.length - 1) {
        currentIndex++;
        setStage(timeline[currentIndex].stage);
      }
      
      // Calculate progress
      const totalDuration = timeline.reduce((a, b) => a + b.duration, 0);
      setProgress(Math.min((elapsed / totalDuration) * 100, 100));
      
      if (elapsed >= totalDuration) {
        clearInterval(interval);
        onComplete?.();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete, externalStatus]);

  const content = (
    <div className="text-center">
      {/* Circuit Animation */}
      <div className={inline ? "relative w-32 h-32 mx-auto mb-4" : "relative w-64 h-64 mx-auto mb-8"}>
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-electric/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
          
          {/* Middle ring */}
          <motion.div
            className="absolute inset-4 rounded-full border-2 border-gold/30"
            animate={{ rotate: -360 }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          />
          
          {/* Inner ring */}
          <motion.div
            className="absolute inset-8 rounded-full border-2 border-electric/50"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />

          {/* Center orb */}
          <div className="absolute inset-16 flex items-center justify-center">
            <motion.div
              className="w-full h-full rounded-full bg-gradient-to-br from-electric to-gold"
              animate={{ 
                scale: [1, 1.1, 1],
                boxShadow: [
                  '0 0 40px rgba(0, 212, 255, 0.4)',
                  '0 0 80px rgba(0, 212, 255, 0.6)',
                  '0 0 40px rgba(0, 212, 255, 0.4)',
                ]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>

          {/* Circuit nodes */}
          {[...Array(8)].map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const radius = 100;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            return (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full bg-electric"
                style={{
                  left: `calc(50% + ${x}px - 6px)`,
                  top: `calc(50% + ${y}px - 6px)`,
                }}
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.1,
                  repeat: Infinity,
                }}
              />
            );
          })}

          {/* Connection lines */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 256 256">
            {[...Array(8)].map((_, i) => {
              const angle = (i / 8) * Math.PI * 2;
              const outerRadius = 100;
              const innerRadius = 48;
              const x1 = 128 + Math.cos(angle) * outerRadius;
              const y1 = 128 + Math.sin(angle) * outerRadius;
              const x2 = 128 + Math.cos(angle) * innerRadius;
              const y2 = 128 + Math.sin(angle) * innerRadius;
              
              return (
                <motion.line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="url(#circuitGradient)"
                  strokeWidth="1"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: [0, 1, 0] }}
                  transition={{
                    duration: 1,
                    delay: i * 0.15,
                    repeat: Infinity,
                  }}
                />
              );
            })}
            <defs>
              <linearGradient id="circuitGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00D4FF" stopOpacity="0" />
                <stop offset="50%" stopColor="#00D4FF" stopOpacity="1" />
                <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Stage Text */}
        <motion.h3
          key={effectiveStage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={inline ? "text-lg font-bold text-white mb-2" : "text-2xl font-bold text-white mb-2"}
        >
          {externalMessage ? externalMessage : (
            <>
              {effectiveStage === 'preparing' && 'Preparing Circuit...'}
              {effectiveStage === 'solving' && 'Solving Zero-Knowledge Proof...'}
              {effectiveStage === 'finalizing' && 'Finalizing Transaction...'}
              {effectiveStage === 'complete' && 'Proof Generated!'}
            </>
          )}
        </motion.h3>

        <p className="text-white/50 mb-6">
          {effectiveStage === 'preparing' && 'Loading program constraints'}
          {effectiveStage === 'solving' && 'Computing witness and generating proof'}
          {effectiveStage === 'finalizing' && 'Preparing transaction for broadcast'}
          {effectiveStage === 'complete' && 'Your transaction is being processed'}
        </p>

        {/* Progress Bar */}
        <div className={inline ? "w-full mx-auto" : "w-80 mx-auto"}>
          <div className="h-2 bg-void-300 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-electric to-gold"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <p className="text-sm font-mono text-electric mt-2">{Math.round(progress)}%</p>
        </div>

        {/* ZK Badge */}
        {!inline && (
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-white/30">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <span>Powered by Aleo Zero-Knowledge Proofs</span>
          </div>
        )}
      </div>
  );

  if (inline) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-void/95 backdrop-blur-xl"
    >
      {content}
    </motion.div>
  );
}
