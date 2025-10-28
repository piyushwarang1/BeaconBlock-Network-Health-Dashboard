import { Router, Request, Response } from 'express';
import { Logger } from 'winston';
import { ChainDiscovery, ChainEndpoint } from '../services/ChainDiscovery';
import { ApiResponse } from '../types';

export function discoveryRoutes(chainDiscovery: ChainDiscovery, logger: Logger): Router {
  const router = Router();

  /**
   * GET /api/discovery/scan
   * Discover and test connectivity to known Substrate chains
   */
  router.get('/scan', async (req: Request, res: Response) => {
    try {
      const { includeTestnets = 'false', timeout = '10000' } = req.query;
      
      const includeTestnetsFlag = includeTestnets === 'true';
      const timeoutMs = Math.min(parseInt(timeout as string) || 10000, 30000); // Max 30s timeout
      
      logger.info(`Starting chain discovery scan (includeTestnets: ${includeTestnetsFlag}, timeout: ${timeoutMs}ms)`);
      
      const results = await chainDiscovery.discoverChains(includeTestnetsFlag, timeoutMs);
      
      const response: ApiResponse = {
        success: true,
        data: {
          results,
          summary: {
            total: results.length,
            reachable: results.filter(r => r.isReachable).length,
            unreachable: results.filter(r => !r.isReachable).length,
            averageResponseTime: results
              .filter(r => r.isReachable)
              .reduce((sum, r) => sum + r.responseTime, 0) / 
              Math.max(results.filter(r => r.isReachable).length, 1)
          }
        },
        timestamp: new Date()
      };
      
      res.json(response);
      
    } catch (error) {
      logger.error('Error during chain discovery scan:', error);
      
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Chain discovery failed',
        timestamp: new Date()
      };
      
      res.status(500).json(response);
    }
  });

  /**
   * POST /api/discovery/test
   * Test connectivity to a specific endpoint
   */
  router.post('/test', async (req: Request, res: Response) => {
    try {
      const { wsUrl, name, timeout = 10000 }: { 
        wsUrl: string; 
        name?: string; 
        timeout?: number; 
      } = req.body;
      
      if (!wsUrl) {
        const response: ApiResponse = {
          success: false,
          error: 'WebSocket URL is required',
          timestamp: new Date()
        };
        return res.status(400).json(response);
      }

      // Validate URL format
      const validation = chainDiscovery.validateEndpointUrl(wsUrl);
      if (!validation.isValid) {
        const response: ApiResponse = {
          success: false,
          error: validation.error || 'Invalid WebSocket URL',
          timestamp: new Date()
        };
        return res.status(400).json(response);
      }

      const endpoint: ChainEndpoint = {
        name: name || 'Custom Chain',
        wsUrl,
        description: 'Custom endpoint for testing'
      };
      
      const timeoutMs = Math.min(timeout, 30000); // Max 30s timeout
      
      logger.info(`Testing custom endpoint: ${wsUrl}`);
      
      const result = await chainDiscovery.testEndpoint(endpoint, timeoutMs);
      
      const response: ApiResponse = {
        success: true,
        data: result,
        timestamp: new Date()
      };
      
      res.json(response);
      
    } catch (error) {
      logger.error('Error testing endpoint:', error);
      
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Endpoint test failed',
        timestamp: new Date()
      };
      
      res.status(500).json(response);
    }
  });

  /**
   * GET /api/discovery/endpoints
   * Get list of known endpoints
   */
  router.get('/endpoints', async (req: Request, res: Response) => {
    try {
      const { includeTestnets = 'false', networkType = 'all' } = req.query;
      
      const includeTestnetsFlag = includeTestnets === 'true';
      const networkTypeFilter = networkType as 'mainnet' | 'testnet' | 'all';
      
      let endpoints: ChainEndpoint[];
      
      if (networkTypeFilter === 'all') {
        endpoints = chainDiscovery.getKnownEndpoints(includeTestnetsFlag);
      } else {
        endpoints = chainDiscovery.getRecommendedChains(networkTypeFilter);
      }
      
      const response: ApiResponse = {
        success: true,
        data: {
          endpoints,
          count: endpoints.length,
          categories: {
            relayChains: endpoints.filter(e => e.isRelay).length,
            parachains: endpoints.filter(e => e.isParachain).length,
            testnets: endpoints.filter(e => e.isTestnet).length,
            mainnets: endpoints.filter(e => !e.isTestnet).length
          }
        },
        timestamp: new Date()
      };
      
      res.json(response);
      
    } catch (error) {
      logger.error('Error getting known endpoints:', error);
      
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get endpoints',
        timestamp: new Date()
      };
      
      res.status(500).json(response);
    }
  });

  /**
   * POST /api/discovery/endpoints
   * Add a custom endpoint to the known endpoints list
   */
  router.post('/endpoints', async (req: Request, res: Response) => {
    try {
      const endpoint: ChainEndpoint = req.body;
      
      if (!endpoint.name || !endpoint.wsUrl) {
        const response: ApiResponse = {
          success: false,
          error: 'Name and WebSocket URL are required',
          timestamp: new Date()
        };
        return res.status(400).json(response);
      }

      // Validate URL format
      const validation = chainDiscovery.validateEndpointUrl(endpoint.wsUrl);
      if (!validation.isValid) {
        const response: ApiResponse = {
          success: false,
          error: validation.error || 'Invalid WebSocket URL',
          timestamp: new Date()
        };
        return res.status(400).json(response);
      }

      chainDiscovery.addCustomEndpoint(endpoint);
      
      const response: ApiResponse = {
        success: true,
        data: { message: 'Custom endpoint added successfully', endpoint },
        timestamp: new Date()
      };
      
      res.status(201).json(response);
      
    } catch (error) {
      logger.error('Error adding custom endpoint:', error);
      
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add endpoint',
        timestamp: new Date()
      };
      
      res.status(500).json(response);
    }
  });

  /**
   * DELETE /api/discovery/endpoints
   * Remove a custom endpoint from the known endpoints list
   */
  router.delete('/endpoints', async (req: Request, res: Response) => {
    try {
      const { wsUrl } = req.body;
      
      if (!wsUrl) {
        const response: ApiResponse = {
          success: false,
          error: 'WebSocket URL is required',
          timestamp: new Date()
        };
        return res.status(400).json(response);
      }

      const removed = chainDiscovery.removeCustomEndpoint(wsUrl);
      
      if (!removed) {
        const response: ApiResponse = {
          success: false,
          error: 'Endpoint not found',
          timestamp: new Date()
        };
        return res.status(404).json(response);
      }
      
      const response: ApiResponse = {
        success: true,
        data: { message: 'Custom endpoint removed successfully' },
        timestamp: new Date()
      };
      
      res.json(response);
      
    } catch (error) {
      logger.error('Error removing custom endpoint:', error);
      
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove endpoint',
        timestamp: new Date()
      };
      
      res.status(500).json(response);
    }
  });

  /**
   * GET /api/discovery/recommendations
   * Get recommended chains based on network type
   */
  router.get('/recommendations', async (req: Request, res: Response) => {
    try {
      const { networkType = 'mainnet' } = req.query;
      
      const networkTypeFilter = networkType as 'mainnet' | 'testnet' | 'all';
      const recommendations = chainDiscovery.getRecommendedChains(networkTypeFilter);
      
      const response: ApiResponse = {
        success: true,
        data: {
          recommendations,
          networkType: networkTypeFilter,
          count: recommendations.length
        },
        timestamp: new Date()
      };
      
      res.json(response);
      
    } catch (error) {
      logger.error('Error getting chain recommendations:', error);
      
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get recommendations',
        timestamp: new Date()
      };
      
      res.status(500).json(response);
    }
  });

  return router;
}