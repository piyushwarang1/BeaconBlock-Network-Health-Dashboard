import { ApiPromise } from '@polkadot/api';

export interface ChainInfo {
  id: string;
  name: string;
  wsUrl: string;
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastConnected?: Date;
  error?: string;
}

export interface ChainMetadata {
  id: string;
  name: string;
  version: string;
  genesisHash: string;
  ss58Format: number;
  tokenSymbol: string;
  tokenDecimals: number;
  blockTime: number;
  properties: Record<string, any>;
  runtimeVersion: {
    specName: string;
    specVersion: number;
    implVersion: number;
    authoringVersion: number;
    transactionVersion: number;
  };
}

export interface NetworkStats {
  chainId: string;
  timestamp: Date;
  blockNumber: number;
  blockHash: string;
  blockTime: number;
  finalizedBlock: number;
  totalIssuance: string;
  activeValidators: number;
  waitingValidators: number;
  totalValidators: number;
  era: number;
  epoch: number;
  sessionProgress: number;
}

export interface ValidatorInfo {
  accountId: string;
  stash: string;
  controller?: string;
  commission: string;
  blocked: boolean;
  identity?: {
    display?: string;
    legal?: string;
    web?: string;
    riot?: string;
    email?: string;
    twitter?: string;
  };
  exposure: {
    total: string;
    own: string;
    others: Array<{
      who: string;
      value: string;
    }>;
  };
  prefs: {
    commission: string;
    blocked: boolean;
  };
  nominators: string[];
  rewardPoints: number;
  slashes: Array<{
    era: number;
    amount: string;
    reason: string;
  }>;
}

export interface BlockInfo {
  number: number;
  hash: string;
  parentHash: string;
  timestamp: Date;
  author?: string;
  extrinsicsCount: number;
  eventsCount: number;
  size: number;
  finalized: boolean;
  justification?: any;
}

export interface ExtrinsicInfo {
  blockNumber: number;
  blockHash: string;
  index: number;
  hash: string;
  method: string;
  section: string;
  args: any[];
  signer?: string;
  nonce?: number;
  tip?: string;
  success: boolean;
  error?: string;
  events: EventInfo[];
  fee?: string;
}

export interface EventInfo {
  blockNumber: number;
  blockHash: string;
  index: number;
  method: string;
  section: string;
  data: any[];
  phase: {
    type: string;
    value?: number;
  };
}

export interface ChainConnection {
  api: ApiPromise;
  metadata: ChainMetadata;
  info: ChainInfo;
  stats?: NetworkStats;
  validators?: ValidatorInfo[];
  recentBlocks: BlockInfo[];
  subscriptions: Map<string, () => void>;
}

export interface SocketEvents {
  'chain:connected': (chainId: string, metadata: ChainMetadata) => void;
  'chain:disconnected': (chainId: string) => void;
  'chain:error': (chainId: string, error: string) => void;
  'chain:stats': (stats: NetworkStats) => void;
  'chain:newBlock': (chainId: string, block: BlockInfo) => void;
  'chain:finalizedBlock': (chainId: string, blockNumber: number) => void;
  'validators:updated': (chainId: string, validators: ValidatorInfo[]) => void;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ChainConnectionRequest {
  wsUrl: string;
  name?: string;
}

export interface ChainListResponse extends ApiResponse<ChainInfo[]> {}

export interface ChainMetadataResponse extends ApiResponse<ChainMetadata> {}

export interface NetworkStatsResponse extends ApiResponse<NetworkStats> {}

export interface ValidatorsResponse extends ApiResponse<ValidatorInfo[]> {}

export interface BlocksResponse extends PaginatedResponse<BlockInfo> {}

export interface ExtrinsicsResponse extends PaginatedResponse<ExtrinsicInfo> {}

export interface EventsResponse extends PaginatedResponse<EventInfo> {}

export interface EVMChainInfo extends ChainInfo {
  rpcUrl: string;
  chainId: number;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorerUrl?: string;
}

export interface EVMTransaction {
  hash: string;
  blockNumber: number;
  blockHash: string;
  timestamp: Date;
  from: string;
  to?: string;
  value: string;
  gasPrice: string;
  gasLimit: string;
  gasUsed?: string;
  status: boolean;
  contractAddress?: string | null;
  logs: EVMLog[];
  fee?: string;
  method?: string;
}

export interface EVMLog {
  address: string;
  topics: string[];
  data: string;
  logIndex: number;
  transactionHash: string;
  blockNumber: number;
  decoded?: {
    event: string;
    args: any[];
  };
}

export interface PriceData {
  token: string;
  symbol: string;
  price: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  timestamp: Date;
  source: string;
  lastUpdated: Date;
}

export interface VolumeData {
  pair: string;
  token0: string;
  token1: string;
  volume24h: number;
  liquidity: number;
  price: number;
  timestamp: Date;
  dex: string;
  fee?: number;
}

export interface TimeSeriesData<T> {
  data: T[];
  timeframe: '1h' | '4h' | '1d' | '7d' | '30d';
  interval: number; // minutes
  startTime: Date;
  endTime: Date;
}

export interface ChainStats {
  substrate: NetworkStats;
  evm?: {
    chainId: number;
    blockNumber: number;
    gasPrice: string;
    tps: number;
    activeAddresses: number;
  };
}