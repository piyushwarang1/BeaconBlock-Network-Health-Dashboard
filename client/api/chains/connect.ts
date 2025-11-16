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
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { wsUrl, name }: { wsUrl: string; name?: string } = req.body;

    if (!wsUrl) {
      res.status(400).json({
        success: false,
        error: 'WebSocket URL is required',
        timestamp: new Date()
      });
      return;
    }

    // Validate WebSocket URL format
    try {
      const url = new URL(wsUrl);
      if (!['ws:', 'wss:'].includes(url.protocol)) {
        throw new Error('Invalid WebSocket protocol');
      }
    } catch (error) {
      res.status(400).json({
        success: false,
        error: 'Invalid WebSocket URL format',
        timestamp: new Date()
      });
      return;
    }

    logger.info(`Attempting to connect to chain: ${wsUrl}`);

    // Create connection
    const provider = new WsProvider(wsUrl);
    const api = await ApiPromise.create({ provider });

    // Get basic metadata
    const [chainName, chainVersion] = await Promise.all([
      api.rpc.system.chain(),
      api.rpc.system.version()
    ]);

    const metadata = {
      name: name || chainName.toString(),
      chainName: chainName.toString(),
      specName: api.runtimeVersion.specName.toString(),
      specVersion: api.runtimeVersion.specVersion.toNumber(),
      implName: api.runtimeVersion.implName.toString(),
      implVersion: api.runtimeVersion.implVersion.toString(),
      blockTime: 6000, // Default 6 seconds for most Substrate chains
      ss58Format: api.registry.chainSS58 || 42
    };

    // Store connection (in production, use persistent storage)
    const connectionId = `chain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    activeConnections.set(connectionId, {
      id: connectionId,
      name: metadata.name,
      wsUrl,
      api,
      metadata,
      connectedAt: new Date()
    });

    const response = {
      success: true,
      data: metadata,
      timestamp: new Date()
    };

    // Clean up connection after response (serverless limitation)
    setTimeout(() => {
      api.disconnect().catch(console.error);
      activeConnections.delete(connectionId);
    }, 30000); // Keep alive for 30 seconds

    res.status(201).json(response);

  } catch (error) {
    logger.error('Error connecting to chain:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to connect to chain',
      timestamp: new Date()
    });
  }
}