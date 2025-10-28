import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { discoveryApi, chainApi } from '../lib/api'
import { useState, useEffect } from 'react'
import { Loading } from '../components/ui/Loading'
import { Input } from '../components/ui/Input'
import { Network, Loader2, Check, X, AlertTriangle, ExternalLink, RefreshCw } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { Badge } from '../components/ui/Badge'

interface ChainEndpoint {
  name: string;
  wsUrl: string;
  description?: string;
  isTestnet?: boolean;
  isRelay?: boolean;
  isParachain?: boolean;
  parachainId?: number;
}

interface DiscoveryResult {
  endpoint: ChainEndpoint;
  metadata: any;
  isReachable: boolean;
  responseTime: number;
  error?: string;
}

// Fallback endpoints in case backend is not available
const FALLBACK_ENDPOINTS: ChainEndpoint[] = [
  {
    name: 'Polkadot',
    wsUrl: 'wss://rpc.polkadot.io',
    description: 'Polkadot Relay Chain',
    isTestnet: false,
    isRelay: true
  },
  {
    name: 'Kusama',
    wsUrl: 'wss://kusama-rpc.polkadot.io',
    description: 'Kusama Relay Chain',
    isTestnet: false,
    isRelay: true
  },
  {
    name: 'Westend',
    wsUrl: 'wss://westend-rpc.polkadot.io',
    description: 'Westend Test Network',
    isTestnet: true,
    isRelay: true
  },
  {
    name: 'Acala',
    wsUrl: 'wss://acala-rpc.dwellir.com',
    description: 'Acala DeFi Hub',
    isTestnet: false,
    isParachain: true,
    parachainId: 2000
  },
  {
    name: 'Moonbeam',
    wsUrl: 'wss://wss.api.moonbeam.network',
    description: 'Moonbeam Smart Contract Platform',
    isTestnet: false,
    isParachain: true,
    parachainId: 2004
  },
  {
    name: 'Astar',
    wsUrl: 'wss://rpc.astar.network',
    description: 'Astar Network',
    isTestnet: false,
    isParachain: true,
    parachainId: 2006
  }
];

export default function NetworkDiscovery() {
  const [includeTestnets, setIncludeTestnets] = useState(false)
  const [customUrl, setCustomUrl] = useState('')
  const [customName, setCustomName] = useState('')
  const [isTestingCustom, setIsTestingCustom] = useState(false)
  const [customTestResult, setCustomTestResult] = useState<DiscoveryResult | null>(null)
  const [backendAvailable, setBackendAvailable] = useState(true)
  
  const queryClient = useQueryClient()
  
  // Fetch known endpoints with fallback
  const { 
    data: endpointsData, 
    isLoading: isLoadingEndpoints, 
    error: endpointsError,
    refetch: refetchEndpoints 
  } = useQuery({
    queryKey: ['endpoints', includeTestnets],
    queryFn: async () => {
      try {
        console.log('Fetching endpoints from backend...');
        const response = await discoveryApi.getEndpoints(includeTestnets);
        console.log('Backend endpoints response:', response);
        
        setBackendAvailable(true);
        
        if (response?.data?.endpoints && Array.isArray(response.data.endpoints)) {
          return response;
        }
        
        // If backend returns invalid data, use fallback
        console.warn('Backend returned invalid data, using fallback endpoints');
        return {
          success: true,
          data: {
            endpoints: FALLBACK_ENDPOINTS.filter(e => includeTestnets || !e.isTestnet),
            count: FALLBACK_ENDPOINTS.filter(e => includeTestnets || !e.isTestnet).length
          }
        };
      } catch (error) {
        console.error('Failed to fetch endpoints from backend:', error);
        setBackendAvailable(false);
        
        // Use fallback endpoints on error
        return {
          success: true,
          data: {
            endpoints: FALLBACK_ENDPOINTS.filter(e => includeTestnets || !e.isTestnet),
            count: FALLBACK_ENDPOINTS.filter(e => includeTestnets || !e.isTestnet).length
          }
        };
      }
    },
    retry: 1,
    retryDelay: 1000,
  })
  
  // Scan for available chains
  const { 
    data: scanResults, 
    isLoading: isScanning,
    error: scanError,
    refetch: scanNetworks
  } = useQuery({
    queryKey: ['scan', includeTestnets],
    queryFn: async () => {
      try {
        console.log('Scanning networks...');
        const response = await discoveryApi.scanChains(includeTestnets);
        console.log('Scan response:', response);
        return response;
      } catch (error) {
        console.error('Scan failed:', error);
        toast.error('Network scan failed. Please check if the backend server is running.');
        throw error;
      }
    },
    enabled: false // Don't run automatically
  })
  
  // Connect to chain mutation
  const connectMutation = useMutation({
    mutationFn: async ({ wsUrl, name }: { wsUrl: string; name?: string }) => {
      try {
        console.log('Connecting to chain:', wsUrl, name);
        return await chainApi.connectChain(wsUrl, name)
      } catch (error) {
        console.error('Connection error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Connection successful:', data);
      queryClient.invalidateQueries({ queryKey: ['chains'] })
      toast.success('Successfully connected to network')
    },
    onError: (error: Error) => {
      console.error('Connect mutation error:', error);
      toast.error(`Connection failed: ${error.message}`)
    }
  })
  
  // Test custom endpoint
  const testCustomEndpoint = async () => {
    if (!customUrl) {
      toast.error('Please enter a WebSocket URL')
      return
    }
    
    // Validate URL format
    if (!customUrl.startsWith('ws://') && !customUrl.startsWith('wss://')) {
      toast.error('URL must start with ws:// or wss://')
      return
    }
    
    setIsTestingCustom(true)
    setCustomTestResult(null)
    
    try {
      const response = await discoveryApi.testEndpoint(customUrl, customName)
      console.log('Test response:', response);
      
      if (response?.data) {
        setCustomTestResult(response.data)
        
        if (response.data.isReachable) {
          toast.success('Connection test successful!')
        } else {
          toast.error(`Connection test failed: ${response.data.error || 'Unknown error'}`)
        }
      } else {
        toast.error('Invalid response from server')
      }
    } catch (error) {
      console.error('Test error:', error);
      toast.error(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsTestingCustom(false)
    }
  }
  
  // Connect to custom endpoint
  const connectToCustom = () => {
    if (!customUrl) {
      toast.error('Please enter a WebSocket URL')
      return
    }
    
    // Validate URL format
    if (!customUrl.startsWith('ws://') && !customUrl.startsWith('wss://')) {
      toast.error('URL must start with ws:// or wss://')
      return
    }
    
    connectMutation.mutate({ 
      wsUrl: customUrl,
      name: customName || 'Custom Chain'
    })
  }
  
  // Connect to discovered endpoint
  const connectToEndpoint = (endpoint: ChainEndpoint) => {
    connectMutation.mutate({ 
      wsUrl: endpoint.wsUrl,
      name: endpoint.name
    })
  }
  
  const endpoints = endpointsData?.data?.endpoints || []
  const results = scanResults?.data?.results || []
  
  console.log('Rendering with endpoints:', endpoints);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Network Discovery</h1>
        <div className="flex items-center space-x-2">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={includeTestnets}
              onChange={(e) => setIncludeTestnets(e.target.checked)}
              className="rounded border-border"
            />
            <span>Include Testnets</span>
          </label>
          <button
            onClick={() => scanNetworks()}
            disabled={isScanning}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isScanning ? (
              <span className="flex items-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Scanning...
              </span>
            ) : (
              <span className="flex items-center">
                <Network className="h-4 w-4 mr-2" />
                Scan Networks
              </span>
            )}
          </button>
          <button
            onClick={() => refetchEndpoints()}
            disabled={isLoadingEndpoints}
            className="p-2 rounded-md hover:bg-accent transition-colors disabled:opacity-50"
            title="Refresh endpoints"
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingEndpoints ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      
      {!backendAvailable && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-md">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-yellow-500">Backend Unavailable</div>
              <div className="text-sm text-yellow-500">
                The backend service is currently unavailable. Using fallback endpoints instead.
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Custom Connection */}
      <Card>
        <CardHeader>
          <CardTitle>Connect to Custom Network</CardTitle>
          <CardDescription>
            Enter a WebSocket RPC endpoint to connect to a custom Substrate-based blockchain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="WebSocket URL"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="wss://example.com"
              helperText="Enter the WebSocket RPC endpoint URL"
              required
              validate={(value) => {
                if (!value.trim()) return 'WebSocket URL is required';
                if (!value.startsWith('ws://') && !value.startsWith('wss://')) {
                  return 'URL must start with ws:// or wss://';
                }
                try {
                  new URL(value);
                  return undefined;
                } catch {
                  return 'Invalid URL format';
                }
              }}
            />
            <Input
              label="Network Name (Optional)"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="My Custom Network"
              helperText="Custom name for this network"
            />
          </div>
          <div className="flex items-center space-x-2 mt-4">
            <Button
              onClick={testCustomEndpoint}
              disabled={isTestingCustom || !customUrl}
              variant="secondary"
            >
              {isTestingCustom ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Connection'
              )}
            </Button>
            <Button
              onClick={connectToCustom}
              disabled={connectMutation.isPending || !customUrl}
              variant="primary"
            >
              {connectMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect'
              )}
            </Button>
          </div>
          
          {customTestResult && (
            <div className={`mt-4 p-3 rounded-md ${customTestResult.isReachable ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
              <div className="flex items-start space-x-2">
                {customTestResult.isReachable ? (
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-medium">
                    {customTestResult.isReachable ? 'Connection Successful' : 'Connection Failed'}
                  </div>
                  {customTestResult.isReachable ? (
                    <div className="text-sm mt-1">
                      <div>Chain: {customTestResult.metadata.chainName || customTestResult.endpoint.name}</div>
                      <div>Response Time: {customTestResult.responseTime}ms</div>
                      {customTestResult.metadata.runtimeVersion && (
                        <div>Runtime: {customTestResult.metadata.runtimeVersion.specName} v{customTestResult.metadata.runtimeVersion.specVersion}</div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-red-500">{customTestResult.error}</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Scan Results */}
      {scanResults && (
        <Card>
          <CardHeader>
            <CardTitle>Scan Results</CardTitle>
            <CardDescription>
              Found {results.filter(r => r.isReachable).length} reachable networks out of {results.length} total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
            {results.map((result, index) => (
              <div 
                key={index}
                className={`p-3 rounded-md border ${
                  result.isReachable ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {result.isReachable ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <div className="font-medium">{result.endpoint.name}</div>
                      <div className="text-xs text-muted-foreground">{result.endpoint.wsUrl}</div>
                    </div>
                  </div>
                  
                  {result.isReachable && (
                    <Button
                      onClick={() => connectToEndpoint(result.endpoint)}
                      disabled={connectMutation.isPending}
                      size="sm"
                      variant="primary"
                    >
                      Connect
                    </Button>
                  )}
                </div>
                
                {result.isReachable ? (
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    <div>Response: {result.responseTime}ms</div>
                    {result.metadata.runtimeVersion && (
                      <div>Runtime: {result.metadata.runtimeVersion.specName} v{result.metadata.runtimeVersion.specVersion}</div>
                    )}
                    {result.endpoint.isRelay && <div className="text-blue-500">Relay Chain</div>}
                    {result.endpoint.isParachain && <div className="text-purple-500">Parachain {result.endpoint.parachainId}</div>}
                    {result.endpoint.isTestnet && <div className="text-orange-500">Testnet</div>}
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-red-500">{result.error}</div>
                )}
              </div>
            ))}
          </div>
          </CardContent>
        </Card>
      )}

      {/* Known Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle>Known Networks</CardTitle>
          <CardDescription>
            Pre-configured Substrate networks available for connection
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingEndpoints ? (
            <Loading text="Loading networks..." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {endpoints.map((endpoint, index) => (
              <div 
                key={index}
                className="p-4 rounded-md border border-border bg-card/50 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{endpoint.name}</h3>
                    <div className="text-xs text-muted-foreground mt-1 break-all">{endpoint.wsUrl}</div>
                  </div>
                  <Button
                    onClick={() => connectToEndpoint(endpoint)}
                    disabled={connectMutation.isPending}
                    size="sm"
                    variant="primary"
                  >
                    Connect
                  </Button>
                </div>
                
                {endpoint.description && (
                  <div className="text-sm mt-2">{endpoint.description}</div>
                )}
                
                <div className="flex items-center space-x-2 mt-2">
                  {endpoint.isRelay && (
                    <Badge variant="outline" size="sm">
                      Relay Chain
                    </Badge>
                  )}
                  {endpoint.isParachain && (
                    <Badge variant="outline" size="sm">
                      Parachain {endpoint.parachainId}
                    </Badge>
                  )}
                  {endpoint.isTestnet && (
                    <Badge variant="warning" size="sm">
                      Testnet
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        </CardContent>
      </Card>
      
      {/* Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Resources</CardTitle>
          <CardDescription>
            Useful links for Substrate and Polkadot ecosystem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
          <a 
            href="https://polkadot.network/ecosystem/parachains/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Polkadot Parachain Directory
          </a>
          <a 
            href="https://telemetry.polkadot.io/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Polkadot Telemetry
          </a>
          <a 
            href="https://wiki.polkadot.network/docs/learn-endpoints" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Public Endpoints Documentation
          </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}