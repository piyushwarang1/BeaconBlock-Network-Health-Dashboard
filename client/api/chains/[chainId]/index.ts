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
    const { chainId } = req.query;

    if (!chainId || typeof chainId !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Chain ID is required',
        timestamp: new Date()
      });
      return;
    }

    // For serverless, we'll create a temporary connection
    const connection = activeConnections.get(chainId);
    if (!connection) {
      // Try to create a temporary connection based on stored info
      // In production, you'd store connection details in a database
      res.status(404).json({
        success: false,
        error: 'Chain not found',
        timestamp: new Date()
      });
      return;
    }

    const response = {
      success: true,
      data: connection.metadata,
      timestamp: new Date()
    };

    res.status(200).json(response);

  } catch (error) {
    logger.error('Error getting chain metadata:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    });
  }
}