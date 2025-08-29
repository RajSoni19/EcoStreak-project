import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not defined');
  console.log('Please create a .env file with your MongoDB Atlas connection string');
  process.exit(1);
}

async function testConnection() {
  try {
    console.log('🔌 Testing MongoDB Atlas connection...');
    
    const conn = await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Atlas connected successfully!`);
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   Port: ${conn.connection.port}`);
    
    // Test basic operations
    console.log('\n🧪 Testing basic operations...');
    
    // Test User model
    const User = mongoose.model('User', new mongoose.Schema({
      fullName: String,
      email: String,
      role: String
    }));
    
    const testUser = new User({
      fullName: 'Test User',
      email: 'test@example.com',
      role: 'user'
    });
    
    await testUser.save();
    console.log('✅ User model test: PASSED');
    
    await User.findByIdAndDelete(testUser._id);
    console.log('✅ User deletion test: PASSED');
    
    console.log('\n🎉 All tests passed! MongoDB Atlas is working correctly.');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. Check if your MongoDB Atlas cluster is running');
      console.log('2. Verify your connection string in .env file');
      console.log('3. Ensure your IP address is whitelisted in Atlas');
      console.log('4. Check if username/password are correct');
    }
    
    if (error.message.includes('Authentication failed')) {
      console.log('\n💡 Authentication failed. Please check:');
      console.log('1. Username and password in connection string');
      console.log('2. Database user permissions in Atlas');
    }
    
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Connection closed');
    process.exit(0);
  }
}

testConnection();
