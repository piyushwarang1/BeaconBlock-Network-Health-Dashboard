import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Search,
  Network,
  Shield,
  TrendingUp,
  MessageSquare,
  Settings,
  X
} from 'lucide-react'

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function Sidebar({ open, setOpen }: SidebarProps): JSX.Element {
  const location = useLocation()
  
  const navigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Chain Explorer', href: '/explorer', icon: Search },
    { name: 'Network Discovery', href: '/discovery', icon: Network },
    { name: 'Validator Monitor', href: '/validators', icon: Shield },
    { name: 'Predictive Analytics', href: '/predictive', icon: TrendingUp },
    { name: 'Contact', href: '/contact', icon: MessageSquare },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar for mobile */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card/95 backdrop-blur-md border-r border-border/50 shadow-xl transform transition-all duration-300 ease-in-out md:translate-x-0 md:static md:z-auto ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-border/50 bg-gradient-to-r from-card to-card/80">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                <img
                  src="/beacon-icon.svg"
                  alt="BeaconBlock Logo"
                  className="h-4 w-4 brightness-0 invert"
                />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                BeaconBlock
              </span>
              <p className="text-xs text-muted-foreground">Dashboard</p>
            </div>
          </Link>
          <button
            className="md:hidden p-2 rounded-lg hover:bg-accent/50 transition-colors duration-200"
            onClick={() => setOpen(false)}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close sidebar</span>
          </button>
        </div>
        
        <nav className="flex flex-col p-4 space-y-2">
          {navigation.map((item, index) => {
            const isActive = location.pathname === item.href ||
              (item.href !== '/' && location.pathname.startsWith(item.href))

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-4 py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground hover:shadow-md'
                }`}
                onClick={() => setOpen(false)}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={`mr-3 p-1.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-white/20'
                    : 'bg-accent/50 group-hover:bg-accent'
                }`}>
                  <item.icon className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-white' : ''
                  }`} />
                </div>
                <span className="font-medium">{item.name}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </Link>
            )
          })}
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="p-4 bg-gradient-to-br from-secondary/80 to-secondary/40 backdrop-blur-sm rounded-xl border border-border/50 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-foreground">Connected Chains</div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">Live</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-xs font-medium text-green-700 dark:text-green-300">Polkadot</span>
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">Active</div>
              </div>
              <div className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">Kusama</span>
                </div>
                <div className="text-xs text-yellow-600 dark:text-yellow-400">Syncing</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}