// Mock test function - in a real implementation, this would test actual WebSocket connections
function getMockTestResult(wsUrl: string, name?: string) {
  const isValidFormat = wsUrl.startsWith('ws://') || wsUrl.startsWith('wss://');
  const isReachable = isValidFormat && Math.random() > 0.3; // 70% success rate for demo

  return {
    endpoint: {
      name: name || 'Custom Chain',
      wsUrl
    },
    isReachable,
    responseTime: isReachable ? Math.floor(Math.random() * 500) + 50 : 0,
    error: isReachable ? undefined : 'Connection failed',
    metadata: isReachable ? {
      chainName: name || 'Custom Chain',
      runtimeVersion: {
        specName: 'substrate',
        specVersion: Math.floor(Math.random() * 100) + 900
      }
    } : undefined
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { wsUrl, name }: { wsUrl: string; name?: string } = req.body;

    if (!wsUrl) {
      return res.status(400).json({
        success: false,
        error: 'WebSocket URL is required',
        timestamp: new Date().toISOString()
      });
    }

    // Validate WebSocket URL format
    try {
      const url = new URL(wsUrl);
      if (!['ws:', 'wss:'].includes(url.protocol)) {
        throw new Error('Invalid WebSocket protocol');
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid WebSocket URL format',
        timestamp: new Date().toISOString()
      });
    }

    // Simulate testing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get mock test result
    const result = getMockTestResult(wsUrl, name);

    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error testing endpoint:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to test endpoint',
      timestamp: new Date().toISOString()
    });
  }
}