import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { chainApi, priceApi, volumeApi, tokenApi } from '../lib/api';
import { Loading } from '../components/ui/Loading';
import { Button } from '../components/ui/Button';
import { SimpleTooltip } from '../components/ui/Tooltip';
import PriceChart from '../components/charts/PriceChart';
import VolumeChart from '../components/charts/VolumeChart';
import TokenDistributionChart from '../components/charts/TokenDistributionChart';
import { Select } from '../components/ui/Input';
import { socket } from '../lib/socket';
import {
  TrendingUp,
  DollarSign,
  BarChart3,
  Server,
  Users,
  Clock,
  Zap,
  Shield,
  Network
} from 'lucide-react';

const RING_TOKEN_ID = 'darwinia-network-native-token';
const RING_PAIR_ADDRESS = '0x91c332a12a65a717d3d32a4434125d7597e83370';

export default function Dashboard() {
  const [days, setDays] = useState(7);
  const [selectedChainId, setSelectedChainId] = useState<string>('');
  const navigate = useNavigate();

  // Fetch chains
  const { data: chains = [] } = useQuery({
    queryKey: ['chains'],
    queryFn: () => chainApi.getChains(),
    select: (data) => data.data || [],
    refetchInterval: 30000,
  });

  // Set first chain as selected by default
  useEffect(() => {
    if (chains?.length > 0 && !selectedChainId) {
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
  const { data: priceData } = useQuery({
    queryKey: ['currentPrice', RING_TOKEN_ID],
    queryFn: () => priceApi.getCurrentPrice(RING_TOKEN_ID),
    select: (data) => data.data,
    refetchInterval: 60000,
  });

  // Fetch price history
   const { isLoading: isPriceHistoryLoading } = useQuery({
     queryKey: ['priceHistory', RING_TOKEN_ID, days],
     queryFn: () => priceApi.getPriceHistory(RING_TOKEN_ID, days),
     staleTime: 60 * 1000,
     select: (data) => data.data,
   });

  // Fetch volume data
  const {} = useQuery({
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
   const totalValidators = chains?.reduce((sum: number, chain: any) =>
     sum + (chain.detailedStatus?.activeValidators || 0), 0
   ) || 0;

   const avgBlockTime = chains?.length > 0
     ? chains.reduce((sum: number, chain: any) => sum + (chain.detailedStatus?.blockTime || 0), 0) / chains.length
     : 0;

   const selectedChain = chains?.find((c: any) => c.id === selectedChainId);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(price);
  };


  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">

          {/* Header Section */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 rounded-xl">
                  <Network className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Network Dashboard</h1>
                  <p className="mt-2 text-slate-600 dark:text-slate-300 text-lg">
                    Real-time monitoring and analytics for Substrate-based blockchain networks
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <select
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value={1}>24 Hours</option>
                    <option value={7}>7 Days</option>
                    <option value={30}>30 Days</option>
                    <option value={90}>90 Days</option>
                  </select>
                </div>
                <Button
                  variant="primary"
                  onClick={() => navigate('/discovery')}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Server className="h-5 w-5 mr-2" />
                  Add Network
                </Button>
              </div>
            </div>
          </div>

          {/* Network Overview Summary */}
          <div className="bg-blue-50 dark:bg-slate-800 rounded-2xl p-6 border border-blue-200 dark:border-slate-700 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/50 dark:to-indigo-800/50 rounded-xl">
                <Network className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Network Overview</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">Key metrics across all monitored networks</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <SimpleTooltip content="Total number of blockchain networks currently connected and monitored">
                <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-700/30 rounded-xl p-6 border border-slate-200/50 dark:border-slate-600/50 hover:shadow-lg transition-all duration-300 cursor-help">
                  <div className="flex items-center justify-between mb-4">
                    <Server className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">TOTAL</span>
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{chains?.length || 0}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Connected Networks</div>
                </div>
              </SimpleTooltip>

              <SimpleTooltip content="Sum of active validators across all connected networks">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 rounded-xl p-6 border border-emerald-200/50 dark:border-emerald-800/50 hover:shadow-lg transition-all duration-300 cursor-help">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-1 rounded-full">ACTIVE</span>
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{formatNumber(totalValidators)}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Total Validators</div>
                </div>
              </SimpleTooltip>

              <SimpleTooltip content="Average time between blocks across all networks">
                <div className="bg-gradient-to-br from-cyan-50 to-cyan-100/50 dark:from-cyan-950/30 dark:to-cyan-900/20 rounded-xl p-6 border border-cyan-200/50 dark:border-cyan-800/50 hover:shadow-lg transition-all duration-300 cursor-help">
                  <div className="flex items-center justify-between mb-4">
                    <Clock className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                    <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-900/50 px-2 py-1 rounded-full">AVG</span>
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{avgBlockTime.toFixed(1)}s</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Avg Block Time</div>
                </div>
              </SimpleTooltip>

              <SimpleTooltip content="Current market price of RING token">
                <div className="bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-950/30 dark:to-rose-900/20 rounded-xl p-6 border border-rose-200/50 dark:border-rose-800/50 hover:shadow-lg transition-all duration-300 cursor-help">
                  <div className="flex items-center justify-between mb-4">
                    <DollarSign className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                    <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/50 px-2 py-1 rounded-full">RING</span>
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{priceData ? formatPrice(priceData.price) : 'N/A'}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Current Price</div>
                </div>
              </SimpleTooltip>
            </div>
          </div>

          {/* Chain Selector */}
        {chains.length > 0 && (
          <div className="mb-8">
            <div className="bg-green-50 dark:bg-slate-800 rounded-2xl p-6 border border-green-200 dark:border-slate-700 shadow-lg">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">Network Selection</h3>
                  <p className="text-slate-600 dark:text-slate-300">Choose a blockchain network to monitor in detail</p>
                </div>
                <Select
                  value={selectedChainId}
                  onChange={(e) => setSelectedChainId(e.target.value)}
                  options={chains?.map((chain: any) => ({
                    value: chain.id,
                    label: chain.name
                  })) || []}
                  className="min-w-[250px]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Selected Chain Details */}
        {selectedChainId && selectedChain && (
          <div className="mb-8">
            <div className="bg-purple-50 dark:bg-slate-800 rounded-2xl p-8 border border-purple-200 dark:border-slate-700 shadow-lg">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{selectedChain.name}</h3>
                  <p className="text-slate-600 dark:text-slate-300">Real-time network statistics and health metrics</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                    selectedChain.status === 'connected'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      selectedChain.status === 'connected' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm font-medium">
                      {selectedChain.status === 'connected' ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                </div>
              </div>

              {isLoadingStats || isLoadingMetadata ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6 border border-slate-200 dark:border-slate-600">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-6 h-6 bg-slate-200 dark:bg-slate-600 rounded animate-pulse"></div>
                        <div className="w-12 h-4 bg-slate-200 dark:bg-slate-600 rounded animate-pulse"></div>
                      </div>
                      <div className="w-16 h-8 bg-slate-200 dark:bg-slate-600 rounded animate-pulse mb-2"></div>
                      <div className="w-20 h-4 bg-slate-200 dark:bg-slate-600 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <SimpleTooltip content="The most recent block number processed on this blockchain network">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 rounded-xl p-6 border border-blue-200/50 dark:border-blue-800/50 hover:shadow-lg transition-all duration-300 cursor-help">
                      <div className="flex items-center justify-between mb-4">
                        <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded-full">LIVE</span>
                      </div>
                      <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{formatNumber(chainStats?.blockNumber || 0)}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Latest Block</div>
                    </div>
                  </SimpleTooltip>

                  <SimpleTooltip content="Average time to produce a new block on this network">
                    <div className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 rounded-xl p-6 border border-green-200/50 dark:border-green-800/50 hover:shadow-lg transition-all duration-300 cursor-help">
                      <div className="flex items-center justify-between mb-4">
                        <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
                        <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 px-2 py-1 rounded-full">ACTIVE</span>
                      </div>
                      <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{chainStats?.blockTime || chainMetadata?.blockTime || 0}s</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Block Time</div>
                    </div>
                  </SimpleTooltip>

                  <SimpleTooltip content="Number of validators currently participating in consensus">
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 rounded-xl p-6 border border-purple-200/50 dark:border-purple-800/50 hover:shadow-lg transition-all duration-300 cursor-help">
                      <div className="flex items-center justify-between mb-4">
                        <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50 px-2 py-1 rounded-full">SECURE</span>
                      </div>
                      <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{formatNumber(chainStats?.activeValidators || 0)}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Active Validators</div>
                    </div>
                  </SimpleTooltip>

                  <SimpleTooltip content="Number of peer nodes connected to this network">
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20 rounded-xl p-6 border border-orange-200/50 dark:border-orange-800/50 hover:shadow-lg transition-all duration-300 cursor-help">
                      <div className="flex items-center justify-between mb-4">
                        <Shield className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/50 px-2 py-1 rounded-full">STABLE</span>
                      </div>
                      <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{chainStats?.peers || 0}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Network Peers</div>
                    </div>
                  </SimpleTooltip>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Price Chart */}
          <div className="bg-yellow-50 dark:bg-slate-800 rounded-2xl p-6 border border-yellow-200 dark:border-slate-700 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50 rounded-xl">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Price Analytics</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">RING token price movement over time</p>
              </div>
            </div>
            {isPriceHistoryLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <Loading text="Loading price data..." />
              </div>
            ) : (
              <PriceChart
                tokenId={RING_TOKEN_ID}
                days={days}
                height={300}
              />
            )}
          </div>

          {/* Volume Chart */}
          <div className="bg-orange-50 dark:bg-slate-800 rounded-2xl p-6 border border-orange-200 dark:border-slate-700 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50 rounded-xl">
                <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Volume Analytics</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">Trading volume activity trends</p>
              </div>
            </div>
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
          </div>
        </div>

        {/* Token Distribution Chart */}
        {selectedChainId && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-lg mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/50 dark:to-orange-800/50 rounded-xl">
                <Shield className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Token Distribution</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">{selectedChain?.name || 'Selected Chain'} token allocation breakdown</p>
              </div>
            </div>
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
              <div className="h-[400px] flex items-center justify-center text-slate-500 dark:text-slate-400">
                No token distribution data available
              </div>
            )}
          </div>
        )}

        {/* Network Status */}
        {chains.length > 0 && (
          <div className="bg-red-50 dark:bg-slate-800 rounded-2xl p-6 border border-red-200 dark:border-slate-700 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 rounded-xl">
                <Server className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Network Status</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">Real-time status of all connected networks</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {chains?.map((chain: any) => (
                <SimpleTooltip key={chain.id} content={`Real-time status for ${chain.name} network`}>
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-700/30 rounded-xl p-6 border border-slate-200/50 dark:border-slate-600/50 hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 rounded-lg">
                          <Server className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">{chain.name}</h4>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                        chain.status === 'connected'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          chain.status === 'connected' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        {chain.status === 'connected' ? 'Connected' : 'Disconnected'}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                          <span className="text-sm text-slate-600 dark:text-slate-400">Latest Block</span>
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-white">{chain.detailedStatus?.latestBlockNumber?.toLocaleString() || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                          <span className="text-sm text-slate-600 dark:text-slate-400">Validators</span>
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-white">{chain.detailedStatus?.activeValidators?.toLocaleString() || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                          <span className="text-sm text-slate-600 dark:text-slate-400">Block Time</span>
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-white">{chain.detailedStatus?.blockTime || 'N/A'}s</span>
                      </div>
                    </div>
                  </div>
                </SimpleTooltip>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}