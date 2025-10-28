import { Logger } from 'winston';
import axios from 'axios';

interface TokenPrice {
  tokenId: string;
  symbol: string;
  name: string;
  price: number;
  priceChange24h: number;
  marketCap?: number;
  volume24h?: number;
  lastUpdated: Date;
}

interface PriceHistoryPoint {
  timestamp: Date;
  price: number;
  volume?: number;
}

export class PriceService {
  private logger: Logger;
  private priceCache: Map<string, { data: TokenPrice; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 60000; // 1 minute cache
  private readonly COINGECKO_API = 'https://api.coingecko.com/api/v3';

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Get current price for a token
   */
  async getTokenPrice(tokenId: string): Promise<TokenPrice | null> {
    try {
      // Check cache first
      const cached = this.priceCache.get(tokenId);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return cached.data;
      }

      // Try to fetch from CoinGecko
      try {
        const response = await axios.get(
          `${this.COINGECKO_API}/coins/${tokenId}`,
          {
            params: {
              localization: false,
              tickers: false,
              market_data: true,
              community_data: false,
              developer_data: false
            },
            timeout: 5000
          }
        );

        const data = response.data;
        const priceData: TokenPrice = {
          tokenId,
          symbol: data.symbol?.toUpperCase() || 'UNKNOWN',
          name: data.name || 'Unknown Token',
          price: data.market_data?.current_price?.usd || 0,
          priceChange24h: data.market_data?.price_change_percentage_24h || 0,
          marketCap: data.market_data?.market_cap?.usd,
          volume24h: data.market_data?.total_volume?.usd,
          lastUpdated: new Date()
        };

        // Cache the result
        this.priceCache.set(tokenId, {
          data: priceData,
          timestamp: Date.now()
        });

        return priceData;
      } catch (apiError) {
        this.logger.warn(`CoinGecko API error for ${tokenId}, using mock data`);
        return this.generateMockPrice(tokenId);
      }
    } catch (error) {
      this.logger.error(`Error getting token price for ${tokenId}:`, error);
      return this.generateMockPrice(tokenId);
    }
  }

  /**
   * Get price history for a token
   */
  async getPriceHistory(tokenId: string, days: number): Promise<PriceHistoryPoint[]> {
    try {
      // Try to fetch from CoinGecko
      try {
        const response = await axios.get(
          `${this.COINGECKO_API}/coins/${tokenId}/market_chart`,
          {
            params: {
              vs_currency: 'usd',
              days: days,
              interval: days <= 1 ? 'hourly' : 'daily'
            },
            timeout: 5000
          }
        );

        const prices = response.data.prices || [];
        return prices.map(([timestamp, price]: [number, number]) => ({
          timestamp: new Date(timestamp),
          price,
          volume: 0
        }));
      } catch (apiError) {
        this.logger.warn(`CoinGecko API error for ${tokenId} history, using mock data`);
        return this.generateMockPriceHistory(days);
      }
    } catch (error) {
      this.logger.error(`Error getting price history for ${tokenId}:`, error);
      return this.generateMockPriceHistory(days);
    }
  }

  /**
   * Get supported tokens
   */
  getSupportedTokens(): string[] {
    return [
      'darwinia-network-native-token',
      'polkadot',
      'kusama',
      'ethereum',
      'bitcoin'
    ];
  }

  /**
   * Generate mock price data for testing
   */
  private generateMockPrice(tokenId: string): TokenPrice {
    const basePrice = Math.random() * 10;
    const change = (Math.random() - 0.5) * 20;

    return {
      tokenId,
      symbol: tokenId.split('-')[0].toUpperCase(),
      name: tokenId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      price: basePrice,
      priceChange24h: change,
      marketCap: basePrice * 1000000000,
      volume24h: basePrice * 10000000,
      lastUpdated: new Date()
    };
  }

  /**
   * Generate mock price history for testing
   */
  private generateMockPriceHistory(days: number): PriceHistoryPoint[] {
    const history: PriceHistoryPoint[] = [];
    const now = Date.now();
    const basePrice = 0.05;
    const points = days * 24; // Hourly data

    // Use current minute as seed for time-based variation to simulate updates
    const minuteSeed = Math.floor(now / 60000);

    for (let i = points; i >= 0; i--) {
      const timestamp = new Date(now - i * 60 * 60 * 1000);
      const trend = (points - i) * 0.0001; // Slight upward trend over time

      // Create deterministic but time-varying noise based on timestamp and current time
      const timeBasedSeed = timestamp.getTime() + minuteSeed;
      const variation = (this.simpleHash(timeBasedSeed) - 0.5) * 0.02;

      const price = basePrice + trend + variation;

      history.push({
        timestamp,
        price: Math.max(0.001, price),
        volume: Math.random() * 100000
      });
    }

    return history;
  }

  /**
   * Simple hash function for deterministic pseudo-random values
   */
  private simpleHash(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }
}
