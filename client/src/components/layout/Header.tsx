import { Link } from 'react-router-dom'
import { useTheme } from '../theme/theme-provider'
import { Sun, Moon, Menu } from 'lucide-react'

interface HeaderProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  socketConnected: boolean
}

export default function Header({ sidebarOpen, setSidebarOpen, socketConnected }: HeaderProps) {
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-10 bg-background border-b border-border">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" />
            </button>
            <div className="hidden md:block">
              <h1 className="text-xl font-semibold">BeaconBlock</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-muted-foreground">
                {socketConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-md hover:bg-accent"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle theme</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}