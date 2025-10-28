import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Chain API
export const chainApi = {
  connectChain: async (wsUrl: string, name?: string) => {
    const response = await apiClient.post('/chains/connect', { wsUrl, name });
    return response.data;
  },
  getChains: async () => {
    const response = await apiClient.get('/chains');
    return response.data;
  },
  getNetworkStats: async (chainId: string) => {
    const response = await apiClient.get(`/chains/${chainId}/stats`);
    return response.data;
  },
  getChainMetadata: async (chainId: string) => {
    const response = await apiClient.get(`/chains/${chainId}/metadata`);
    return response.data;
  },
  getBlocks: async (chainId: string, limit: number = 10) => {
    const response = await apiClient.get(`/chains/${chainId}/blocks`, {
      params: { limit }
    });
    return response.data;
  },
};

// Discovery API
export const discoveryApi = {
  getEndpoints: async (includeTestnets: boolean = false) => {
    const response = await apiClient.get('/discovery/endpoints', {
      params: { includeTestnets }
    });
    return response.data;
  },
  scanChains: async (includeTestnets: boolean = false) => {
    const response = await apiClient.get('/discovery/scan', {
      params: { includeTestnets }
    });
    return response.data;
  },
  testEndpoint: async (wsUrl: string, name?: string) => {
    const response = await apiClient.post('/discovery/test', { wsUrl, name });
    return response.data;
  },
};

// EVM API
export const evmApi = {
  getEvmChains: async () => {
    const response = await apiClient.get('/evm/chains');
    return response.data;
  },
};

// Price API
export const priceApi = {
  getPrice: async (tokenId: string) => {
    const response = await apiClient.get(`/prices/${tokenId}`);
    return response.data;
  },

  getCurrentPrice: async (tokenId: string) => {
    const response = await apiClient.get(`/prices/${tokenId}`);
    return response.data;
  },

  getPriceHistory: async (tokenId: string, days: number = 7) => {
    const response = await apiClient.get(`/prices/${tokenId}/history`, {
      params: { days }
    });
    return response.data;
  },

  getSupportedTokens: async () => {
    const response = await apiClient.get('/prices/tokens/list');
    return response.data;
  },
};

// Volume API
export const volumeApi = {
  getVolume: async (pair: string) => {
    const response = await apiClient.get(`/volume/pairs/${pair}`);
    return response.data;
  },
  getCurrentVolume: async (pair: string) => {
    const response = await apiClient.get(`/volume/pairs/${pair}`);
    return response.data;
  },
  getVolumeHistory: async (pair: string, days: number = 7) => {
    const response = await apiClient.get(`/volume/pairs/${pair}/history`, {
      params: { days }
    });
    return response.data;
  },
};

// Validator API
export const validatorApi = {
  getValidators: async (chainId: string, limit: number = 50, offset: number = 0) => {
    const response = await apiClient.get(`/chains/${chainId}/validators`, {
      params: { limit, offset }
    });
    return response.data;
  },
  getValidatorDetails: async (chainId: string, validatorId: string) => {
    const response = await apiClient.get(`/chains/${chainId}/validators/${validatorId}`);
    return response.data;
  },
};

// Token Distribution API
export const tokenApi = {
  getTokenDistribution: async (chainId: string) => {
    const response = await apiClient.get(`/chains/${chainId}/token-distribution`);
    return response.data;
  },
};

export default apiClient;