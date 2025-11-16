import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import winston from 'winston';
import dotenv from 'dotenv';
import { ChainManager } from './services/ChainManager';
import { EVMService } from './services/EVMService';
import { PriceService } from './services/PriceService';
import { VolumeService } from './services/VolumeService';
import { ChainDiscovery } from './services/ChainDiscovery';
import { chainRoutes } from './routes/chains';
import { discoveryRoutes } from './routes/discovery';
import { evmRoutes } from './routes/evm';
import { priceRoutes } from './routes/prices';
import { volumeRoutes } from './routes/volume';
import { predictionsRoutes } from './routes/predictions';
import { sentimentRoutes } from './routes/sentiment';

dotenv.config();

// Initialize logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Initialize Express app
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Initialize services
const chainManager = new ChainManager(logger);
const evmService = new EVMService(logger);
const priceService = new PriceService(logger);
const volumeService = new VolumeService(logger);
const chainDiscovery = new ChainDiscovery(logger);

// Routes
app.use('/api/chains', chainRoutes(chainManager, evmService, logger));
app.use('/api/discovery', discoveryRoutes(chainDiscovery, logger));
app.use('/api/evm', evmRoutes(evmService, logger));
app.use('/api/prices', priceRoutes(priceService, logger));
app.use('/api/volume', volumeRoutes(volumeService, logger));
app.use('/api/predictions', predictionsRoutes(logger));
app.use('/api/sentiment', sentimentRoutes(logger));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    services: {
      chains: chainManager.getConnectedChains().length,
      evmChains: evmService.getConnectedChains().length
    }
  });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });

  socket.on('subscribeToChain', (chainId: string) => {
    socket.join(`chain:${chainId}`);
    logger.info(`Client ${socket.id} subscribed to chain ${chainId}`);
  });

  socket.on('unsubscribeFromChain', (chainId: string) => {
    socket.leave(`chain:${chainId}`);
    logger.info(`Client ${socket.id} unsubscribed from chain ${chainId}`);
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date()
  });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  await chainManager.disconnectAll();
  // evmService.disconnectAll(); // TODO: implement disconnectAll for EVMService
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  await chainManager.disconnectAll();
  // evmService.disconnectAll(); // TODO: implement disconnectAll for EVMService
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
