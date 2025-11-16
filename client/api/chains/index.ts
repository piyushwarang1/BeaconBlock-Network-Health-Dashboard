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

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const chains = Array.from(activeConnections.values()).map(conn => ({
      id: conn.id,
      name: conn.name,
      wsUrl: conn.wsUrl,
      status: 'connected',
      detailedStatus: {
        isConnected: true,
        latestBlockNumber: conn.latestBlock || 0,
        latestBlockTimestamp: conn.latestBlockTimestamp || new Date(),
        finalizedBlockNumber: conn.finalizedBlock || 0,
        activeValidators: conn.activeValidators || 0,
        totalValidators: conn.totalValidators || 0
      }
    }));

    const response = {
      success: true,
      data: chains,
      timestamp: new Date()
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Error getting chains:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    });
  }
}