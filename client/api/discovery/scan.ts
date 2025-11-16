// Known Substrate chains for discovery
const KNOWN_CHAINS = [
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

// Mock scan results - in a real implementation, this would test actual connections
function getMockScanResults(includeTestnets: boolean) {
  const chains = includeTestnets
    ? KNOWN_CHAINS
    : KNOWN_CHAINS.filter(chain => !chain.isTestnet);

  return chains.map((chain, index) => ({
    endpoint: {
      name: chain.name,
      wsUrl: chain.wsUrl,
      description: chain.description,
      isTestnet: chain.isTestnet,
      isRelay: chain.isRelay,
      isParachain: chain.isParachain,
      parachainId: chain.parachainId
    },
    isReachable: Math.random() > 0.2, // 80% success rate for demo
    responseTime: Math.floor(Math.random() * 500) + 50, // 50-550ms
    error: Math.random() > 0.8 ? 'Connection timeout' : undefined,
    metadata: Math.random() > 0.2 ? {
      chainName: chain.name,
      runtimeVersion: {
        specName: 'substrate',
        specVersion: Math.floor(Math.random() * 100) + 900
      }
    } : undefined
  }));
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { includeTestnets = 'false' } = req.query;
    const includeTestnetsBool = includeTestnets === 'true';

    // Simulate scanning delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const results = getMockScanResults(includeTestnetsBool);

    res.status(200).json({
      success: true,
      data: {
        results,
        total: results.length,
        reachable: results.filter(r => r.isReachable).length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error scanning chains:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to scan chains',
      timestamp: new Date().toISOString()
    });
  }
}