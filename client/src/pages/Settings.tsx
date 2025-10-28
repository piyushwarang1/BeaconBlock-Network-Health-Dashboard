import { useState } from 'react';
import { useTheme } from '../components/theme/theme-provider';
import { Settings as SettingsIcon, Monitor, Moon, Sun, Wifi, WifiOff, Database, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { socket } from '../lib/socket';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [apiUrl, setApiUrl] = useState('http://localhost:5000');
  const [refreshInterval, setRefreshInterval] = useState('30');
  const [maxConnections, setMaxConnections] = useState('10');

  const themeOptions = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' }
  ];

  const refreshOptions = [
    { value: '10', label: '10 seconds' },
    { value: '30', label: '30 seconds' },
    { value: '60', label: '1 minute' },
    { value: '300', label: '5 minutes' }
  ];

  const connectionOptions = [
    { value: '5', label: '5 connections' },
    { value: '10', label: '10 connections' },
    { value: '20', label: '20 connections' },
    { value: '50', label: '50 connections' }
  ];

  const getThemeIcon = (themeValue: string) => {
    switch (themeValue) {
      case 'light': return <Sun className="h-4 w-4" />;
      case 'dark': return <Moon className="h-4 w-4" />;
      case 'system': return <Monitor className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <SettingsIcon className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>
      
      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize the look and feel of the application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getThemeIcon(theme)}
              <span>Theme</span>
            </div>
            <Select
              value={theme}
              onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
              options={themeOptions}
              className="w-32"
            />
          </div>
        </CardContent>
      </Card>

      {/* Connection Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Connection Settings</CardTitle>
          <CardDescription>Configure network and API connections</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {socket.connected ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span>WebSocket Status</span>
            </div>
            <Badge variant={socket.connected ? 'success' : 'destructive'}>
              {socket.connected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
          
          <Input
            label="API Server URL"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="http://localhost:5000"
            helperText="The URL of the BeaconBlock API server"
          />
          
          <Select
            label="Maximum Concurrent Connections"
            value={maxConnections}
            onChange={(e) => setMaxConnections(e.target.value)}
            options={connectionOptions}
            helperText="Maximum number of chains that can be connected simultaneously"
          />
        </CardContent>
      </Card>

      {/* Performance Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Performance</CardTitle>
          <CardDescription>Configure refresh intervals and caching behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            label="Data Refresh Interval"
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(e.target.value)}
            options={refreshOptions}
            helperText="How often to refresh chain data and statistics"
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>Block Cache Size</span>
            </div>
            <Badge variant="outline">100 blocks</Badge>
                    </div>
          
          <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Connection Timeout</span>
            </div>
            <Badge variant="outline">30 seconds</Badge>
        </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>About BeaconBlock</CardTitle>
          <CardDescription>Application information and version details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Version</div>
              <div className="font-medium">1.0.0</div>
        </div>
              <div>
              <div className="text-muted-foreground">Build</div>
              <div className="font-medium">Development</div>
              </div>
              <div>
              <div className="text-muted-foreground">Polkadot.js API</div>
              <div className="font-medium">v10.11.2</div>
            </div>
            <div>
              <div className="text-muted-foreground">React</div>
              <div className="font-medium">v18.2.0</div>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              BeaconBlock is a next-generation network health dashboard and blockchain explorer 
              specifically engineered for the Substrate and Polkadot ecosystem.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>Manage application data and connections</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" className="flex-1">
              Clear Cache
            </Button>
            <Button variant="outline" className="flex-1">
              Export Settings
            </Button>
            <Button variant="outline" className="flex-1">
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}