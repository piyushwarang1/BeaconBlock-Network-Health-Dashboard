import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, TrendingUp, AlertTriangle, CheckCircle, Award, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Loading } from '../components/ui/Loading';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { chainApi, validatorApi } from '../lib/api';

interface ValidatorInfo {
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

export default function ValidatorMonitor() {
  const { chainId } = useParams();
  const [selectedChain, setSelectedChain] = useState(chainId || '');
  const [sortBy, setSortBy] = useState<'commission' | 'stake' | 'points'>('stake');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Fetch available chains
  const { data: chainsResponse } = useQuery({
    queryKey: ['chains'],
    queryFn: async () => {
      try {
        return await chainApi.getChains();
      } catch (error) {
        console.error('Error fetching chains:', error);
        return { success: false, data: [] };
      }
    }
  });

  const chains = Array.isArray(chainsResponse?.data)
    ? chainsResponse?.data.map((chain: any, index: number) => ({
        id: chain.id || chain.metadata?.chainId || `unknown-chain-${index}`,
        name: chain.name || chain.metadata?.chainName || `Unknown Chain ${index + 1}`
      }))
    : [];

  // Fetch validators
  const { data: validatorsData, isLoading } = useQuery({
    queryKey: ['validators', selectedChain],
    queryFn: async () => {
      if (!selectedChain) return { validators: [] };
      try {
        return await validatorApi.getValidators(selectedChain, 50, 0);
      } catch (error) {
        console.error('Error fetching validators:', error);
        return { validators: [] };
      }
    },
    enabled: !!selectedChain,
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  const validators: ValidatorInfo[] = validatorsData?.data?.validators || [];

  // Calculate statistics
  const totalValidators = validators.length;
  const activeValidators = validators.filter(v => !v.blocked).length;
  const totalStake = validators.reduce((sum, v) => sum + parseFloat(v.exposure.total || '0'), 0);
  const averageCommission = totalValidators > 0
    ? validators.reduce((sum, v) => sum + (parseFloat(v.commission || '0') / 10000000), 0) / totalValidators
    : 0;

  // Sort and filter validators
  const sortedValidators = [...validators]
    .sort((a, b) => {
      switch (sortBy) {
        case 'commission':
          return (parseFloat(a.commission || '0') / 10000000) - (parseFloat(b.commission || '0') / 10000000);
        case 'stake':
          return parseFloat(b.exposure.total || '0') - parseFloat(a.exposure.total || '0');
        case 'points':
          return (b.rewardPoints || 0) - (a.rewardPoints || 0);
        default:
          return 0;
      }
    })
    .filter(v => {
      if (filterStatus === 'active') return !v.blocked;
      if (filterStatus === 'inactive') return v.blocked;
      return true;
    });

  const getStatusVariant = (blocked: boolean): 'success' | 'destructive' => {
    return blocked ? 'destructive' : 'success';
  };

  const getCommissionColor = (commission: string): string => {
    const comm = parseFloat(commission);
    if (comm <= 5) return 'text-green-500';
    if (comm <= 10) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Validator Monitor</h1>
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
          <CardDescription>Choose a chain to monitor validators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <select 
              className="flex-1 p-2 border rounded bg-background"
              value={selectedChain}
              onChange={(e) => setSelectedChain(e.target.value)}
            >
              <option value="">Select a chain</option>
              {chains.map((chain: any) => (
                <option key={chain.id} value={chain.id}>{chain.name}</option>
              ))}
            </select>
            
            <div className="flex gap-2">
              <select 
                className="p-2 border rounded bg-background"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="stake">Sort by Stake</option>
                <option value="commission">Sort by Commission</option>
                <option value="points">Sort by Points</option>
              </select>
              
              <select 
                className="p-2 border rounded bg-background"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="all">All Validators</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedChain && (
        <>
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">Total Validators</div>
                    <div className="text-2xl font-bold">{totalValidators}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">Active Validators</div>
                    <div className="text-2xl font-bold">{activeValidators}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">Total Stake</div>
                    <div className="text-2xl font-bold">{totalStake.toFixed(2)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-orange-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">Avg Commission</div>
                    <div className="text-2xl font-bold">{averageCommission.toFixed(2)}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Validators Table */}
          <Card>
            <CardHeader>
              <CardTitle>Validators</CardTitle>
              <CardDescription>
                Showing {sortedValidators.length} of {totalValidators} validators
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Loading text="Loading validators..." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Validator</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Stake</TableHead>
                      <TableHead>Nominators</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Slashes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedValidators.map((validator, index) => (
                      <TableRow key={validator.accountId}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {validator.identity?.display || `Validator ${index + 1}`}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">
                              {validator.accountId.slice(0, 16)}...
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(validator.blocked)}>
                            {validator.blocked ? 'Inactive' : 'Active'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={getCommissionColor((parseFloat(validator.commission || '0') / 10000000).toString())}>
                            {(parseFloat(validator.commission || '0') / 10000000).toFixed(2)}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-sm">
                            {parseFloat(validator.exposure.total).toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>{validator.nominators.length}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Award className="h-3 w-3" />
                            <span>{validator.rewardPoints}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {validator.slashes.length > 0 ? (
                            <div className="flex items-center space-x-1 text-red-500">
                              <AlertTriangle className="h-3 w-3" />
                              <span>{validator.slashes.length}</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 text-green-500">
                              <Shield className="h-3 w-3" />
                              <span>0</span>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!selectedChain && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Chain Selected</h3>
            <p className="text-muted-foreground">
              Please select a chain from the dropdown above to monitor validators
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}