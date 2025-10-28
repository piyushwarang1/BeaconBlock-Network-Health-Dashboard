import { Router, Request, Response } from 'express';
import { Logger } from 'winston';
import { PriceService } from '../services/PriceService';
import { ApiResponse } from '../types';

export function priceRoutes(priceService: PriceService, logger: Logger): Router {
  const router = Router();

  /**
   * GET /api/prices/:tokenId
   * Get current price for a token
   */
  router.get('/:tokenId', async (req: Request, res: Response) => {
    try {
      const { tokenId } = req.params;
      
      const priceData = await priceService.getTokenPrice(tokenId);
      
      if (!priceData) {
        const response: ApiResponse = {
          success: false,
          error: 'Token not found or price data unavailable',
          timestamp: new Date()
        };
        return res.status(404).json(response);
      }
      
      const response: ApiResponse = {
        success: true,
        data: priceData,
        timestamp: new Date()
      };
      
      res.json(response);
      
    } catch (error) {
      logger.error('Error getting token price:', error);
      
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get token price',
        timestamp: new Date()
      };
      
      res.status(500).json(response);
    }
  });

  /**
   * GET /api/prices/:tokenId/history
   * Get price history for a token
   */
  router.get('/:tokenId/history', async (req: Request, res: Response) => {
    try {
      const { tokenId } = req.params;
      const { days = '7' } = req.query;
      
      const daysNum = Math.min(parseInt(days as string) || 7, 365);
      
      const historyData = await priceService.getPriceHistory(tokenId, daysNum);
      
      const response: ApiResponse = {
        success: true,
        data: historyData,
        timestamp: new Date()
      };
      
      res.json(response);
      
    } catch (error) {
      logger.error('Error getting price history:', error);
      
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get price history',
        timestamp: new Date()
      };
      
      res.status(500).json(response);
    }
  });

  /**
   * GET /api/prices
   * Get multiple token prices
   */
  router.get('/', async (req: Request, res: Response) => {
    try {
      const { tokens } = req.query;
      
      if (!tokens) {
        const response: ApiResponse = {
          success: false,
          error: 'Tokens parameter is required',
          timestamp: new Date()
        };
        return res.status(400).json(response);
      }
      
      const tokenIds = (tokens as string).split(',').map(t => t.trim());
      const prices = await Promise.all(
        tokenIds.map(id => priceService.getTokenPrice(id))
      );
      
      const priceMap = tokenIds.reduce((acc, id, index) => {
        if (prices[index]) {
          acc[id] = prices[index];
        }
        return acc;
      }, {} as Record<string, any>);
      
      const response: ApiResponse = {
        success: true,
        data: priceMap,
        timestamp: new Date()
      };
      
      res.json(response);
      
    } catch (error) {
      logger.error('Error getting multiple prices:', error);
      
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get prices',
        timestamp: new Date()
      };
      
      res.status(500).json(response);
    }
  });

  /**
   * GET /api/prices/tokens/list
   * Get list of supported tokens
   */
  router.get('/tokens/list', async (req: Request, res: Response) => {
    try {
      const tokens = priceService.getSupportedTokens();
      
      const response: ApiResponse = {
        success: true,
        data: tokens,
        timestamp: new Date()
      };
      
      res.json(response);
      
    } catch (error) {
      logger.error('Error getting supported tokens:', error);
      
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get supported tokens',
        timestamp: new Date()
      };
      
      res.status(500).json(response);
    }
  });

  return router;
}