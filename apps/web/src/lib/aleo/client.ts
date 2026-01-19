/**
 * AXIS Protocol - Aleo SDK Client
 * 
 * This module provides the interface to interact with Aleo programs
 * using the Provable SDK. All ZK proof generation happens client-side
 * in a Web Worker for performance.
 */

import { 
  Account, 
  ProgramManager, 
  AleoNetworkClient,
  NetworkRecordProvider,
  AleoKeyProvider,
} from '@provablehq/sdk';

// Network configuration
export const ALEO_NETWORK_URL = process.env.NEXT_PUBLIC_ALEO_RPC_URL || 'https://api.explorer.provable.com/v1';
export const ALEO_NETWORK = (process.env.NEXT_PUBLIC_ALEO_NETWORK || 'testnet') as 'testnet' | 'mainnet';

// Program IDs
export const PROGRAMS = {
  AXIS_SCORE: 'axis_score.aleo',
  AXIS_LENDING: 'axis_lending.aleo',
} as const;

/**
 * Aleo Client singleton for managing network connections
 */
class AleoClient {
  private static instance: AleoClient;
  private networkClient: AleoNetworkClient | null = null;
  private programManager: ProgramManager | null = null;
  private account: Account | null = null;

  private constructor() {}

  static getInstance(): AleoClient {
    if (!AleoClient.instance) {
      AleoClient.instance = new AleoClient();
    }
    return AleoClient.instance;
  }

  /**
   * Initialize the network client
   */
  async initialize(): Promise<void> {
    if (this.networkClient) return;

    this.networkClient = new AleoNetworkClient(ALEO_NETWORK_URL);
  }

  /**
   * Connect with a private key (for development/testing)
   */
  async connectWithPrivateKey(privateKey: string): Promise<Account> {
    await this.initialize();
    
    this.account = new Account({ privateKey });
    
    const keyProvider = new AleoKeyProvider();
    keyProvider.useCache(true);
    
    const recordProvider = new NetworkRecordProvider(this.account, this.networkClient!);
    
    this.programManager = new ProgramManager(
      ALEO_NETWORK_URL,
      keyProvider,
      recordProvider
    );

    return this.account;
  }

  /**
   * Get the current account
   */
  getAccount(): Account | null {
    return this.account;
  }

  /**
   * Get the program manager
   */
  getProgramManager(): ProgramManager | null {
    return this.programManager;
  }

  /**
   * Get the network client
   */
  getNetworkClient(): AleoNetworkClient | null {
    return this.networkClient;
  }

  /**
   * Fetch program source from the network
   */
  async fetchProgram(programId: string): Promise<string | null> {
    await this.initialize();
    
    try {
      const program = await this.networkClient!.getProgram(programId);
      return program;
    } catch (error) {
      console.error(`Failed to fetch program ${programId}:`, error);
      return null;
    }
  }

  /**
   * Get current block height
   */
  async getBlockHeight(): Promise<number> {
    await this.initialize();
    
    const height = await this.networkClient!.getLatestHeight();
    return height;
  }

  /**
   * Disconnect and cleanup
   */
  disconnect(): void {
    this.account = null;
    this.programManager = null;
  }
}

// Export singleton instance
export const aleoClient = AleoClient.getInstance();

// Export types for use across the app
export type { Account, ProgramManager, AleoNetworkClient };
