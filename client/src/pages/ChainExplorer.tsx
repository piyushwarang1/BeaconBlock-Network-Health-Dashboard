import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Hash, Clock, Database, ExternalLink } from 'lucide-react';
import { socket } from '../lib/socket';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Loading } from '../components/ui/Loading';
import { chainApi } from '../lib/api';

const ChainExplorer = () => {
  const { chainId } = useParams();
  const [selectedChain, setSelectedChain] = useState(chainId || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('block'); // block, extrinsic, account
  const [selectedBlock, setSelectedBlock] = useState<any>(null);

  // Fetch available chains
  const { data: chainsResponse } = useQuery({
    queryKey: ['chains'],
    queryFn: async () => {
      try {
        return await chainApi.getChains()
      } catch (error) {
        console.error('Error fetching chains:', error);
        return { success: false, data: [] };
      }
    }
  });
  
  // Process chains data to ensure it's always an array
  const chains = Array.isArray(chainsResponse?.data)
    ? chainsResponse?.data.map((chain: any, _index: number) => ({
        id: chain.id,
        name: chain.name
      }))
    : [];

  // Fetch recent blocks
  const { data: recentBlocks, isLoading } = useQuery({
    queryKey: ['blocks', selectedChain],
    queryFn: async () => {
      if (!selectedChain) return [];
      try {
        const response = await chainApi.getBlocks(selectedChain, 10);
        return response?.data?.blocks || [];
      } catch (error) {
        console.error('Error fetching blocks:', error);
        return [];
      }
    },
    enabled: !!selectedChain,
    refetchInterval: 10000 // Refetch every 10 seconds
  });

  // Listen for new blocks
  useEffect(() => {
    if (!selectedChain) return;

    const onNewBlock = (block: any) => {
      console.log('New block received:', block);
      // Update block list
    };

    socket.on('newBlock', onNewBlock);
    return () => {
      socket.off('newBlock', onNewBlock);
    };
  }, [selectedChain]);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    console.log(`Searching for ${searchType}: ${searchQuery}`);
    // Implement search functionality
  };

  const handleBlockSelect = (block: any) => {
    setSelectedBlock(block);
    // Fetch block details
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Chain Explorer</h1>
        {selectedChain && (
          <Badge variant="outline">
            {chains.find((c: any) => c.id === selectedChain)?.name || 'Unknown Chain'}
          </Badge>
        )}
      </div>
      
      {/* Chain selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Chain</CardTitle>
          <CardDescription>Choose a connected chain to explore</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            label="Chain"
            value={selectedChain}
            onChange={(e) => setSelectedChain(e.target.value)}
            placeholder="Select a chain"
            options={chains.map((chain: any) => ({
              value: chain.id,
              label: chain.name
            }))}
          />
        </CardContent>
      </Card>

      {selectedChain && (
        <>
          {/* Search section */}
          <Card>
            <CardHeader>
              <CardTitle>Search</CardTitle>
              <CardDescription>Search for blocks, extrinsics, or accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  options={[
                    { value: 'block', label: 'Block' },
                    { value: 'extrinsic', label: 'Extrinsic' },
                    { value: 'account', label: 'Account' }
                  ]}
                />
                <Input
                  placeholder={`Enter ${searchType} hash, number, or address...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="h-4 w-4" />}
                />
                <Button onClick={handleSearch} disabled={!searchQuery.trim()}>
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent blocks */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Blocks</CardTitle>
                  <CardDescription>Latest blocks from the chain</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Loading text="Loading blocks..." />
                  ) : (
                    <div className="space-y-2">
                      {recentBlocks?.map((block: any) => (
                        <div 
                          key={block.hash}
                          className={`p-3 rounded-md border cursor-pointer transition-colors hover:bg-accent ${
                            selectedBlock?.hash === block.hash ? 'bg-accent border-primary' : 'border-border'
                          }`}
                          onClick={() => handleBlockSelect(block)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Hash className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">#{block.number}</span>
                            </div>
                            <Badge variant="outline" size="sm">
                              {block.extrinsics} txns
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 truncate">
                            {block.hash}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(block.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Block details */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Block Details</CardTitle>
                  <CardDescription>
                    {selectedBlock ? `Block #${selectedBlock.number}` : 'Select a block to view details'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedBlock ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Hash className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm text-muted-foreground">Block Number</div>
                            <div className="font-medium">{selectedBlock.number}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm text-muted-foreground">Timestamp</div>
                            <div className="font-medium">{new Date(selectedBlock.timestamp).toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Database className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm text-muted-foreground">Extrinsics</div>
                            <div className="font-medium">{selectedBlock.extrinsics}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm text-muted-foreground">Events</div>
                            <div className="font-medium">{selectedBlock.events}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-muted-foreground mb-2">Block Hash</div>
                        <div className="font-mono text-sm break-all bg-muted p-2 rounded">
                          {selectedBlock.hash}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      Select a block from the list to view its details
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}

      {!selectedChain && (
        <Card>
          <CardContent className="text-center py-12">
            <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Chain Selected</h3>
            <p className="text-muted-foreground">
              Please select a chain from the dropdown above to explore blocks and transactions
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChainExplorer;