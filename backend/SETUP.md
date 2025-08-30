# EcoConnect Backend Setup Guide

## Quick Start

### Option 1: Use Local MongoDB (Recommended for Development)

1. **Install MongoDB Community Server**
   - Download from: https://www.mongodb.com/try/download/community
   - Install and start the MongoDB service

2. **Start MongoDB**
   ```bash
   # Windows (if installed as a service)
   net start MongoDB
   
   # Or manually start
   mongod
   ```

3. **Create .env file**
   Create a `.env` file in the backend directory with:
   ```
   PORT=8080
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/ecoconnect
   JWT_SECRET=your-secret-key-here
   CORS_ORIGIN=http://localhost:3000,http://localhost:5173,http://localhost:8080
   ```

### Option 2: Use MongoDB Atlas (Production)

1. **Create MongoDB Atlas Account**
   - Go to: https://www.mongodb.com/atlas
   - Create a free cluster

2. **Configure Network Access**
   - Add your IP address to the IP whitelist
   - Or add `0.0.0.0/0` for all IPs (not recommended for production)

3. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string

4. **Create .env file**
   ```
   PORT=8080
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecoconnect
   JWT_SECRET=your-secret-key-here
   CORS_ORIGIN=http://localhost:3000,http://localhost:5173,http://localhost:8080
   ```

## Running the Backend

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## API Endpoints

Once running, the server will be available at:
- **Health Check**: http://localhost:8080/health
- **API Base**: http://localhost:8080/api/
- **Auth**: http://localhost:8080/api/auth
- **Communities**: http://localhost:8080/api/communities
- **Events**: http://localhost:8080/api/events
- **Habits**: http://localhost:8080/api/habits
- **Store**: http://localhost:8080/api/store
- **Leaderboard**: http://localhost:8080/api/leaderboard
- **NGO**: http://localhost:8080/api/ngo
- **Community Posts**: http://localhost:8080/api/community-posts

## Troubleshooting

### MongoDB Connection Issues
- Make sure MongoDB is running
- Check if the port 27017 is available
- Verify connection string format
- Check IP whitelist for Atlas

### Port Already in Use
- Change PORT in .env file
- Kill process using the port: `netstat -ano | findstr :8080`

### TypeScript Errors
- Run `npm run build` to check for compilation errors
- Make sure all dependencies are installed
