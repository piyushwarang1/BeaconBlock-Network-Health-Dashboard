import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const healthCheck = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const response = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      services: {
        chains: 0, // In serverless, we don't maintain persistent connections
        evmChains: 0
      }
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
    console.error('Health check error:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'Health check failed',
        timestamp: new Date()
      })
    };
  }
};