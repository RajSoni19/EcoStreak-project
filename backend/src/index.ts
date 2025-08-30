import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { connectDB } from '@/config/database';
import { serverConfig } from '@/config/server';
import authRoutes from '@/routes/auth';
import communityRoutes from '@/routes/community';
import eventRoutes from '@/routes/events';
import habitRoutes from '@/routes/habits';
import storeRoutes from '@/routes/store';
import leaderboardRoutes from '@/routes/leaderboard';
import ngoRoutes from '@/routes/ngo';
import communityPostRoutes from '@/routes/communityPosts';

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: serverConfig.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: serverConfig.rateLimit.windowMs,
  max: serverConfig.rateLimit.maxRequests,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (serverConfig.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'EcoConnect Backend is running',
    timestamp: new Date().toISOString(),
    environment: serverConfig.nodeEnv,
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/ngo', ngoRoutes);
app.use('/api/community-posts', communityPostRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', error);
  
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(serverConfig.nodeEnv === 'development' && { stack: error.stack }),
  });
});

// Start server
const startServer = async () => {
  try {
    // Try to connect to MongoDB, but don't fail if it doesn't work
    try {
      await connectDB();
    } catch (dbError) {
      console.log('⚠️ Database connection failed, but continuing server startup...');
      console.log('💡 The server will run but database features will not work');
    }
    
    // Start Express server
    const server = app.listen(serverConfig.port, () => {
      console.log(`🚀 EcoConnect Backend server running on port ${serverConfig.port}`);
      console.log(`🌍 Environment: ${serverConfig.nodeEnv}`);
      console.log(`📊 Health check: http://localhost:${serverConfig.port}/health`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('Process terminated');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();
