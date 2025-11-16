import Web3 from 'web3';
import { Logger } from 'winston';
import { EVMChainInfo, EVMTransaction, EVMLog } from '../types';

export class EVMService {
  private connections: Map<string, Web3> = new Map();
  private logger: Logger;
  private subscriptions: Map<string, any> = new Map();
  private recentTransactions: Map<string, EVMTransaction[]> = new Map();

  constructor(logger: Logger) {
    this.logger = logger;
  }

  async connectToEVMChain(chainInfo: EVMChainInfo): Promise<Web3> {
    try {
      const web3 = new Web3(chainInfo.rpcUrl);

      // Test connection
      await web3.eth.getBlockNumber();

      this.connections.set(chainInfo.id, web3);
      this.recentTransactions.set(chainInfo.id, []);
      this.logger.info(`Connected to EVM chain: ${chainInfo.name}`);

      // Start monitoring
      await this.startEVMMonitoring(chainInfo);

      return web3;
    } catch (error) {
      this.logger.error(`Failed to connect to EVM chain ${chainInfo.name}:`, error);
      throw error;
    }
  }

  private async startEVMMonitoring(chainInfo: EVMChainInfo): Promise<void> {
    const web3 = this.connections.get(chainInfo.id);
    if (!web3) return;

    try {
      // Subscribe to new blocks
      const blockSubscription = web3.eth.subscribe('newBlockHeaders', (error: any, blockHeader: any) => {
        if (error) {
          this.logger.error('Block subscription error:', error);
          return;
        }
        this.handleNewBlock(chainInfo.id, blockHeader);
      });

      this.subscriptions.set(`${chainInfo.id}_blocks`, blockSubscription);

      // Subscribe to pending transactions (if supported)
      try {
        const txSubscription = web3.eth.subscribe('pendingTransactions', (error: any, txHash: any) => {
          if (error) return;
          this.handlePendingTransaction(chainInfo.id, txHash);
        });
        this.subscriptions.set(`${chainInfo.id}_txs`, txSubscription);
      } catch (error) {
        this.logger.debug('Pending transactions subscription not supported');
      }

    } catch (error) {
      this.logger.error(`Failed to start EVM monitoring for ${chainInfo.name}:`, error);
    }
  }

  private async handleNewBlock(chainId: string, blockHeader: any): Promise<void> {
    try {
      const web3 = this.connections.get(chainId);
      if (!web3) return;

      const block = await web3.eth.getBlock(blockHeader.number, true);

      // Process transactions
      for (const tx of block.transactions) {
        await this.processTransaction(chainId, tx, block.timestamp);
      }

      this.logger.debug(`Processed block ${blockHeader.number} for EVM chain ${chainId}`);
    } catch (error) {
      this.logger.error('Error handling new EVM block:', error);
    }
  }

  private async processTransaction(chainId: string, tx: any, blockTimestamp: any): Promise<void> {
    try {
      const web3 = this.connections.get(chainId);
      if (!web3) return;

      const receipt = await web3.eth.getTransactionReceipt(tx.hash);

      const evmTx: EVMTransaction = {
        hash: tx.hash,
        blockNumber: Number(tx.blockNumber),
        blockHash: tx.blockHash,
        timestamp: new Date(blockTimestamp * 1000),
        from: tx.from,
        to: tx.to,
        value: tx.value,
        gasPrice: tx.gasPrice,
        gasLimit: tx.gas,
        gasUsed: receipt?.gasUsed?.toString(),
        status: receipt?.status || false,
        contractAddress: receipt?.contractAddress || null,
        logs: receipt?.logs || [],
        fee: receipt ? (BigInt(receipt.gasUsed) * BigInt(tx.gasPrice)).toString() : '0'
      };

      // Store in recent transactions (keep last 100)
      const recentTxs = this.recentTransactions.get(chainId) || [];
      recentTxs.unshift(evmTx);
      if (recentTxs.length > 100) {
        recentTxs.pop();
      }
      this.recentTransactions.set(chainId, recentTxs);

      // TODO: Store in database for persistence
      // await this.storeTransaction(evmTx);

    } catch (error) {
      this.logger.error(`Error processing EVM transaction ${tx.hash}:`, error);
    }
  }

  private async handlePendingTransaction(chainId: string, txHash: string): Promise<void> {
    // Handle pending transactions if needed
    // This could be used for real-time pending tx monitoring
  }

  async getRecentTransactions(chainId: string, limit: number = 50): Promise<EVMTransaction[]> {
    const transactions = this.recentTransactions.get(chainId) || [];
    return transactions.slice(0, limit);
  }

  async getTransaction(hash: string): Promise<EVMTransaction | null> {
    // Search through all chains for the transaction
    for (const transactions of this.recentTransactions.values()) {
      const tx = transactions.find(t => t.hash === hash);
      if (tx) return tx;
    }

    // TODO: Query database for older transactions
    return null;
  }

  async getChainStats(chainId: string): Promise<any> {
    const web3 = this.connections.get(chainId);
    if (!web3) return null;

    try {
      const [blockNumber, gasPrice] = await Promise.all([
        web3.eth.getBlockNumber(),
        web3.eth.getGasPrice()
      ]);

      // Calculate TPS (transactions per second) - simplified
      const recentTxs = this.recentTransactions.get(chainId) || [];
      const recentBlocks = recentTxs.slice(0, 10); // Last 10 transactions
      const avgTxPerBlock = recentBlocks.length > 0 ? recentBlocks.length / 10 : 0;

      return {
        chainId: parseInt(chainId.split('_')[1] || '1'),
        blockNumber,
        gasPrice: gasPrice.toString(),
        tps: avgTxPerBlock / 12, // Assuming 12 second block time
        activeAddresses: 0 // Would need more complex calculation
      };
    } catch (error) {
      this.logger.error(`Error getting chain stats for ${chainId}:`, error);
      return null;
    }
  }

  disconnectEVMChain(chainId: string): void {
    const blockSub = this.subscriptions.get(`${chainId}_blocks`);
    if (blockSub) {
      blockSub.unsubscribe();
    }

    const txSub = this.subscriptions.get(`${chainId}_txs`);
    if (txSub) {
      txSub.unsubscribe();
    }

    this.connections.delete(chainId);
    this.recentTransactions.delete(chainId);
    this.logger.info(`Disconnected from EVM chain: ${chainId}`);
  }

  getConnectedChains(): string[] {
    return Array.from(this.connections.keys());
  }
}