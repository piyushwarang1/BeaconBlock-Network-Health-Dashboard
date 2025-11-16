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

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { includeTestnets = 'false' } = req.query;
    const includeTestnetsBool = includeTestnets === 'true';

    // Filter chains based on testnet preference
    const filteredChains = includeTestnetsBool
      ? KNOWN_CHAINS
      : KNOWN_CHAINS.filter(chain => !chain.isTestnet);

    const endpoints = filteredChains.map(chain => ({
      name: chain.name,
      wsUrl: chain.wsUrl,
      description: chain.description,
      isTestnet: chain.isTestnet,
      isRelay: chain.isRelay,
      isParachain: chain.isParachain,
      parachainId: chain.parachainId
    }));

    res.status(200).json({
      success: true,
      data: {
        endpoints,
        count: endpoints.length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting endpoints:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get endpoints',
      timestamp: new Date().toISOString()
    });
  }
}