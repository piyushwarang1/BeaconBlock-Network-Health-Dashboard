import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { chainApi, priceApi, volumeApi, tokenApi } from '../lib/api';
import { Loading } from '../components/ui/Loading';
import { Button } from '../components/ui/Button';
import PriceChart from '../components/charts/PriceChart';
import VolumeChart from '../components/charts/VolumeChart';
import TokenDistributionChart from '../components/charts/TokenDistributionChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Input';
import { socket } from '../lib/socket';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign, 
  BarChart3, 
  Server,
  Users,
  Clock,
  Zap,
  Shield
} from 'lucide-react';

const RING_TOKEN_ID = 'darwinia-network-native-token';
const RING_PAIR_ADDRESS = '0x91c332a12a65a717d3d32a4434125d7597e83370';

export default function Dashboard() {
  const [days, setDays] = useState(7);
  const [selectedChainId, setSelectedChainId] = useState<string>('');
  const navigate = useNavigate();

  // Fetch chains
  const { data: chains = [], isLoading: isLoadingChains } = useQuery({
    queryKey: ['chains'],
    queryFn: () => chainApi.getChains(),
    select: (data) => data.data || [],
    refetchInterval: 30000,
  });

  // Set first chain as selected by default
  useEffect(() => {
    if (chains.length > 0 && !selectedChainId) {
      setSelectedChainId(chains[0].id);
    }
  }, [chains, selectedChainId]);

  // Fetch selected chain stats
  const { data: chainStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['chainStats', selectedChainId],
    queryFn: () => chainApi.getNetworkStats(selectedChainId),
    select: (data) => data.data,
    enabled: !!selectedChainId,
    refetchInterval: 10000,
  });

  // Fetch selected chain metadata
  const { data: chainMetadata, isLoading: isLoadingMetadata } = useQuery({
    queryKey: ['chainMetadata', selectedChainId],
    queryFn: () => chainApi.getChainMetadata(selectedChainId),
    select: (data) => data.data,
    enabled: !!selectedChainId,
  });

  // Fetch recent blocks for selected chain
  const { data: recentBlocks, isLoading: isLoadingBlocks } = useQuery({
    queryKey: ['recentBlocks', selectedChainId],
    queryFn: () => chainApi.getBlocks(selectedChainId, 10),
    select: (data) => data.data?.blocks || [],
    enabled: !!selectedChainId,
    refetchInterval: 10000,
  });

  // Listen for real-time updates
  useEffect(() => {
    if (!selectedChainId) return;

    const handleNewBlock = (data: any) => {
      if (data.chainId === selectedChainId) {
        console.log('New block received:', data);
      }
    };

    const handleStatsUpdate = (data: any) => {
      if (data.chainId === selectedChainId) {
        console.log('Stats updated:', data);
      }
    };

    socket.on('chain:newBlock', handleNewBlock);
    socket.on('chain:stats', handleStatsUpdate);

    // Subscribe to chain updates
    socket.emit('chain:subscribe', {
      chainId: selectedChainId,
      events: ['newBlock', 'stats']
    });

    return () => {
      socket.off('chain:newBlock', handleNewBlock);
      socket.off('chain:stats', handleStatsUpdate);
      socket.emit('chain:unsubscribe', { chainId: selectedChainId });
    };
  }, [selectedChainId]);

  // Fetch price data
  const { data: priceData, isLoading: isPriceLoading } = useQuery({
    queryKey: ['currentPrice', RING_TOKEN_ID],
    queryFn: () => priceApi.getCurrentPrice(RING_TOKEN_ID),
    select: (data) => data.data,
    refetchInterval: 60000,
  });

  // Fetch price history
  const { data: priceHistory, isLoading: isPriceHistoryLoading } = useQuery({
    queryKey: ['priceHistory', RING_TOKEN_ID, days],
    queryFn: () => priceApi.getPriceHistory(RING_TOKEN_ID, days),
    staleTime: 60 * 1000,
    select: (data) => data.data,
  });

  // Fetch volume data
  const { data: volumeData, isLoading: isVolumeLoading } = useQuery({
    queryKey: ['currentVolume', RING_PAIR_ADDRESS],
    queryFn: () => volumeApi.getCurrentVolume(RING_PAIR_ADDRESS),
    select: (data) => data.data,
    refetchInterval: 60000,
  });

  // Fetch volume history
  const { data: volumeHistory, isLoading: isVolumeHistoryLoading } = useQuery({
    queryKey: ['volumeHistory', RING_PAIR_ADDRESS, days],
    queryFn: () => volumeApi.getVolumeHistory(RING_PAIR_ADDRESS, days),
    staleTime: 60 * 1000,
    select: (data) => data.data,
  });

  // Fetch token distribution for selected chain
  const { data: tokenDistribution, isLoading: isTokenDistributionLoading } = useQuery({
    queryKey: ['tokenDistribution', selectedChainId],
    queryFn: () => tokenApi.getTokenDistribution(selectedChainId),
    select: (data) => data.data,
    enabled: !!selectedChainId,
  });

  // Calculate aggregate statistics
  const totalBlocks = chains.reduce((sum, chain) => 
    sum + (chain.detailedStatus?.latestBlockNumber || 0), 0
  );
  
  const totalValidators = chains.reduce((sum, chain) => 
    sum + (chain.detailedStatus?.activeValidators || 0), 0
  );

  const avgBlockTime = chains.length > 0
    ? chains.reduce((sum, chain) => sum + (chain.detailedStatus?.blockTime || 0), 0) / chains.length
    : 0;

  const selectedChain = chains.find(c => c.id === selectedChainId);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(price);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(2)}M`;
    }
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(2)}K`;
    }
    return `${volume.toFixed(2)}`;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (isNaN(num)) return '0';
    return (num / 1e18).toFixed(4);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Network Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive view of all network metrics and data
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-3 py-2 border rounded-lg bg-background"
          >
            <option value={1}>24 Hours</option>
            <option value={7}>7 Days</option>
            <option value={30}>30 Days</option>
            <option value={90}>90 Days</option>
          </select>
          <Button 
            variant="primary" 
            animation="ripple"
            onClick={() => navigate('/discovery')}
          >
            Add Network
          </Button>
        </div>
      </div>

      {/* Chain Selector */}
      {chains.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Chain</CardTitle>
            <CardDescription>Choose a chain to view detailed metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedChainId}
              onChange={(e) => setSelectedChainId(e.target.value)}
              options={chains.map(chain => ({
                value: chain.id,
                label: chain.name
              }))}
            />
          </CardContent>
        </Card>
      )}

      {/* Selected Chain Details */}
      {selectedChainId && selectedChain && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{selectedChain.name}</CardTitle>
                <CardDescription className="mt-2">
                  Chain ID: {selectedChainId}
                </CardDescription>
              </div>
              <Badge variant="default" size="lg">
                {selectedChain.status === 'connected' ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingStats || isLoadingMetadata ? (
              <Loading text="Loading chain data..." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Latest Block</p>
                  </div>
                  <p className="text-2xl font-bold">
                    {formatNumber(chainStats?.blockNumber || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Hash: {chainStats?.blockHash?.slice(0, 10)}...
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Finalized Block</p>
                  </div>
                  <p className="text-2xl font-bold">
                    {formatNumber(chainStats?.finalizedBlock || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Block Time: {chainStats?.blockTime || chainMetadata?.blockTime || 0}s
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Active Validators</p>
                  </div>
                  <p className="text-2xl font-bold">
                    {formatNumber(chainStats?.activeValidators || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total: {formatNumber(chainStats?.totalValidators || 0)}
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Network State</p>
                  </div>
                  <p className="text-2xl font-bold">
                    {chainStats?.networkState || 'Unknown'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Peers: {chainStats?.peers || 0}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Top Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Networks</p>
                <p className="text-2xl font-bold mt-1">{chains.length}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Server className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">RING Price</p>
                <p className="text-2xl font-bold mt-1">
                  {isPriceLoading ? (
                    <span className="text-muted-foreground">Loading...</span>
                  ) : (
                    formatPrice(priceData?.price || 0)
                  )}
                </p>
                {priceData?.priceChange24h !== undefined && (
                  <div className="flex items-center mt-1">
                    {priceData.priceChange24h >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={priceData.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {priceData.priceChange24h.toFixed(2)}%
                    </span>
                  </div>
                )}
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">24h Volume</p>
                <p className="text-2xl font-bold mt-1">
                  {isVolumeLoading ? (
                    <span className="text-muted-foreground">Loading...</span>
                  ) : (
                    formatVolume(volumeData?.volume24h || 0)
                  )}
                </p>
                {volumeData?.liquidity !== undefined && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Liquidity: {formatVolume(volumeData.liquidity)}
                  </p>
                )}
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Validators</p>
                <p className="text-2xl font-bold mt-1">{formatNumber(totalValidators)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Avg Block Time: {avgBlockTime.toFixed(1)}s
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Shield className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              RING Price History
            </CardTitle>
            <CardDescription>
              Price movement over the last {days} days
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isPriceHistoryLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <Loading text="Loading price data..." />
              </div>
            ) : (
              <PriceChart
                tokenId={RING_TOKEN_ID}
                days={days}
                data={priceHistory}
                height={300}
              />
            )}
          </CardContent>
        </Card>

        {/* Volume Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Trading Volume
            </CardTitle>
            <CardDescription>
              Volume activity over the last {days} days
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isVolumeHistoryLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <Loading text="Loading volume data..." />
              </div>
            ) : (
              <VolumeChart
                pairAddress={RING_PAIR_ADDRESS}
                days={days}
                data={volumeHistory}
                height={300}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Token Distribution Chart */}
      {selectedChainId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Token Distribution - {selectedChain?.name || 'Selected Chain'}
            </CardTitle>
            <CardDescription>
              Breakdown of token allocation across different categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isTokenDistributionLoading ? (
              <div className="h-[400px] flex items-center justify-center">
                <Loading text="Loading token distribution..." />
              </div>
            ) : tokenDistribution && tokenDistribution.length > 0 ? (
              <TokenDistributionChart
                data={tokenDistribution}
                title={`${selectedChain?.name || 'Chain'} Token Distribution`}
                height={400}
              />
            ) : (
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                No token distribution data available
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Market Statistics */}
      {priceData && (
        <Card>
          <CardHeader>
            <CardTitle>Market Statistics</CardTitle>
            <CardDescription>Detailed market metrics for RING token</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Market Cap</p>
                <p className="text-xl font-bold mt-1">
                  {formatVolume(priceData.marketCap || 0)}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">24h Volume</p>
                <p className="text-xl font-bold mt-1">
                  {formatVolume(priceData.volume24h || 0)}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">24h Change</p>
                <p className={`text-xl font-bold mt-1 ${priceData.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {priceData.priceChange24h >= 0 ? '+' : ''}{priceData.priceChange24h.toFixed(2)}%
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Data Source</p>
                <p className="text-xl font-bold mt-1 capitalize">
                  {priceData.source || 'N/A'}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="text-sm font-medium mt-1">
                  {priceData.lastUpdated 
                    ? new Date(priceData.lastUpdated).toLocaleString()
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Network Status */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Networks</CardTitle>
          <CardDescription>
            Real-time status of all connected blockchain networks
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingChains ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-48 bg-card animate-pulse rounded-lg border"
                />
              ))}
            </div>
          ) : chains.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Server className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Networks Connected</h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                Connect to a Substrate-based blockchain to start monitoring network health and metrics.
              </p>
              <Button 
                variant="primary" 
                animation="ripple"
                onClick={() => navigate('/discovery')}
              >
                Discover Networks
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chains.map(chain => (
                <Card key={chain.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{chain.name}</CardTitle>
                        <Badge variant="default" className="mt-1">Connected</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center">
                        <Zap className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>Block: {chain.detailedStatus?.latestBlockNumber?.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>Finalized: {chain.detailedStatus?.finalizedBlockNumber?.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>Validators: {chain.detailedStatus?.activeValidators?.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center col-span-2">
                        <Activity className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>
                          Latest Block: {chain.detailedStatus?.latestBlockTimestamp ? new Date(chain.detailedStatus.latestBlockTimestamp).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}