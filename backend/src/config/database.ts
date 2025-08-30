import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Try to get MongoDB URI from environment, fallback to local MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecoconnect';

export const connectDB = async (): Promise<void> => {
  try {
    console.log('🔌 Attempting to connect to MongoDB...');
    console.log(`📍 Connection string: ${MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`);
    
    const conn = await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000, // Increased timeout
      socketTimeoutMS: 45000,
      // Add these options for better compatibility
      retryWrites: true,
      w: 'majority',
    });

    console.log(`✅ MongoDB connected successfully: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        console.error('❌ Error during MongoDB connection closure:', err);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    
    // Provide helpful error messages
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        console.log('💡 Tip: Make sure MongoDB is running locally on port 27017');
        console.log('   You can start MongoDB with: mongod');
        console.log('   Or install MongoDB Community Server from: https://www.mongodb.com/try/download/community');
      } else if (error.message.includes('authentication')) {
        console.log('💡 Tip: Check your MongoDB username/password in the connection string');
      } else if (error.message.includes('whitelist')) {
        console.log('💡 Tip: Add your IP address to MongoDB Atlas IP whitelist');
        console.log('   Or use a local MongoDB instance for development');
      }
    }
    
    // For development, we can continue without MongoDB
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️ Continuing in development mode without database connection');
      console.log('💡 Some features may not work properly');
    } else {
      process.exit(1);
    }
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error);
  }
};
