import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Search, 
  Network, 
  Shield, 
  Settings, 
  X 
} from 'lucide-react'

interface SidebarProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const location = useLocation()
  
  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Chain Explorer', href: '/explorer', icon: Search },
    { name: 'Network Discovery', href: '/discovery', icon: Network },
    { name: 'Validator Monitor', href: '/validators', icon: Shield },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar for mobile */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:z-auto ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/beacon-icon.svg" 
              alt="BeaconBlock Logo" 
              className="h-8 w-8" 
            />
            <span className="text-xl font-semibold">BeaconBlock</span>
          </Link>
          <button
            className="md:hidden"
            onClick={() => setOpen(false)}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close sidebar</span>
          </button>
        </div>
        
        <nav className="flex flex-col p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href !== '/' && location.pathname.startsWith(item.href))
              
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
                onClick={() => setOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="p-3 bg-secondary rounded-md">
            <div className="text-sm font-medium">Connected Chains</div>
            <div className="mt-1 text-xs text-muted-foreground">
              <div className="flex items-center">
                <div className="status-indicator status-healthy mr-2"></div>
                <span>Polkadot</span>
              </div>
              <div className="flex items-center mt-1">
                <div className="status-indicator status-warning mr-2"></div>
                <span>Kusama</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}