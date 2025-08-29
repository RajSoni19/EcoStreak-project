# EcoConnect Project Structure

This document outlines the complete project structure after reorganization into separate frontend and backend folders.

## 📁 Overall Project Structure

```
nexathon-final-frontend/
├── frontend/                 # React SPA Frontend
│   ├── client/              # React application
│   ├── public/              # Static assets
│   ├── package.json         # Frontend dependencies
│   ├── tailwind.config.ts   # TailwindCSS configuration
│   └── vite.config.ts       # Vite configuration
│
├── backend/                  # Node.js/Express Backend
│   ├── src/                 # Source code
│   ├── package.json         # Backend dependencies
│   ├── tsconfig.json        # TypeScript configuration
│   ├── .env                 # Environment variables
│   └── README.md            # Backend documentation
│
├── shared/                   # Shared types and utilities
├── package.json              # Root package.json
└── README.md                 # Project overview
```

## 🎯 Frontend (React SPA)

### Location: `frontend/` folder
- **Framework**: React 18 + TypeScript
- **Routing**: React Router 6 (SPA mode)
- **Styling**: TailwindCSS 3 + Radix UI components
- **Build Tool**: Vite
- **State Management**: React hooks + Context API

### Key Features:
- User authentication (Login/Register)
- Role-based dashboards (User, NGO, Admin)
- Community management
- Event management
- Habit tracking
- Eco-friendly store
- Responsive design with mobile support

### Pages:
- `/` - Landing page
- `/login` - User authentication
- `/register` - User registration
- `/user/dashboard` - User dashboard
- `/ngo/dashboard` - NGO dashboard
- `/admin/dashboard` - Admin dashboard
- `/communities` - Community listings
- `/events` - Event management
- `/habits` - Habit tracking
- `/store` - Eco-friendly products

## 🚀 Backend (Node.js/Express)

### Location: `backend/` folder
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js 5.x
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: JWT with bcryptjs
- **Validation**: Express-validator
- **Security**: Helmet, CORS, rate limiting

### Architecture:
```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── database.ts      # MongoDB connection
│   │   └── server.ts        # Server configuration
│   │
│   ├── controllers/         # Route controllers
│   │   ├── authController.ts # Authentication logic
│   │   └── communityController.ts # Community management
│   │
│   ├── middleware/          # Custom middleware
│   │   ├── auth.ts          # JWT authentication
│   │   └── validation.ts    # Request validation
│   │
│   ├── models/              # MongoDB models
│   │   ├── User.ts          # User management
│   │   ├── Community.ts     # Community data
│   │   ├── Event.ts         # Event management
│   │   ├── Habit.ts         # Habit tracking
│   │   └── Store.ts         # Store management
│   │
│   ├── routes/              # API routes
│   │   ├── auth.ts          # Authentication endpoints
│   │   └── community.ts     # Community endpoints
│   │
│   ├── services/            # Business logic (future)
│   ├── utils/               # Utility functions (future)
│   └── index.ts             # Main server file
│
├── package.json              # Dependencies
├── tsconfig.json            # TypeScript config
├── .env                     # Environment variables
└── README.md                # Backend documentation
```

### API Endpoints:

#### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User authentication
- `POST /refresh-token` - Token refresh
- `GET /profile` - Get user profile
- `PUT /profile` - Update profile
- `PUT /change-password` - Change password

#### Communities (`/api/communities`)
- `GET /` - List communities (public)
- `GET /:id` - Get community details
- `POST /` - Create community
- `PUT /:id` - Update community
- `POST /:id/join` - Join community
- `POST /:id/leave` - Leave community
- `DELETE /:id` - Delete community

#### Health Check
- `GET /health` - Server status

## 🗄️ Database Models

### User Model
- Authentication fields (email, password)
- Profile information (fullName, avatar)
- Role-based access control (user, ngo, admin)
- Organization details for NGOs
- Account status and verification

### Community Model
- Community information (name, description, category)
- Member management (creator, members, moderators)
- Location and categorization
- Rules and guidelines
- Privacy settings

### Event Model
- Event details (title, description, dates)
- Location and scheduling
- Participant tracking
- Virtual event support
- Status management

### Habit Model
- Sustainability habit tracking
- Streak counting and goals
- Reminder system
- Progress analytics

### Store Model
- Eco-friendly store information
- Product categories and tags
- Location and contact details
- Rating and verification system

## 🔐 Security Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- Token refresh mechanism

### API Security
- Helmet security headers
- CORS configuration
- Rate limiting
- Input validation
- SQL injection prevention

### Data Protection
- Environment variable management
- Secure database connections
- Request/response validation
- Error handling without data leakage

## 🚀 Development Workflow

### Frontend Development
```bash
cd frontend
npm install
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
```

### Backend Development
```bash
cd backend
npm install
npm run dev          # Start with hot reload
npm run build        # Build TypeScript
npm run start        # Start production server
npm run test         # Run tests
```

### Environment Setup
1. Copy `backend/env.example` to `backend/.env`
2. Configure MongoDB Atlas connection string
3. Set JWT secrets and other environment variables
4. Update CORS origins for your domains

## 🌐 Deployment

### Frontend Deployment
- **Netlify**: Automatic deployment from Git
- **Vercel**: Optimized for React applications
- **Static hosting**: Any CDN or web server

### Backend Deployment
- **Heroku**: Easy Node.js deployment
- **Railway**: Modern deployment platform
- **DigitalOcean**: VPS with Docker support
- **AWS/GCP**: Cloud infrastructure

### Database
- **MongoDB Atlas**: Cloud-hosted MongoDB
- **Connection**: Secure connection strings
- **Backup**: Automated backups and monitoring

## 📊 Monitoring & Maintenance

### Health Checks
- Server health endpoint
- Database connection monitoring
- Request logging with Morgan
- Error tracking and reporting

### Performance
- Rate limiting for API protection
- Database indexing for queries
- Compression middleware
- Caching strategies (future)

## 🔄 Future Enhancements

### Planned Features
- Real-time notifications
- File upload with Cloudinary
- Email notifications
- Advanced search and filtering
- Analytics dashboard
- Mobile app development

### Technical Improvements
- GraphQL API
- Redis caching
- Microservices architecture
- Containerization with Docker
- CI/CD pipeline automation

## 📝 Documentation

### API Documentation
- OpenAPI/Swagger specification
- Postman collections
- Example requests/responses
- Error code reference

### Development Guides
- Setup instructions
- Contributing guidelines
- Code style guide
- Testing strategies

---

This structure provides a solid foundation for the EcoConnect platform with clear separation of concerns, scalable architecture, and modern development practices.
