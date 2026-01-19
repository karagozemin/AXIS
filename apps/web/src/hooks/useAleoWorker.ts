'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { WorkerRequest, WorkerResponse } from '@/workers/aleo.worker';

interface UseAleoWorkerOptions {
  autoInit?: boolean;
  privateKey?: string;
  networkUrl?: string;
}

interface UseAleoWorkerReturn {
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  progress: { stage: string; percent: number } | null;
  initialize: (privateKey: string, networkUrl: string) => void;
  executeTransition: (
    programId: string,
    transitionName: string,
    inputs: string[],
    fee: number
  ) => Promise<unknown>;
  mintCredibility: (
    financialData: {
      txCount: string;
      balanceFactor: string;
      repaymentRate: string;
      accountAgeDays: string;
      collateralHistory: string;
    },
    fee: number
  ) => Promise<unknown>;
}

/**
 * Hook to interact with the Aleo Web Worker
 * 
 * Handles ZK proof generation off the main thread
 * with progress updates for the "Circuit Solving" animation.
 */
export function useAleoWorker(options: UseAleoWorkerOptions = {}): UseAleoWorkerReturn {
  const workerRef = useRef<Worker | null>(null);
  const pendingRequests = useRef<Map<string, {
    resolve: (value: unknown) => void;
    reject: (error: Error) => void;
  }>>(new Map());

  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ stage: string; percent: number } | null>(null);

  // Initialize worker
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Create worker
    workerRef.current = new Worker(
      new URL('@/workers/aleo.worker.ts', import.meta.url),
      { type: 'module' }
    );

    // Handle messages from worker
    workerRef.current.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const { id, success, data, error: workerError, progress: workerProgress } = event.data;

      // Handle progress updates
      if (workerProgress) {
        setProgress(workerProgress);
        
        // If not complete, don't resolve yet
        if (workerProgress.stage !== 'complete') {
          return;
        }
      }

      // Handle init response
      if (id === 'init') {
        if (success) {
          setIsReady(true);
          setError(null);
        } else {
          setError(workerError || 'Failed to initialize');
        }
        setIsLoading(false);
        return;
      }

      // Handle pending request
      const pending = pendingRequests.current.get(id);
      if (pending) {
        pendingRequests.current.delete(id);
        setIsLoading(false);
        setProgress(null);

        if (success) {
          pending.resolve(data);
        } else {
          pending.reject(new Error(workerError || 'Unknown error'));
        }
      }
    };

    // Handle worker errors
    workerRef.current.onerror = (event) => {
      setError(event.message);
      setIsLoading(false);
    };

    // Auto-initialize if credentials provided
    if (options.autoInit && options.privateKey && options.networkUrl) {
      setIsLoading(true);
      workerRef.current.postMessage({
        id: 'init',
        type: 'INIT',
        payload: {
          privateKey: options.privateKey,
          networkUrl: options.networkUrl,
        },
      } as WorkerRequest);
    }

    // Cleanup
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, [options.autoInit, options.privateKey, options.networkUrl]);

  // Generate unique request ID
  const generateRequestId = useCallback(() => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Initialize the worker
  const initialize = useCallback((privateKey: string, networkUrl: string) => {
    if (!workerRef.current) return;

    setIsLoading(true);
    setError(null);

    workerRef.current.postMessage({
      id: 'init',
      type: 'INIT',
      payload: { privateKey, networkUrl },
    } as WorkerRequest);
  }, []);

  // Execute a transition
  const executeTransition = useCallback(
    (programId: string, transitionName: string, inputs: string[], fee: number): Promise<unknown> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current || !isReady) {
          reject(new Error('Worker not ready'));
          return;
        }

        const id = generateRequestId();
        pendingRequests.current.set(id, { resolve, reject });

        setIsLoading(true);
        setError(null);

        workerRef.current.postMessage({
          id,
          type: 'EXECUTE_TRANSITION',
          payload: { programId, transitionName, inputs, fee },
        } as WorkerRequest);
      });
    },
    [isReady, generateRequestId]
  );

  // Mint credibility (convenience method)
  const mintCredibility = useCallback(
    (
      financialData: {
        txCount: string;
        balanceFactor: string;
        repaymentRate: string;
        accountAgeDays: string;
        collateralHistory: string;
      },
      fee: number
    ): Promise<unknown> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current || !isReady) {
          reject(new Error('Worker not ready'));
          return;
        }

        const id = generateRequestId();
        pendingRequests.current.set(id, { resolve, reject });

        setIsLoading(true);
        setError(null);

        const currentTime = Math.floor(Date.now() / 1000).toString();

        workerRef.current.postMessage({
          id,
          type: 'MINT_CREDIBILITY',
          payload: { financialData, currentTime, fee },
        } as WorkerRequest);
      });
    },
    [isReady, generateRequestId]
  );

  return {
    isReady,
    isLoading,
    error,
    progress,
    initialize,
    executeTransition,
    mintCredibility,
  };
}
