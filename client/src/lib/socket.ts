import { io } from 'socket.io-client'

// Create a socket connection to the server
export const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
  autoConnect: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  transports: ['websocket', 'polling'],
  forceNew: true
})

// Socket event types
export enum SocketEvents {
  // Chain events
  CHAIN_CONNECTED = 'chain:connected',
  CHAIN_DISCONNECTED = 'chain:disconnected',
  CHAIN_ERROR = 'chain:error',
  
  // Block events
  NEW_BLOCK = 'block:new',
  FINALIZED_BLOCK = 'block:finalized',
  
  // Network stats events
  NETWORK_STATS = 'network:stats',
  
  // Subscription events
  SUBSCRIBE_CHAIN = 'subscribe:chain',
  UNSUBSCRIBE_CHAIN = 'unsubscribe:chain',
  
  // Connection events
  CONNECT_CHAIN = 'connect:chain',
  DISCONNECT_CHAIN = 'disconnect:chain',
}

// Helper functions for socket interactions
export const socketApi = {
  subscribeToChain: (chainId: string) => {
    socket.emit(SocketEvents.SUBSCRIBE_CHAIN, chainId)
  },
  
  unsubscribeFromChain: (chainId: string) => {
    socket.emit(SocketEvents.UNSUBSCRIBE_CHAIN, chainId)
  },
  
  connectToChain: (wsUrl: string, name?: string) => {
    socket.emit(SocketEvents.CONNECT_CHAIN, { wsUrl, name })
  },
  
  disconnectChain: (chainId: string) => {
    socket.emit(SocketEvents.DISCONNECT_CHAIN, chainId)
  },
}