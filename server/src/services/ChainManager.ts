import { ApiPromise, WsProvider } from '@polkadot/api';
import { Logger } from 'winston';
import { 
  ChainConnection, 
  ChainInfo, 
  ChainMetadata, 
  NetworkStats, 
  ValidatorInfo, 
  BlockInfo 
} from '../types';

export class ChainManager {
  private connections: Map<string, ChainConnection> = new Map();
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Connect to a Substrate chain and retrieve its metadata
   */
  async connectToChain(wsUrl: string, customName?: string): Promise<ChainConnection> {
    const chainId = this.generateChainId(wsUrl);
    
    // Check if already connected
    if (this.connections.has(chainId)) {
      const existing = this.connections.get(chainId)!;
      if (existing.info.status === 'connected') {
        return existing;
      }
    }

    this.logger.info(`Connecting to chain: ${wsUrl}`);

    try {
      // Validate WebSocket URL
      if (!this.isValidWebSocketUrl(wsUrl)) {
        throw new Error('Invalid WebSocket URL format');
      }

      // Create WebSocket provider with timeout
      const provider = new WsProvider(wsUrl, 1000);
      
      // Create API instance with proper error handling
      const api = await ApiPromise.create({ 
        provider,
        throwOnConnect: true,
        throwOnUnknown: true,
        noInitWarn: true
      });

      // Wait for API to be ready with timeout
      await Promise.race([
        api.isReady,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 30000)
        )
      ]);

      // Extract chain metadata
      const metadata = await this.extractChainMetadata(api, chainId, customName);
      
      // Create chain info
      const info: ChainInfo = {
        id: chainId,
        name: metadata.name,
        wsUrl,
        status: 'connected',
        lastConnected: new Date()
      };

      // Create connection object
      const connection: ChainConnection = {
        api,
        metadata,
        info,
        recentBlocks: [],
        subscriptions: new Map()
      };

      // Store connection
      this.connections.set(chainId, connection);

      // Start monitoring
      await this.startChainMonitoring(connection);

      this.logger.info(`Successfully connected to chain: ${metadata.name} (${chainId})`);
      return connection;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to connect to chain ${wsUrl}:`, error);
      
      // Store failed connection info
      const failedInfo: ChainInfo = {
        id: chainId,
        name: customName || 'Unknown Chain',
        wsUrl,
        status: 'error',
        error: errorMessage
      };

      throw new Error(`Failed to connect to chain: ${errorMessage}`);
    }
  }

  /**
   * Extract comprehensive metadata from a connected chain
   */
  private async extractChainMetadata(
    api: ApiPromise, 
    chainId: string, 
    customName?: string
  ): Promise<ChainMetadata> {
    try {
      // Get chain properties
      const [
        chainName,
        chainProperties,
        runtimeVersion,
        genesisHash
      ] = await Promise.all([
        api.rpc.system.chain(),
        api.rpc.system.properties(),
        api.rpc.state.getRuntimeVersion(),
        api.genesisHash
      ]);

      // Extract token information
      const tokenSymbol = chainProperties.tokenSymbol.unwrapOr(['UNIT'])[0]?.toString() || 'UNIT';
      const tokenDecimals = chainProperties.tokenDecimals.unwrapOr([12])[0]?.toNumber() || 12;
      const ss58Format = chainProperties.ss58Format.unwrapOr(42);
      const ss58FormatValue = typeof ss58Format === 'number' ? ss58Format : 42;

      // Calculate average block time (default to 6 seconds for Substrate)
      const blockTime = 6000; // milliseconds

      return {
        id: chainId,
        name: customName || chainName.toString(),
        version: runtimeVersion.specVersion.toString(),
        genesisHash: genesisHash.toString(),
        ss58Format: ss58FormatValue as number,
        tokenSymbol,
        tokenDecimals,
        blockTime,
        properties: chainProperties.toJSON(),
        runtimeVersion: {
          specName: runtimeVersion.specName.toString(),
          specVersion: runtimeVersion.specVersion.toNumber(),
          implVersion: runtimeVersion.implVersion.toNumber(),
          authoringVersion: runtimeVersion.authoringVersion.toNumber(),
          transactionVersion: runtimeVersion.transactionVersion.toNumber()
        }
      };
    } catch (error) {
      this.logger.error('Failed to extract chain metadata:', error);
      throw error;
    }
  }

  /**
   * Start monitoring a chain for real-time updates
   */
  private async startChainMonitoring(connection: ChainConnection): Promise<void> {
    const { api, info } = connection;

    try {
      // Subscribe to new blocks
      const unsubscribeNewHeads = await api.rpc.chain.subscribeNewHeads((header) => {
        this.handleNewBlock(connection, header);
      });

      // Subscribe to finalized blocks
      const unsubscribeFinalizedHeads = await api.rpc.chain.subscribeFinalizedHeads((header) => {
        this.handleFinalizedBlock(connection, header);
      });

      // Store unsubscribe functions
      connection.subscriptions.set('newHeads', unsubscribeNewHeads);
      connection.subscriptions.set('finalizedHeads', unsubscribeFinalizedHeads);

      // Get initial network stats
      await this.updateNetworkStats(connection);

      // Set up periodic stats updates (every 30 seconds)
      const statsInterval = setInterval(async () => {
        try {
          await this.updateNetworkStats(connection);
        } catch (error) {
          this.logger.error(`Failed to update stats for ${info.name}:`, error);
        }
      }, 30000);

      connection.subscriptions.set('statsInterval', () => clearInterval(statsInterval));

    } catch (error) {
      this.logger.error(`Failed to start monitoring for ${info.name}:`, error);
      throw error;
    }
  }

  /**
   * Handle new block events
   */
  private async handleNewBlock(connection: ChainConnection, header: any): Promise<void> {
    try {
      const blockNumber = header.number.toNumber();
      const blockHash = header.hash.toString();

      // Get block details with error handling for newer extrinsic versions
      let blockInfo: BlockInfo;
      try {
        const [block, blockTime] = await Promise.all([
          connection.api.rpc.chain.getBlock(blockHash),
          connection.api.query.timestamp?.now ? connection.api.query.timestamp.now.at(blockHash) : null
        ]);

        blockInfo = {
          number: blockNumber,
          hash: blockHash,
          parentHash: header.parentHash.toString(),
          timestamp: blockTime ? new Date(blockTime.toNumber()) : new Date(),
          author: header.author?.toString(),
          extrinsicsCount: block.block.extrinsics.length,
          eventsCount: 0, // Will be updated when events are processed
          size: block.block.toU8a().length,
          finalized: false
        };
      } catch (blockError) {
        // If block decoding fails (e.g., due to newer extrinsic versions), create minimal block info
        this.logger.warn(`Failed to decode block ${blockNumber}, creating minimal info:`, blockError);

        blockInfo = {
          number: blockNumber,
          hash: blockHash,
          parentHash: header.parentHash.toString(),
          timestamp: new Date(),
          author: header.author?.toString(),
          extrinsicsCount: 0, // Unknown due to decode failure
          eventsCount: 0,
          size: 0, // Unknown due to decode failure
          finalized: false
        };
      }

      // Add to recent blocks (keep last 10)
      connection.recentBlocks.unshift(blockInfo);
      if (connection.recentBlocks.length > 10) {
        connection.recentBlocks.pop();
      }

      this.logger.debug(`New block ${blockNumber} for ${connection.info.name}`);
    } catch (error) {
      this.logger.error('Error handling new block:', error);
    }
  }

  /**
   * Handle finalized block events
   */
  private async handleFinalizedBlock(connection: ChainConnection, header: any): Promise<void> {
    try {
      const blockNumber = header.number.toNumber();
      
      // Mark block as finalized in recent blocks
      const blockIndex = connection.recentBlocks.findIndex(b => b.number === blockNumber);
      if (blockIndex !== -1) {
        connection.recentBlocks[blockIndex].finalized = true;
      }

      this.logger.debug(`Finalized block ${blockNumber} for ${connection.info.name}`);
    } catch (error) {
      this.logger.error('Error handling finalized block:', error);
    }
  }

  /**
   * Update network statistics
   */
  private async updateNetworkStats(connection: ChainConnection): Promise<void> {
    try {
      const { api } = connection;
      
      // Get current block info
      const [
        bestNumber,
        bestHash,
        finalizedHash,
        totalIssuance
      ] = await Promise.all([
        api.rpc.chain.getHeader(),
        api.rpc.chain.getBlockHash(),
        api.rpc.chain.getFinalizedHead(),
        api.query.balances?.totalIssuance ? api.query.balances.totalIssuance() : null
      ]);

      const finalizedNumber = await api.rpc.chain.getHeader(finalizedHash);

      // Get validator information if available
      let validatorStats = {
        activeValidators: 0,
        waitingValidators: 0,
        totalValidators: 0
      };

      try {
        if (api.query.session?.validators && api.query.staking?.validators) {
          const [activeValidators, allValidators] = await Promise.all([
            api.query.session.validators(),
            api.query.staking.validators.entries()
          ]);

          validatorStats = {
            activeValidators: activeValidators.length,
            waitingValidators: Math.max(0, allValidators.length - activeValidators.length),
            totalValidators: allValidators.length
          };
        }
      } catch (error) {
        // Chain might not have staking pallet
        this.logger.debug('No staking information available for this chain');
      }

      // Get era/epoch information if available
      let eraInfo = {
        era: 0,
        epoch: 0,
        sessionProgress: 0
      };

      try {
        if (api.query.staking?.currentEra && api.query.session?.currentIndex) {
          const [currentEra, currentSession] = await Promise.all([
            api.query.staking.currentEra(),
            api.query.session.currentIndex()
          ]);

          eraInfo = {
            era: currentEra?.unwrapOr(0).toNumber() || 0,
            epoch: currentSession.toNumber(),
            sessionProgress: 0 // Would need more complex calculation
          };
        }
      } catch (error) {
        // Chain might not have era/session information
        this.logger.debug('No era/session information available for this chain');
      }

      const stats: NetworkStats = {
        chainId: connection.info.id,
        timestamp: new Date(),
        blockNumber: bestNumber.number.toNumber(),
        blockHash: bestHash.toString(),
        blockTime: connection.metadata.blockTime,
        finalizedBlock: finalizedNumber.number.toNumber(),
        totalIssuance: totalIssuance?.toString() || '0',
        ...validatorStats,
        ...eraInfo
      };

      connection.stats = stats;
      
    } catch (error) {
      this.logger.error('Failed to update network stats:', error);
    }
  }

  /**
   * Get all connected chains
   */
  getConnectedChains(): ChainInfo[] {
    return Array.from(this.connections.values()).map(conn => conn.info);
  }

  /**
   * Get chain connection by ID
   */
  getChainConnection(chainId: string): ChainConnection | undefined {
    return this.connections.get(chainId);
  }

  /**
   * Disconnect from a specific chain
   */
  async disconnectChain(chainId: string): Promise<void> {
    const connection = this.connections.get(chainId);
    if (!connection) {
      return;
    }

    try {
      // Unsubscribe from all subscriptions
      for (const [name, unsubscribe] of connection.subscriptions) {
        try {
          unsubscribe();
        } catch (error) {
          this.logger.error(`Failed to unsubscribe from ${name}:`, error);
        }
      }

      // Disconnect API
      await connection.api.disconnect();
      
      // Update connection status
      connection.info.status = 'disconnected';
      
      // Remove from connections
      this.connections.delete(chainId);
      
      this.logger.info(`Disconnected from chain: ${connection.info.name}`);
    } catch (error) {
      this.logger.error(`Error disconnecting from chain ${chainId}:`, error);
    }
  }

  /**
   * Disconnect from all chains
   */
  async disconnectAll(): Promise<void> {
    const disconnectPromises = Array.from(this.connections.keys()).map(chainId => 
      this.disconnectChain(chainId)
    );
    
    await Promise.all(disconnectPromises);
  }

  /**
   * Generate a unique chain ID from WebSocket URL
   */
  private generateChainId(wsUrl: string): string {
    // Create a simple hash from the URL
    const url = new URL(wsUrl);
    return `${url.hostname}_${url.port || (url.protocol === 'wss:' ? '443' : '80')}_${Date.now()}`;
  }

  /**
   * Validate WebSocket URL format
   */
  private isValidWebSocketUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'ws:' || parsedUrl.protocol === 'wss:';
    } catch {
      return false;
    }
  }

  /**
   * Get network statistics for a chain
   */
  getNetworkStats(chainId: string): NetworkStats | undefined {
    const connection = this.connections.get(chainId);
    return connection?.stats;
  }

  /**
   * Get recent blocks for a chain
   */
  getRecentBlocks(chainId: string): BlockInfo[] {
    const connection = this.connections.get(chainId);
    return connection?.recentBlocks || [];
  }
}