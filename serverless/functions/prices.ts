import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import axios from 'axios';
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

// CoinGecko API base URL
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

export const getCurrentPrice = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { tokenId } = event.pathParameters || {};

    if (!tokenId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'Token ID is required',
          timestamp: new Date()
        })
      };
    }

    // Fetch current price from CoinGecko
    const response = await axios.get(`${COINGECKO_BASE_URL}/simple/price`, {
      params: {
        ids: tokenId,
        vs_currencies: 'usd',
        include_24hr_change: true,
        include_last_updated_at: true
      },
      timeout: 10000
    });

    const data = response.data[tokenId];
    if (!data) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'Token not found',
          timestamp: new Date()
        })
      };
    }

    const priceData = {
      tokenId,
      price: data.usd,
      priceChange24h: data.usd_24h_change,
      lastUpdated: new Date(data.last_updated_at * 1000),
      source: 'coingecko'
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
        data: priceData,
        timestamp: new Date()
      })
    };

  } catch (error) {
    logger.error('Error getting current price:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get price data',
        timestamp: new Date()
      })
    };
  }
};

export const getPriceHistory = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { tokenId } = event.pathParameters || {};
    const { days = '7' } = event.queryStringParameters || {};

    if (!tokenId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'Token ID is required',
          timestamp: new Date()
        })
      };
    }

    const daysNum = Math.min(parseInt(days) || 7, 365); // Max 365 days

    // Fetch price history from CoinGecko
    const response = await axios.get(`${COINGECKO_BASE_URL}/coins/${tokenId}/market_chart`, {
      params: {
        vs_currency: 'usd',
        days: daysNum,
        interval: daysNum <= 1 ? 'hourly' : 'daily'
      },
      timeout: 15000
    });

    const prices = response.data.prices.map(([timestamp, price]: [number, number]) => ({
      timestamp: new Date(timestamp),
      price
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
        data: prices,
        timestamp: new Date()
      })
    };

  } catch (error) {
    logger.error('Error getting price history:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get price history',
        timestamp: new Date()
      })
    };
  }
};