# EcoConnect Backend API

A comprehensive Node.js/Express backend for the EcoConnect platform with MongoDB Atlas integration, JWT authentication, and role-based access control.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Database**: MongoDB Atlas with Mongoose ODM
- **Security**: Helmet, CORS, rate limiting, input validation
- **Models**: User, Community, Event, Habit management
- **API**: RESTful endpoints with proper error handling
- **Validation**: Express-validator with custom middleware
- **Logging**: Morgan for HTTP request logging
- **Environment**: Configurable via environment variables

## 🛠️ Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js 5.x
- **Database**: MongoDB Atlas with Mongoose 8.x
- **Authentication**: JWT with bcryptjs
- **Validation**: Express-validator
- **Security**: Helmet, CORS, rate limiting
- **Development**: tsx for hot reloading

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   └── index.ts         # Main server file
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB Atlas account
- pnpm (recommended) or npm

### 1. Install Dependencies

```bash
cd backend
pnpm install
```

### 2. Environment Setup

Copy the environment template and configure your variables:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:8080
```

### 3. MongoDB Atlas Setup

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Create a database user with read/write permissions
4. Get your connection string
5. Replace `<username>`, `<password>`, `<cluster>`, and `<database>` in your `.env`

### 4. Run Development Server

```bash
pnpm dev
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user

**Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user",
  "organizationName": "Optional for NGO"
}
```

#### POST `/api/auth/login`
Login user

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### POST `/api/auth/refresh-token`
Refresh JWT token

**Body:**
```json
{
  "refreshToken": "your-refresh-token"
}
```

#### GET `/api/auth/profile`
Get user profile (requires authentication)

#### PUT `/api/auth/profile`
Update user profile (requires authentication)

#### PUT `/api/auth/change-password`
Change password (requires authentication)

### Health Check

#### GET `/health`
Server health status

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles

- **user**: Regular user with basic permissions
- **ngo**: NGO organization with extended permissions
- **admin**: Administrator with full access

## 🗄️ Database Models

### User
- Authentication fields (email, password)
- Profile information (fullName, avatar)
- Role-based access control
- Organization details for NGOs

### Community
- Community management
- Member management
- Location and categorization
- Rules and guidelines

### Event
- Event creation and management
- Participant tracking
- Location and scheduling
- Virtual event support

### Habit
- Sustainability habit tracking
- Streak counting
- Goal setting
- Reminder system

## 🛡️ Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API request throttling
- **Input Validation**: Request data validation
- **JWT**: Secure token-based authentication
- **Password Hashing**: bcrypt with configurable rounds

## 🧪 Development

### Available Scripts

```bash
pnpm dev          # Start development server with hot reload
pnpm build        # Build for production
pnpm start        # Start production server
pnpm test         # Run tests
pnpm lint         # Lint code
pnpm format       # Format code
```

### TypeScript Configuration

The project uses strict TypeScript configuration with:
- Path aliases for clean imports
- Strict type checking
- Source maps for debugging
- Declaration files generation

## 🚀 Production Deployment

### Build and Start

```bash
pnpm build
pnpm start
```

### Environment Variables

Ensure all production environment variables are set:
- `NODE_ENV=production`
- `MONGODB_URI` with production database
- Strong `JWT_SECRET`
- Proper `CORS_ORIGIN` for production domains

### Monitoring

The server includes:
- Health check endpoint
- Request logging
- Error tracking
- Graceful shutdown handling

## 🤝 Contributing

1. Follow the existing code style
2. Add proper error handling
3. Include input validation
4. Write tests for new features
5. Update documentation

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the documentation
2. Review existing issues
3. Create a new issue with detailed information
