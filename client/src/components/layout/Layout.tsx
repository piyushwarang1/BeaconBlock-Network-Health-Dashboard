import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import Footer from './Footer'

interface LayoutProps {
  socketConnected: boolean
}

export default function Layout({ socketConnected }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const isHomePage = location.pathname === '/'

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {!isHomePage && <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />}

      <div className={`flex flex-col flex-1 w-full overflow-hidden ${isHomePage ? '' : ''}`}>
        {!isHomePage && (
          <Header
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            socketConnected={socketConnected}
            showSidebarButton={!isHomePage}
          />
        )}

        <main className={`flex-1 overflow-y-auto ${isHomePage ? 'p-0' : 'p-4 md:p-6'}`}>
          <Outlet />
        </main>

        {!isHomePage && <Footer />}
      </div>
    </div>
  )
}