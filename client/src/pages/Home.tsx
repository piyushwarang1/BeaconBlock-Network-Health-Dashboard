import { useNavigate } from 'react-router-dom';
import { Card, CardDescription, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import {
  Activity,
  TrendingUp,
  BarChart3,
  Server,
  Shield,
  ChevronRight,
  Globe,
  ArrowRight,
  Sparkles,
  Monitor,
  Network,
  Cpu,
  Eye,
  Layers,
  Zap as Lightning,
  MessageSquare
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Server,
      title: 'Multi-Chain Support',
      description: 'Monitor multiple Substrate-based blockchains from a single dashboard with unified metrics and insights.',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20',
      iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500'
    },
    {
      icon: Lightning,
      title: 'Real-Time Updates',
      description: 'Live block production, validator activity, and network health metrics with WebSocket connections.',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20',
      iconBg: 'bg-gradient-to-br from-green-500 to-emerald-500'
    },
    {
      icon: TrendingUp,
      title: 'Price Analytics',
      description: 'Track token prices, trading volumes, and market data across chains with historical charting.',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20',
      iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500'
    },
    {
      icon: Shield,
      title: 'Validator Monitoring',
      description: 'Comprehensive validator performance tracking and network security metrics analysis.',
      color: 'from-orange-500 to-red-500',
      bgColor: 'from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20',
      iconBg: 'bg-gradient-to-br from-orange-500 to-red-500'
    },
    {
      icon: Globe,
      title: 'Dynamic Discovery',
      description: 'Automatically adapts to runtime upgrades and discovers new chain features dynamically.',
      color: 'from-cyan-500 to-blue-500',
      bgColor: 'from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20',
      iconBg: 'bg-gradient-to-br from-cyan-500 to-blue-500'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Historical data visualization and predictive analytics with machine learning integration.',
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20',
      iconBg: 'bg-gradient-to-br from-indigo-500 to-purple-500'
    }
  ];

  const supportedChains = [
    { name: 'Polkadot', status: 'active' },
    { name: 'Kusama', status: 'active' },
    { name: 'Acala', status: 'active' },
    { name: 'Moonbeam', status: 'active' },
    { name: 'Astar', status: 'active' },
    { name: 'Parallel', status: 'active' },
    { name: 'Darwinia', status: 'active' },
    { name: 'And More...', status: 'expanding' }
  ];

  const stats = [
    { value: '100+', label: 'Supported Networks' },
    { value: '24/7', label: 'Monitoring' },
    { value: '< 1s', label: 'Update Latency' },
    { value: '99.9%', label: 'Uptime' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 relative overflow-hidden">
      {/* Enhanced floating background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary gradient orbs */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 via-purple-400/15 to-cyan-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-cyan-400/15 via-blue-400/10 to-indigo-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-40 right-1/4 w-72 h-72 bg-gradient-to-br from-purple-400/20 via-pink-400/15 to-rose-400/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-gradient-to-br from-indigo-400/15 via-purple-400/10 to-blue-400/5 rounded-full blur-3xl animate-pulse delay-3000"></div>

        {/* Additional subtle elements */}
        <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-gradient-to-br from-emerald-400/10 to-teal-400/5 rounded-full blur-2xl animate-pulse delay-500"></div>
        <div className="absolute bottom-1/3 left-1/2 w-40 h-40 bg-gradient-to-br from-violet-400/8 to-purple-400/4 rounded-full blur-2xl animate-pulse delay-1500"></div>
        <div className="absolute top-2/3 right-1/5 w-28 h-28 bg-gradient-to-br from-amber-400/6 to-orange-400/3 rounded-full blur-xl animate-pulse delay-2500"></div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="relative w-full px-4 sm:px-6 lg:px-8 py-40 lg:py-48">
          <div className="text-center">
            {/* Badge */}
            <div className="flex justify-center mb-8 animate-bounce-in">
              <Badge variant="secondary" className="px-6 py-3 text-sm font-semibold bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 text-blue-700 dark:from-blue-950/50 dark:via-indigo-950/50 dark:to-purple-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800 shadow-lg backdrop-blur-sm">
                <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                Next-Generation Blockchain Monitoring
              </Badge>
            </div>

            {/* Main heading */}
            <div className="mb-10 animate-slide-up animation-delay-200">
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent mb-6 leading-none tracking-tight">
                BeaconBlock
              </h1>
              <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-600 dark:text-slate-300 mb-4 tracking-wide">
                Network Health Dashboard
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
            </div>

            {/* Description */}
            <div className="animate-fade-in-up animation-delay-400">
              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-16 max-w-5xl mx-auto leading-relaxed font-medium">
                The most advanced monitoring platform for Substrate-based blockchains.
                Monitor network health, validator performance, and market data across multiple chains in real-time with enterprise-grade reliability.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-scale-in animation-delay-600">
              <button
                onClick={() => navigate('/dashboard')}
                className="group relative overflow-hidden text-lg px-12 py-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 text-white font-bold rounded-2xl shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-500 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-blue-400/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 rounded-2xl"></div>
                <div className="relative flex items-center justify-center">
                  <Monitor className="mr-4 h-7 w-7" />
                  Launch Dashboard
                  <ArrowRight className="ml-4 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </button>
              <button
                onClick={() => navigate('/discovery')}
                className="group relative overflow-hidden text-lg px-12 py-6 bg-white/10 dark:bg-slate-800/50 backdrop-blur-lg border-2 border-white/20 dark:border-slate-600/50 text-slate-800 dark:text-slate-200 font-semibold rounded-2xl shadow-xl hover:shadow-slate-400/20 dark:hover:shadow-slate-600/20 transform hover:scale-105 transition-all duration-500 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                <div className="relative flex items-center justify-center">
                  <Network className="mr-4 h-7 w-7" />
                  Add Network
                  <ChevronRight className="ml-4 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-40 bg-white dark:bg-slate-900 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/30 to-transparent dark:via-blue-950/10"></div>
        <div className="relative w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 animate-fade-in-up animation-delay-200">
            <Badge variant="outline" className="mb-6 px-4 py-2 text-sm font-medium border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300 animate-scale-in animation-delay-400">
              <Cpu className="h-4 w-4 mr-2" />
              Powerful Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 animate-slide-up animation-delay-600">
              Everything You Need for
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Blockchain Monitoring
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-800">
              Enterprise-grade monitoring tools designed specifically for Substrate-based networks,
              with real-time insights and comprehensive analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="animate-scale-in" style={{ animationDelay: `${(index + 1) * 200}ms` }}>
                <Card className="group relative border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-800 dark:to-slate-800/50 overflow-hidden">
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                {/* Card content */}
                <div className="relative p-8">
                  <div className={`inline-flex p-4 rounded-2xl ${feature.iconBg} text-white shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-slate-700 dark:group-hover:from-white dark:group-hover:to-slate-300 group-hover:bg-clip-text transition-all duration-300">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </div>

                 {/* Hover effect border */}
                 <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -m-1"></div>
               </Card>
              </div>
             ))}
           </div>
        </div>
      </div>

      {/* Supported Chains Section */}
      <div className="py-40 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 relative">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-400/5 to-purple-400/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <Badge variant="outline" className="mb-6 px-4 py-2 text-sm font-medium border-green-200 text-green-700 dark:border-green-800 dark:text-green-300">
              <Globe className="h-4 w-4 mr-2" />
              Universal Support
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              Works with
              <span className="block bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Any Substrate Network
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              From Polkadot and Kusama to custom enterprise networks and testnets.
              Simply provide a WebSocket RPC endpoint and BeaconBlock handles everything automatically.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {supportedChains.map((chain, index) => (
              <div key={index} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700 group-hover:border-green-300 dark:group-hover:border-green-600">
                  <div className="flex items-center justify-center mb-4">
                    <div className={`w-3 h-3 rounded-full ${chain.status === 'active' ? 'bg-green-500' : 'bg-blue-500'} animate-pulse`}></div>
                  </div>
                  <div className="text-center">
                    <span className="font-semibold text-slate-900 dark:text-white text-lg">{chain.name}</span>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 capitalize">
                      {chain.status}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-blue-50 dark:bg-blue-950/50 rounded-full border border-blue-200 dark:border-blue-800 mb-8">
              <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="text-slate-700 dark:text-slate-300 font-medium">
                Just connect your RPC endpoint - we handle the rest
              </span>
            </div>
            <button
              onClick={() => navigate('/discovery')}
              className="group relative overflow-hidden text-lg px-10 py-5 bg-white/10 dark:bg-slate-800/50 backdrop-blur-lg border-2 border-white/20 dark:border-slate-600/50 text-slate-800 dark:text-slate-200 font-semibold rounded-2xl shadow-xl hover:shadow-slate-400/20 dark:hover:shadow-slate-600/20 transform hover:scale-105 transition-all duration-500 hover:-translate-y-1 hover:bg-white/20 dark:hover:bg-slate-700/50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              <div className="relative flex items-center justify-center">
                <Layers className="mr-3 h-6 w-6" />
                Discover Networks
                <ChevronRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-40 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative w-full px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium bg-white/20 text-white border-white/30 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 mr-2" />
              Get Started Today
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Ready to Monitor Your
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Networks?
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join thousands of developers and enterprises using BeaconBlock for comprehensive blockchain monitoring.
              Start monitoring your Substrate networks in minutes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="group relative overflow-hidden text-xl px-16 py-8 bg-white text-blue-600 hover:bg-blue-50 font-bold rounded-3xl shadow-2xl hover:shadow-white/30 transform hover:scale-105 transition-all duration-500 hover:-translate-y-2"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-blue-50/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 rounded-3xl"></div>
              <div className="relative flex items-center justify-center">
                <Activity className="mr-4 h-7 w-7" />
                Get Started Now
                <ArrowRight className="ml-4 h-7 w-7 group-hover:translate-x-2 transition-transform duration-300" />
              </div>
            </button>
          </div>

          <div className="mt-12 text-blue-200 text-sm">
            No setup required • Free to start • Enterprise-ready
          </div>
        </div>
      </div>

      {/* Footer with Contact Link */}
      <div className="py-12 bg-slate-900 dark:bg-slate-950 border-t border-slate-800 dark:border-slate-800">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-slate-400 text-sm mb-4 md:mb-0">
              © 2025 BeaconBlock. Built for the Substrate ecosystem.
            </div>
            <div className="flex items-center space-x-6">
              <button
                onClick={() => navigate('/contact')}
                className="text-slate-400 hover:text-blue-400 transition-colors duration-200 text-sm font-medium flex items-center"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Us
              </button>
              <a
                href="#"
                className="text-slate-400 hover:text-blue-400 transition-colors duration-200 text-sm"
              >
                Documentation
              </a>
              <a
                href="https://github.com/piyushwarang1/BeaconBlock-Network-Health-Dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-blue-400 transition-colors duration-200 text-sm"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}