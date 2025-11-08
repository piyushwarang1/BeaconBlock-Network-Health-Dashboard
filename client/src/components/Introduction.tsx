import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import {
  X,
  Zap,
  TrendingUp,
  BarChart3,
  Server,
  Users,
  Shield,
  Activity,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function Introduction() {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isVisible) return null;

  return (
    <Card className="border-blue-200 dark:border-blue-800 dark:bg-blue-950/20">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-xl">Welcome to BeaconBlock Dashboard</CardTitle>
              <CardDescription>
                Your comprehensive network health monitoring platform for Substrate-based blockchains
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {isExpanded ? 'Show Less' : 'Learn More'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg border">
            <Server className="h-5 w-5 text-blue-500" />
            <div>
              <p className="font-medium text-sm">Multi-Chain Support</p>
              <p className="text-xs text-muted-foreground">Monitor multiple networks</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800/50 rounded-lg border">
            <Zap className="h-5 w-5 text-green-500" />
            <div>
              <p className="font-medium text-sm">Real-Time Updates</p>
              <p className="text-xs text-muted-foreground">Live block & metrics</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg border">
            <TrendingUp className="h-5 w-5 text-purple-500" />
            <div>
              <p className="font-medium text-sm">Price Analytics</p>
              <p className="text-xs text-muted-foreground">Token price tracking</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg border">
            <Shield className="h-5 w-5 text-orange-500" />
            <div>
              <p className="font-medium text-sm">Validator Monitoring</p>
              <p className="text-xs text-muted-foreground">Network security metrics</p>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-4 pt-4 border-t">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Getting Started
              </h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>1. <strong>Add Networks:</strong> Click "Add Network" to connect to Substrate-based blockchains</p>
                <p>2. <strong>Select Chain:</strong> Choose a network from the dropdown to view detailed metrics</p>
                <p>3. <strong>Monitor Metrics:</strong> View real-time block production, validator activity, and network health</p>
                <p>4. <strong>Analyze Data:</strong> Explore price charts, volume data, and token distributions</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Key Features
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Badge variant="secondary" className="text-xs">Dynamic Discovery</Badge>
                  <p className="text-xs text-muted-foreground">Automatically adapts to runtime upgrades</p>
                </div>
                <div className="space-y-1">
                  <Badge variant="secondary" className="text-xs">WebSocket Monitoring</Badge>
                  <p className="text-xs text-muted-foreground">Real-time data via WebSocket connections</p>
                </div>
                <div className="space-y-1">
                  <Badge variant="secondary" className="text-xs">Cross-Chain Analytics</Badge>
                  <p className="text-xs text-muted-foreground">Unified view across multiple networks</p>
                </div>
                <div className="space-y-1">
                  <Badge variant="secondary" className="text-xs">Historical Data</Badge>
                  <p className="text-xs text-muted-foreground">Track trends over time with charts</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/50 p-3 rounded-lg">
              <p className="text-sm">
                <strong>Pro Tip:</strong> Start by adding Polkadot or Kusama networks to explore the ecosystem.
                The dashboard will automatically detect and display all available metrics once connected.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}