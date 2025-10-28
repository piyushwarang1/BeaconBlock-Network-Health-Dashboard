import { Server, Socket } from 'socket.io';
import { Logger } from 'winston';
import { ChainManager } from './ChainManager';
import { SocketEvents } from '../types';

export class SocketService {
  private io: Server;
  private chainManager: ChainManager;
  private logger: Logger;
  private connectedClients: Map<string, Socket> = new Map();

  constructor(io: Server, chainManager: ChainManager, logger: Logger) {
    this.io = io;
    this.chainManager = chainManager;
    this.logger = logger;
    
    this.setupEventHandlers();
  }

  /**
   * Handle new client connections
   */
  handleConnection(socket: Socket): void {
    const clientId = socket.id;
    this.connectedClients.set(clientId, socket);
    
    this.logger.info(`Client connected: ${clientId}`);

    // Configure socket timeouts and error handling
    socket.conn.on('ping timeout', () => {
      this.logger.warn(`Ping timeout for client ${clientId}`);
    });

    socket.conn.on('error', (error) => {
      this.logger.error(`Socket connection error for client ${clientId}:`, error);
    });

    // Send current chain list to new client
    this.sendChainList(socket);

    // Handle client events
    socket.on('chain:connect', async (data) => {
      await this.handleChainConnect(socket, data);
    });

    socket.on('chain:disconnect', async (data) => {
      await this.handleChainDisconnect(socket, data);
    });

    socket.on('chain:subscribe', (data) => {
      this.handleChainSubscribe(socket, data);
    });

    socket.on('chain:unsubscribe', (data) => {
      this.handleChainUnsubscribe(socket, data);
    });

    socket.on('disconnect', () => {
      this.handleClientDisconnect(clientId);
    });

    socket.on('error', (error) => {
      this.logger.error(`Socket error for client ${clientId}:`, error);
    });
  }

  /**
   * Setup event handlers for chain manager events
   */
  private setupEventHandlers(): void {
    // Note: In a real implementation, ChainManager would emit events
    // For now, we'll poll for updates periodically
    
    // Use a more efficient polling mechanism with error handling
    const pollInterval = setInterval(() => {
      try {
        this.broadcastChainUpdates();
      } catch (error) {
        this.logger.error('Error in broadcast chain updates:', error);
        // Continue execution despite errors
      }
    }, 5000); // Every 5 seconds
    
    // Handle process termination to clean up resources
    process.on('SIGTERM', () => {
      clearInterval(pollInterval);
      this.logger.info('Socket service polling stopped due to process termination');
    });
  }

  /**
   * Handle chain connection requests
   */
  private async handleChainConnect(socket: Socket, data: { wsUrl: string; name?: string }): Promise<void> {
    try {
      this.logger.info(`Client ${socket.id} requesting connection to: ${data.wsUrl}`);
      
      const connection = await this.chainManager.connectToChain(data.wsUrl, data.name);
      
      // Notify client of successful connection
      socket.emit('chain:connected', {
        chainId: connection.info.id,
        metadata: connection.metadata
      });

      // Broadcast to all clients
      this.io.emit('chain:list', this.chainManager.getConnectedChains());
      
      this.logger.info(`Successfully connected client ${socket.id} to chain: ${connection.info.name}`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to connect to chain for client ${socket.id}:`, error);
      
      socket.emit('chain:error', {
        wsUrl: data.wsUrl,
        error: errorMessage
      });
    }
  }

  /**
   * Handle chain disconnection requests
   */
  private async handleChainDisconnect(socket: Socket, data: { chainId: string }): Promise<void> {
    try {
      await this.chainManager.disconnectChain(data.chainId);
      
      // Notify all clients
      this.io.emit('chain:disconnected', { chainId: data.chainId });
      this.io.emit('chain:list', this.chainManager.getConnectedChains());
      
      this.logger.info(`Chain ${data.chainId} disconnected by client ${socket.id}`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to disconnect chain ${data.chainId}:`, error);
      
      socket.emit('chain:error', {
        chainId: data.chainId,
        error: errorMessage
      });
    }
  }

  /**
   * Handle chain subscription requests
   */
  private handleChainSubscribe(socket: Socket, data: { chainId: string; events: string[] }): void {
    const { chainId, events } = data;
    
    // Join room for this chain
    socket.join(`chain:${chainId}`);
    
    // Subscribe to specific events if provided
    if (events && events.length > 0) {
      events.forEach(event => {
        socket.join(`chain:${chainId}:${event}`);
      });
    }
    
    // Send current data immediately
    const connection = this.chainManager.getChainConnection(chainId);
    if (connection) {
      // Send current stats
      if (connection.stats) {
        socket.emit('chain:stats', connection.stats);
      }
      
      // Send recent blocks
      const recentBlocks = this.chainManager.getRecentBlocks(chainId);
      if (recentBlocks.length > 0) {
        socket.emit('chain:blocks', {
          chainId,
          blocks: recentBlocks
        });
      }
    }
    
    this.logger.debug(`Client ${socket.id} subscribed to chain ${chainId}`);
  }

  /**
   * Handle chain unsubscription requests
   */
  private handleChainUnsubscribe(socket: Socket, data: { chainId: string; events?: string[] }): void {
    const { chainId, events } = data;
    
    if (events && events.length > 0) {
      // Unsubscribe from specific events
      events.forEach(event => {
        socket.leave(`chain:${chainId}:${event}`);
      });
    } else {
      // Unsubscribe from all chain events
      socket.leave(`chain:${chainId}`);
    }
    
    this.logger.debug(`Client ${socket.id} unsubscribed from chain ${chainId}`);
  }

  /**
   * Handle client disconnection
   */
  private handleClientDisconnect(clientId: string): void {
    this.connectedClients.delete(clientId);
    this.logger.info(`Client disconnected: ${clientId}`);
  }

  /**
   * Send current chain list to a specific socket
   */
  private sendChainList(socket: Socket): void {
    const chains = this.chainManager.getConnectedChains();
    socket.emit('chain:list', chains);
  }

  /**
   * Broadcast chain updates to subscribed clients
   */
  private broadcastChainUpdates(): void {
    const chains = this.chainManager.getConnectedChains();
    
    chains.forEach(chainInfo => {
      const connection = this.chainManager.getChainConnection(chainInfo.id);
      if (!connection) return;

      // Broadcast network stats
      if (connection.stats) {
        this.io.to(`chain:${chainInfo.id}`).emit('chain:stats', connection.stats);
      }

      // Broadcast new blocks if any
      const recentBlocks = this.chainManager.getRecentBlocks(chainInfo.id);
      if (recentBlocks.length > 0) {
        // Only send the most recent block to avoid spam
        const latestBlock = recentBlocks[0];
        this.io.to(`chain:${chainInfo.id}`).emit('chain:newBlock', {
          chainId: chainInfo.id,
          block: latestBlock
        });
      }
    });
  }

  /**
   * Broadcast a message to all connected clients
   */
  broadcastToAll(event: string, data: any): void {
    this.io.emit(event, data);
  }

  /**
   * Send a message to clients subscribed to a specific chain
   */
  broadcastToChain(chainId: string, event: string, data: any): void {
    this.io.to(`chain:${chainId}`).emit(event, data);
  }

  /**
   * Send a message to clients subscribed to a specific chain event
   */
  broadcastToChainEvent(chainId: string, eventType: string, event: string, data: any): void {
    this.io.to(`chain:${chainId}:${eventType}`).emit(event, data);
  }

  /**
   * Get connected client count
   */
  getConnectedClientCount(): number {
    return this.connectedClients.size;
  }

  /**
   * Get clients subscribed to a specific chain
   */
  getChainSubscribers(chainId: string): number {
    const room = this.io.sockets.adapter.rooms.get(`chain:${chainId}`);
    return room ? room.size : 0;
  }

  /**
   * Force disconnect all clients (for shutdown)
   */
  disconnectAllClients(): void {
    this.io.disconnectSockets(true);
    this.connectedClients.clear();
  }
}