import { Router, Request, Response } from 'express';
import { Logger } from 'winston';
import { EVMService } from '../services/EVMService';
import { EVMChainInfo, ApiResponse } from '../types';

export function evmRoutes(evmService: EVMService, logger: Logger): Router {
  const router = Router();

  /**
   * GET /api/evm/chains
   * Get list of supported EVM chains
   */
  router.get('/chains', async (req: Request, res: Response) => {
    try {
      // Predefined list of popular EVM chains
      const supportedChains: EVMChainInfo[] = [
        {
          id: 'ethereum_1',
          name: 'Ethereum Mainnet',
          wsUrl: 'wss://mainnet.infura.io/ws/v3/YOUR_INFURA_KEY',
          rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
          status: 'disconnected',
          chainId: 1,
          nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18
          },
          blockExplorerUrl: 'https://etherscan.io'
        },
        {
          id: 'polygon_137',
          name: 'Polygon Mainnet',
          wsUrl: 'wss://polygon-mainnet.infura.io/ws/v3/YOUR_INFURA_KEY',
          rpcUrl: 'https://polygon-mainnet.infura.io/v3/YOUR_INFURA_KEY',
          status: 'disconnected',
          chainId: 137,
          nativeCurrency: {
            name: 'MATIC',
            symbol: 'MATIC',
            decimals: 18
          },
          blockExplorerUrl: 'https://polygonscan.com'
        },
        {
          id: 'bsc_56',
          name: 'BNB Smart Chain',
          wsUrl: 'wss://bsc-ws-node.nariox.org:443',
          rpcUrl: 'https://bsc-dataseed.binance.org/',
          status: 'disconnected',
          chainId: 56,
          nativeCurrency: {
            name: 'BNB',
            symbol: 'BNB',
            decimals: 18
          },
          blockExplorerUrl: 'https://bscscan.com'
        }
      ];

      const response: ApiResponse = {
        success: true,
        data: supportedChains,
        timestamp: new Date()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error getting EVM chains:', error);

      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };

      res.status(500).json(response);
    }
  });

  /**
   * POST /api/evm/chains/connect
   * Connect to an EVM chain
   */
  router.post('/chains/connect', async (req: Request, res: Response) => {
    try {
      const { rpcUrl, name, chainId: chainIdNum }: { rpcUrl: string; name: string; chainId: number } = req.body;

      if (!rpcUrl) {
        const response: ApiResponse = {
          success: false,
          error: 'RPC URL is required',
          timestamp: new Date()
        };
        return res.status(400).json(response);
      }

      const chainInfo: EVMChainInfo = {
        id: `${name.toLowerCase().replace(/\s+/g, '_')}_${chainIdNum}`,
        name: name || 'Unknown EVM Chain',
        wsUrl: rpcUrl.replace('https://', 'wss://').replace('http://', 'ws://'),
        rpcUrl,
        status: 'connecting',
        chainId: chainIdNum,
        nativeCurrency: {
          name: 'ETH',
          symbol: 'ETH',
          decimals: 18
        }
      };

      const web3 = await evmService.connectToEVMChain(chainInfo);

      const response: ApiResponse = {
        success: true,
        data: {
          chainId: chainInfo.id,
          name: chainInfo.name,
          rpcUrl: chainInfo.rpcUrl,
          chainIdNum: chainInfo.chainId,
          connected: true
        },
        timestamp: new Date()
      };

      res.status(201).json(response);
    } catch (error) {
      logger.error('Error connecting to EVM chain:', error);

      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to connect to EVM chain',
        timestamp: new Date()
      };

      res.status(500).json(response);
    }
  });

  /**
   * GET /api/evm/chains/:chainId/transactions
   * Get recent transactions for an EVM chain
   */
  router.get('/chains/:chainId/transactions', async (req: Request, res: Response) => {
    try {
      const { chainId } = req.params;
      const { limit = '50' } = req.query;

      if (!chainId) {
        const response: ApiResponse = {
          success: false,
          error: 'Chain ID parameter is required',
          timestamp: new Date()
        };
        return res.status(400).json(response);
      }

      const limitNum = Math.min(parseInt(limit as string) || 50, 100);
      const transactions = await evmService.getRecentTransactions(chainId, limitNum);

      const response: ApiResponse = {
        success: true,
        data: transactions,
        timestamp: new Date()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error getting EVM transactions:', error);

      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };

      res.status(500).json(response);
    }
  });

  /**
   * GET /api/evm/chains/:chainId/transactions/:hash
   * Get specific transaction details
   */
  router.get('/chains/:chainId/transactions/:hash', async (req: Request, res: Response) => {
    try {
      const { chainId, hash } = req.params;

      if (!chainId || !hash) {
        const response: ApiResponse = {
          success: false,
          error: 'Chain ID and transaction hash parameters are required',
          timestamp: new Date()
        };
        return res.status(400).json(response);
      }

      const transaction = await evmService.getTransaction(hash);

      if (!transaction) {
        const response: ApiResponse = {
          success: false,
          error: 'Transaction not found',
          timestamp: new Date()
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse = {
        success: true,
        data: transaction,
        timestamp: new Date()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error getting EVM transaction:', error);

      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };

      res.status(500).json(response);
    }
  });

  /**
   * GET /api/evm/chains/:chainId/stats
   * Get EVM chain statistics
   */
  router.get('/chains/:chainId/stats', async (req: Request, res: Response) => {
    try {
      const { chainId } = req.params;

      if (!chainId) {
        const response: ApiResponse = {
          success: false,
          error: 'Chain ID parameter is required',
          timestamp: new Date()
        };
        return res.status(400).json(response);
      }

      const stats = await evmService.getChainStats(chainId);

      if (!stats) {
        const response: ApiResponse = {
          success: false,
          error: 'Chain not found or stats not available',
          timestamp: new Date()
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse = {
        success: true,
        data: stats,
        timestamp: new Date()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error getting EVM chain stats:', error);

      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };

      res.status(500).json(response);
    }
  });

  /**
   * DELETE /api/evm/chains/:chainId
   * Disconnect from an EVM chain
   */
  router.delete('/chains/:chainId', async (req: Request, res: Response) => {
    try {
      const { chainId } = req.params;

      if (!chainId) {
        const response: ApiResponse = {
          success: false,
          error: 'Chain ID parameter is required',
          timestamp: new Date()
        };
        return res.status(400).json(response);
      }

      evmService.disconnectEVMChain(chainId);

      const response: ApiResponse = {
        success: true,
        data: { message: 'EVM chain disconnected successfully' },
        timestamp: new Date()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error disconnecting EVM chain:', error);

      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to disconnect EVM chain',
        timestamp: new Date()
      };

      res.status(500).json(response);
    }
  });

  return router;
}