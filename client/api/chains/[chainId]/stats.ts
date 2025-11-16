import { ApiPromise, WsProvider } from '@polkadot/api';
import winston from 'winston';

// Initialize logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// In-memory storage for demo purposes (in production, use a database)
const activeConnections = new Map<string, any>();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { chainId } = req.query;

    if (!chainId || typeof chainId !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Chain ID is required',
        timestamp: new Date()
      });
      return;
    }

    // Create temporary connection to get stats
    const connection = activeConnections.get(chainId);
    if (!connection) {
      res.status(404).json({
        success: false,
        error: 'Chain not found',
        timestamp: new Date()
      });
      return;
    }

    // Get current stats
    const [header, finalizedHead] = await Promise.all([
      connection.api.rpc.chain.getHeader(),
      connection.api.rpc.chain.getFinalizedHead()
    ]);

    const stats = {
      chainId,
      timestamp: new Date(),
      blockNumber: header.number.toNumber(),
      blockHash: header.hash.toString(),
      blockTime: connection.metadata.blockTime,
      finalizedBlock: finalizedHead ? parseInt(finalizedHead.toString(), 16) : 0,
      totalIssuance: '0', // Would need additional queries
      activeValidators: 0, // Would need additional queries
      waitingValidators: 0,
      totalValidators: 0,
      era: 0,
      epoch: 0,
      sessionProgress: 0
    };

    const response = {
      success: true,
      data: stats,
      timestamp: new Date()
    };

    res.status(200).json(response);

  } catch (error) {
    logger.error('Error getting chain stats:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    });
  }
}