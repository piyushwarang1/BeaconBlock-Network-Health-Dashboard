import { Router, Request, Response } from 'express';
import { Logger } from 'winston';
import { VolumeService } from '../services/VolumeService';
import { ApiResponse } from '../types';

export function volumeRoutes(volumeService: VolumeService, logger: Logger): Router {
  const router = Router();

  /**
   * GET /api/volume/pairs/:pairAddress
   * Get volume for a specific trading pair
   */
  router.get('/pairs/:pairAddress', async (req: Request, res: Response) => {
    try {
      const { pairAddress } = req.params;
      if (!pairAddress) {
        const response: ApiResponse = {
          success: false,
          error: 'Pair address parameter is required',
          timestamp: new Date()
        };
        return res.status(400).json(response);
      }

      const volumeData = await volumeService.getPairVolume(pairAddress);

      if (!volumeData) {
        const response: ApiResponse = {
          success: false,
          error: 'Pair not found or volume data unavailable',
          timestamp: new Date()
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse = {
        success: true,
        data: volumeData,
        timestamp: new Date()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error getting pair volume:', error);

      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };

      res.status(500).json(response);
    }
  });

  /**
   * GET /api/volume/pairs/:pairAddress/history
   * Get volume history for a specific trading pair
   */
  router.get('/pairs/:pairAddress/history', async (req: Request, res: Response) => {
    try {
      const { pairAddress } = req.params;
      if (!pairAddress) {
        const response: ApiResponse = {
          success: false,
          error: 'Pair address parameter is required',
          timestamp: new Date()
        };
        return res.status(400).json(response);
      }

      const { days = '7' } = req.query;
      const daysNum = Math.min(parseInt(days as string) || 7, 365); // Max 1 year

      const history = await volumeService.getVolumeHistory(pairAddress, daysNum);

      const response: ApiResponse = {
        success: true,
        data: history,
        timestamp: new Date()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error getting volume history:', error);

      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };

      res.status(500).json(response);
    }
  });

  /**
   * GET /api/volume/top
   * Get top trading pairs by volume
   */
  router.get('/top', async (req: Request, res: Response) => {
    try {
      const { chain = 'ethereum', limit = '100' } = req.query;

      const limitNum = Math.min(parseInt(limit as string) || 100, 500); // Max 500
      const topPairs = await volumeService.getTopPairs(chain as string, limitNum);

      const response: ApiResponse = {
        success: true,
        data: topPairs,
        timestamp: new Date()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error getting top pairs:', error);

      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };

      res.status(500).json(response);
    }
  });

  /**
   * GET /api/volume/search
   * Search for trading pairs
   */
  router.get('/search', async (req: Request, res: Response) => {
    try {
      const { q } = req.query;

      if (!q || typeof q !== 'string') {
        const response: ApiResponse = {
          success: false,
          error: 'Query parameter q is required',
          timestamp: new Date()
        };
        return res.status(400).json(response);
      }

      const pairs = await volumeService.searchPairs(q);

      const response: ApiResponse = {
        success: true,
        data: pairs,
        timestamp: new Date()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error searching pairs:', error);

      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };

      res.status(500).json(response);
    }
  });

  /**
   * GET /api/volume/tokens/:tokenAddress
   * Get all pairs for a specific token
   */
  router.get('/tokens/:tokenAddress', async (req: Request, res: Response) => {
    try {
      const { tokenAddress } = req.params;
      if (!tokenAddress) {
        const response: ApiResponse = {
          success: false,
          error: 'Token address parameter is required',
          timestamp: new Date()
        };
        return res.status(400).json(response);
      }

      const pairs = await volumeService.getTokenPairs(tokenAddress);

      const response: ApiResponse = {
        success: true,
        data: pairs,
        timestamp: new Date()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error getting token pairs:', error);

      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };

      res.status(500).json(response);
    }
  });

  return router;
}