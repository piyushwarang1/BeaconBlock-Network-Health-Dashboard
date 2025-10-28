import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './components/theme/theme-provider'
import { ErrorBoundary } from './components/ErrorBoundary'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import ChainExplorer from './pages/ChainExplorer'
import NetworkDiscovery from './pages/NetworkDiscovery'
import ValidatorMonitor from './pages/ValidatorMonitor'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'
import { socket } from './lib/socket'

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected)

  useEffect(() => {
    function onConnect() {
      setIsConnected(true)
    }

    function onDisconnect() {
      setIsConnected(false)
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
    }
  }, [])

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system" storageKey="beacon-block-theme">
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Layout socketConnected={isConnected} />}>
            <Route index element={<Dashboard />} />
            <Route path="explorer/:chainId?" element={<ChainExplorer />} />
            <Route path="discovery" element={<NetworkDiscovery />} />
            <Route path="validators/:chainId?" element={<ValidatorMonitor />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App