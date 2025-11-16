import { useTheme } from '../theme/theme-provider'
import { Sun, Moon, Menu, Wifi, WifiOff, Zap } from 'lucide-react'

interface HeaderProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  socketConnected: boolean
  showSidebarButton?: boolean
}

export default function Header({ sidebarOpen, setSidebarOpen, socketConnected, showSidebarButton = true }: HeaderProps) {
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            {showSidebarButton && (
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground hover:bg-accent/50 p-2 rounded-lg transition-all duration-200 md:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <span className="sr-only">Open sidebar</span>
                <Menu className="h-6 w-6" />
              </button>
            )}
            <div className="hidden md:flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-25"></div>
                <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                  <Zap className="h-5 w-5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  BeaconBlock
                </h1>
                <p className="text-xs text-muted-foreground">Network Health Dashboard</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 ${
              socketConnected
                ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800'
            }`}>
              <div className={`relative`}>
                {socketConnected ? (
                  <Wifi className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-600 dark:text-red-400" />
                )}
                {socketConnected && (
                  <div className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                )}
              </div>
              <span className={`text-sm font-medium ${
                socketConnected ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
              }`}>
                {socketConnected ? 'Live' : 'Offline'}
              </span>
            </div>

            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-accent/50 transition-all duration-200 group"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-yellow-500 group-hover:text-yellow-400 transition-colors" />
              ) : (
                <Moon className="h-5 w-5 text-slate-600 group-hover:text-slate-500 transition-colors" />
              )}
              <span className="sr-only">Toggle theme</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}