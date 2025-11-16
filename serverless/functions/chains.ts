import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
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

// In-memory storage for demo purposes (in production, use DynamoDB or similar)
const activeConnections = new Map<string, any>();

export const getChains = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      },
      body: JSON.stringify(response)
    };
  } catch (error) {
    logger.error('Error getting chains:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      })
    };
  }
};

export const connectChain = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { wsUrl, name }: { wsUrl: string; name?: string } = body;

    if (!wsUrl) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'WebSocket URL is required',
          timestamp: new Date()
        })
      };
    }

    // Validate WebSocket URL format
    try {
      const url = new URL(wsUrl);
      if (!['ws:', 'wss:'].includes(url.protocol)) {
        throw new Error('Invalid WebSocket protocol');
      }
    } catch (error) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'Invalid WebSocket URL format',
          timestamp: new Date()
        })
      };
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

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      },
      body: JSON.stringify(response)
    };

  } catch (error) {
    logger.error('Error connecting to chain:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to connect to chain',
        timestamp: new Date()
      })
    };
  }
};

export const getChainMetadata = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { chainId } = event.pathParameters || {};

    if (!chainId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'Chain ID is required',
          timestamp: new Date()
        })
      };
    }

    // For serverless, we'll create a temporary connection
    const connection = activeConnections.get(chainId);
    if (!connection) {
      // Try to create a temporary connection based on stored info
      // In production, you'd store connection details in a database
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'Chain not found',
          timestamp: new Date()
        })
      };
    }

    const response = {
      success: true,
      data: connection.metadata,
      timestamp: new Date()
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      },
      body: JSON.stringify(response)
    };

  } catch (error) {
    logger.error('Error getting chain metadata:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      })
    };
  }
};

export const getChainStats = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { chainId } = event.pathParameters || {};

    if (!chainId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'Chain ID is required',
          timestamp: new Date()
        })
      };
    }

    // Create temporary connection to get stats
    const connection = activeConnections.get(chainId);
    if (!connection) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'Chain not found',
          timestamp: new Date()
        })
      };
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

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      },
      body: JSON.stringify(response)
    };

  } catch (error) {
    logger.error('Error getting chain stats:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      })
    };
  }
};

export const getChainBlocks = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { chainId } = event.pathParameters || {};
    const { limit = '10' } = event.queryStringParameters || {};

    if (!chainId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'Chain ID is required',
          timestamp: new Date()
        })
      };
    }

    const connection = activeConnections.get(chainId);
    if (!connection) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'Chain not found',
          timestamp: new Date()
        })
      };
    }

    // Get recent blocks
    const limitNum = Math.min(parseInt(limit) || 10, 50);
    const blocks: any[] = [];

    const latestHeader = await connection.api.rpc.chain.getHeader();
    const latestNumber = latestHeader.number.toNumber();

    for (let i = 0; i < limitNum; i++) {
      const blockNumber = latestNumber - i;
      if (blockNumber < 0) break;

      try {
        const blockHash = await connection.api.rpc.chain.getBlockHash(blockNumber);
        const signedBlock = await connection.api.rpc.chain.getBlock(blockHash);

        blocks.push({
          number: blockNumber,
          hash: blockHash.toString(),
          timestamp: new Date(),
          extrinsicsCount: signedBlock.block.extrinsics.length,
          parentHash: signedBlock.block.header.parentHash.toString()
        });
      } catch (error) {
        logger.warn(`Error getting block ${blockNumber}:`, error);
        break;
      }
    }

    const response = {
      success: true,
      data: {
        blocks,
        pagination: {
          total: blocks.length,
          page: 1,
          limit: limitNum,
          pages: 1
        }
      },
      timestamp: new Date()
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      },
      body: JSON.stringify(response)
    };

  } catch (error) {
    logger.error('Error getting chain blocks:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      })
    };
  }
};

export const getTokenDistribution = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { chainId } = event.pathParameters || {};

    if (!chainId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'Chain ID is required',
          timestamp: new Date()
        })
      };
    }

    // Mock token distribution data (in production, query actual chain data)
    const mockTotal = 1000000000; // 1 billion tokens
    const distributionData = [
      { category: 'Validators & Nominators', amount: mockTotal * 0.4, percentage: 40, color: '#3B82F6' },
      { category: 'Treasury & Reserves', amount: mockTotal * 0.25, percentage: 25, color: '#10B981' },
      { category: 'Liquidity Pools', amount: mockTotal * 0.15, percentage: 15, color: '#F59E0B' },
      { category: 'Community & Airdrops', amount: mockTotal * 0.12, percentage: 12, color: '#EF4444' },
      { category: 'Team & Advisors', amount: mockTotal * 0.08, percentage: 8, color: '#8B5CF6' },
    ];

    const response = {
      success: true,
      data: distributionData,
      timestamp: new Date()
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      },
      body: JSON.stringify(response)
    };

  } catch (error) {
    logger.error('Error getting token distribution:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      })
    };
  }
};