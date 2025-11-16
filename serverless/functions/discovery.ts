import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
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

// Known Substrate chains for discovery
const KNOWN_CHAINS = [
  {
    name: 'Polkadot',
    wsUrl: 'wss://rpc.polkadot.io',
    chainId: 'polkadot',
    type: 'relay-chain'
  },
  {
    name: 'Kusama',
    wsUrl: 'wss://kusama-rpc.polkadot.io',
    chainId: 'kusama',
    type: 'relay-chain'
  },
  {
    name: 'Astar',
    wsUrl: 'wss://rpc.astar.network',
    chainId: 'astar',
    type: 'parachain'
  },
  {
    name: 'Moonbeam',
    wsUrl: 'wss://wss.api.moonbeam.network',
    chainId: 'moonbeam',
    type: 'parachain'
  },
  {
    name: 'Acala',
    wsUrl: 'wss://acala-rpc-0.aca-api.network',
    chainId: 'acala',
    type: 'parachain'
  }
];

export const getEndpoints = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { includeTestnets = 'false' } = event.queryStringParameters || {};
    const includeTestnetsBool = includeTestnets === 'true';

    // Filter chains based on testnet preference
    const filteredChains = includeTestnetsBool
      ? KNOWN_CHAINS
      : KNOWN_CHAINS.filter(chain => !chain.name.toLowerCase().includes('test'));

    const endpoints = filteredChains.map(chain => ({
      name: chain.name,
      wsUrl: chain.wsUrl,
      chainId: chain.chainId,
      type: chain.type,
      status: 'unknown' // In serverless, we don't maintain persistent connections
    }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      },
      body: JSON.stringify({
        success: true,
        data: endpoints,
        timestamp: new Date()
      })
    };

  } catch (error) {
    logger.error('Error getting endpoints:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get endpoints',
        timestamp: new Date()
      })
    };
  }
};

export const testEndpoint = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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

    // In serverless environment, we can't maintain persistent connections
    // So we just validate the URL format and return success
    const result = {
      wsUrl,
      name: name || 'Unknown Chain',
      status: 'valid',
      message: 'WebSocket URL format is valid (connection test not performed in serverless environment)',
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
      body: JSON.stringify({
        success: true,
        data: result,
        timestamp: new Date()
      })
    };

  } catch (error) {
    logger.error('Error testing endpoint:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to test endpoint',
        timestamp: new Date()
      })
    };
  }
};