import { ApiPromise, WsProvider } from '@polkadot/api';
import { Logger } from 'winston';
import { ChainInfo, ChainMetadata } from '../types';

export interface ChainEndpoint {
  name: string;
  wsUrl: string;
  description?: string;
  isTestnet?: boolean;
  isRelay?: boolean;
  isParachain?: boolean;
  parachainId?: number;
}

export interface DiscoveryResult {
  endpoint: ChainEndpoint;
  metadata: ChainMetadata;
  isReachable: boolean;
  responseTime: number;
  error?: string;
}

export class ChainDiscovery {
  private logger: Logger;
  private knownEndpoints: ChainEndpoint[] = [
    // Polkadot Ecosystem
    {
      name: 'Polkadot',
      wsUrl: 'wss://rpc.polkadot.io',
      description: 'Polkadot Relay Chain',
      isTestnet: false,
      isRelay: true
    },
    {
      name: 'Kusama',
      wsUrl: 'wss://kusama-rpc.polkadot.io',
      description: 'Kusama Canary Network',
      isTestnet: false,
      isRelay: true
    },
    {
      name: 'Westend',
      wsUrl: 'wss://westend-rpc.polkadot.io',
      description: 'Westend Test Network',
      isTestnet: true,
      isRelay: true
    },
    // Parachains
    {
      name: 'Acala',
      wsUrl: 'wss://acala-rpc-0.aca-api.network',
      description: 'Acala DeFi Hub',
      isTestnet: false,
      isParachain: true,
      parachainId: 2000
    },
    {
      name: 'Moonbeam',
      wsUrl: 'wss://wss.api.moonbeam.network',
      description: 'Moonbeam Ethereum Compatible',
      isTestnet: false,
      isParachain: true,
      parachainId: 2004
    },
    {
      name: 'Astar',
      wsUrl: 'wss://rpc.astar.network',
      description: 'Astar Smart Contracts',
      isTestnet: false,
      isParachain: true,
      parachainId: 2006
    },
    {
      name: 'Parallel',
      wsUrl: 'wss://rpc.parallel.fi',
      description: 'Parallel DeFi',
      isTestnet: false,
      isParachain: true,
      parachainId: 2012
    },
    // Testnets
    {
      name: 'Rococo',
      wsUrl: 'wss://rococo-rpc.polkadot.io',
      description: 'Rococo Test Network',
      isTestnet: true,
      isRelay: true
    },
    {
      name: 'Moonbase Alpha',
      wsUrl: 'wss://wss.api.moonbase.moonbeam.network',
      description: 'Moonbeam Testnet',
      isTestnet: true,
      isParachain: true
    }
  ];

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Discover and test connectivity to known Substrate chains
   */
  async discoverChains(
    includeTestnets: boolean = false,
    timeout: number = 10000
  ): Promise<DiscoveryResult[]> {
    this.logger.info('Starting chain discovery process...');
    
    const endpoints = includeTestnets 
      ? this.knownEndpoints 
      : this.knownEndpoints.filter(e => !e.isTestnet);

    const results: DiscoveryResult[] = [];
    
    // Test endpoints in parallel with limited concurrency
    const concurrency = 5;
    for (let i = 0; i < endpoints.length; i += concurrency) {
      const batch = endpoints.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map(endpoint => this.testEndpoint(endpoint, timeout))
      );
      results.push(...batchResults);
    }

    const reachableCount = results.filter(r => r.isReachable).length;
    this.logger.info(`Chain discovery completed: ${reachableCount}/${results.length} chains reachable`);

    return results.sort((a, b) => {
      // Sort by reachability first, then by response time
      if (a.isReachable && !b.isReachable) return -1;
      if (!a.isReachable && b.isReachable) return 1;
      if (a.isReachable && b.isReachable) {
        return a.responseTime - b.responseTime;
      }
      return a.endpoint.name.localeCompare(b.endpoint.name);
    });
  }

  /**
   * Test connectivity and gather metadata for a specific endpoint
   */
  async testEndpoint(
    endpoint: ChainEndpoint, 
    timeout: number = 10000
  ): Promise<DiscoveryResult> {
    const startTime = Date.now();
    
    try {
      this.logger.debug(`Testing endpoint: ${endpoint.name} (${endpoint.wsUrl})`);
      
      const provider = new WsProvider(endpoint.wsUrl, false);
      
      // Create API with timeout
      const api = await Promise.race([
        ApiPromise.create({ provider }),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), timeout)
        )
      ]);

      const responseTime = Date.now() - startTime;

      // Gather chain metadata
      const [
        chain,
        nodeName,
        nodeVersion,
        runtimeVersion,
        systemProperties,
        lastHeader
      ] = await Promise.all([
        api.rpc.system.chain(),
        api.rpc.system.name(),
        api.rpc.system.version(),
        api.rpc.state.getRuntimeVersion(),
        api.rpc.system.properties(),
        api.rpc.chain.getHeader()
      ]);

      const metadata: ChainMetadata = {
        chainId: chain.toString(),
        chainName: endpoint.name,
        nodeName: nodeName.toString(),
        nodeVersion: nodeVersion.toString(),
        runtimeVersion: {
          specName: runtimeVersion.specName.toString(),
          specVersion: runtimeVersion.specVersion.toNumber(),
          implName: runtimeVersion.implName.toString(),
          implVersion: runtimeVersion.implVersion.toNumber(),
          transactionVersion: runtimeVersion.transactionVersion.toNumber(),
          stateVersion: runtimeVersion.stateVersion?.toNumber() || 0
        },
        properties: {
          ss58Format: systemProperties.ss58Format?.toNumber() || 42,
          tokenDecimals: systemProperties.tokenDecimals?.toJSON() as number[] || [12],
          tokenSymbol: systemProperties.tokenSymbol?.toJSON() as string[] || ['UNIT']
        },
        genesisHash: api.genesisHash.toString(),
        blockNumber: lastHeader.number.toNumber(),
        blockHash: lastHeader.hash.toString(),
        parentHash: lastHeader.parentHash.toString(),
        stateRoot: lastHeader.stateRoot.toString(),
        extrinsicsRoot: lastHeader.extrinsicsRoot.toString(),
        isArchive: false, // We'll determine this later
        hasStaking: await this.checkStakingSupport(api),
        hasGovernance: await this.checkGovernanceSupport(api),
        hasIdentity: await this.checkIdentitySupport(api),
        connectedAt: new Date(),
        lastUpdated: new Date()
      };

      await api.disconnect();

      return {
        endpoint,
        metadata,
        isReachable: true,
        responseTime,
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      this.logger.warn(`Failed to connect to ${endpoint.name}: ${errorMessage}`);
      
      return {
        endpoint,
        metadata: {} as ChainMetadata, // Empty metadata for failed connections
        isReachable: false,
        responseTime,
        error: errorMessage
      };
    }
  }

  /**
   * Check if the chain supports staking functionality
   */
  private async checkStakingSupport(api: ApiPromise): Promise<boolean> {
    try {
      return !!(api.query.staking && api.query.staking.validators);
    } catch {
      return false;
    }
  }

  /**
   * Check if the chain supports governance functionality
   */
  private async checkGovernanceSupport(api: ApiPromise): Promise<boolean> {
    try {
      return !!(
        (api.query.democracy && api.query.democracy.publicProps) ||
        (api.query.council && api.query.council.members) ||
        (api.query.referenda && api.query.referenda.referendumCount)
      );
    } catch {
      return false;
    }
  }

  /**
   * Check if the chain supports identity functionality
   */
  private async checkIdentitySupport(api: ApiPromise): Promise<boolean> {
    try {
      return !!(api.query.identity && api.query.identity.identityOf);
    } catch {
      return false;
    }
  }

  /**
   * Add a custom endpoint to the known endpoints list
   */
  addCustomEndpoint(endpoint: ChainEndpoint): void {
    const exists = this.knownEndpoints.some(e => e.wsUrl === endpoint.wsUrl);
    if (!exists) {
      this.knownEndpoints.push(endpoint);
      this.logger.info(`Added custom endpoint: ${endpoint.name} (${endpoint.wsUrl})`);
    }
  }

  /**
   * Remove a custom endpoint from the known endpoints list
   */
  removeCustomEndpoint(wsUrl: string): boolean {
    const initialLength = this.knownEndpoints.length;
    this.knownEndpoints = this.knownEndpoints.filter(e => e.wsUrl !== wsUrl);
    const removed = this.knownEndpoints.length < initialLength;
    
    if (removed) {
      this.logger.info(`Removed custom endpoint: ${wsUrl}`);
    }
    
    return removed;
  }

  /**
   * Get all known endpoints
   */
  getKnownEndpoints(includeTestnets: boolean = false): ChainEndpoint[] {
    return includeTestnets 
      ? [...this.knownEndpoints]
      : this.knownEndpoints.filter(e => !e.isTestnet);
  }

  /**
   * Validate a WebSocket URL format
   */
  validateEndpointUrl(wsUrl: string): { isValid: boolean; error?: string } {
    try {
      const url = new URL(wsUrl);
      
      if (!['ws:', 'wss:'].includes(url.protocol)) {
        return {
          isValid: false,
          error: 'URL must use ws:// or wss:// protocol'
        };
      }
      
      if (!url.hostname) {
        return {
          isValid: false,
          error: 'URL must have a valid hostname'
        };
      }
      
      return { isValid: true };
      
    } catch (error) {
      return {
        isValid: false,
        error: 'Invalid URL format'
      };
    }
  }

  /**
   * Get chain recommendations based on network type
   */
  getRecommendedChains(networkType: 'mainnet' | 'testnet' | 'all' = 'mainnet'): ChainEndpoint[] {
    let filtered = this.knownEndpoints;
    
    if (networkType === 'mainnet') {
      filtered = filtered.filter(e => !e.isTestnet);
    } else if (networkType === 'testnet') {
      filtered = filtered.filter(e => e.isTestnet);
    }
    
    // Prioritize relay chains and popular parachains
    return filtered.sort((a, b) => {
      if (a.isRelay && !b.isRelay) return -1;
      if (!a.isRelay && b.isRelay) return 1;
      return a.name.localeCompare(b.name);
    });
  }
}