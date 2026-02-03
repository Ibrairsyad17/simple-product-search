# Simple Product Search - Server

A robust Express.js backend API for the Simple Product Search application, featuring authentication, product management, and comprehensive API documentation.

## 🚀 Features

- **RESTful API**: Clean and well-structured REST endpoints
- **Authentication**: JWT-based auth with refresh tokens + Google OAuth
- **Database**: Prisma ORM with MySQL/MariaDB
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Validation**: Request validation with Zod schemas
- **Error Handling**: Centralized error handling middleware
- **Security**: bcrypt password hashing, HTTP-only cookies
- **CORS**: Configured for cross-origin requests
- **Type Safety**: Full TypeScript support

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5
- **Database**: MySQL/MariaDB with Prisma ORM
- **Authentication**: JWT + Google OAuth 2.0
- **Validation**: Zod
- **Documentation**: Swagger (swagger-jsdoc + swagger-ui-express)
- **Password Hashing**: bcryptjs
- **Language**: TypeScript

## 📁 Project Structure

```
src/
├── config/              # Configuration files
│   ├── database.ts     # Database connection
│   ├── swagger.ts      # Swagger/OpenAPI setup
│   └── index.ts        # General config
├── controllers/         # Request handlers
│   ├── auth.controller.ts
│   ├── category.controller.ts
│   └── product.controller.ts
├── middlewares/         # Express middlewares
│   ├── auth.middleware.ts      # JWT authentication
│   └── error.middleware.ts     # Error handling
├── repositories/        # Data access layer
│   ├── user.repository.ts
│   ├── product.repository.ts
│   └── category.repository.ts
├── routes/             # API route definitions
│   ├── auth.routes.ts
│   ├── category.routes.ts
│   └── product.routes.ts
├── services/           # Business logic
│   ├── auth.service.ts
│   ├── product.service.ts
│   └── category.service.ts
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
prisma/
├── schema.prisma       # Prisma database schema
├── seed.ts            # Database seeding script
└── migrations/        # Database migrations
```

## 📋 Prerequisites

- Node.js 18+
- MySQL or MariaDB database
- PNPM package manager
- Google OAuth credentials (for OAuth feature)

## 🚀 Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Variables

Create a `.env` file in the server directory:

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/product_search"

# JWT Secrets
JWT_SECRET="your-strong-jwt-secret"
JWT_REFRESH_SECRET="your-strong-refresh-secret"

# Server
PORT=3000
NODE_ENV=development

# CORS
CLIENT_URL="http://localhost:5173"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. Database Setup

```bash
# Generate Prisma Client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate

# Seed database (optional)
pnpm prisma:seed
```

### 4. Start Development Server

```bash
pnpm dev
```

The server will start at http://localhost:3000

## 📜 Available Scripts

- `pnpm dev` - Start development server with hot reload (tsx watch)
- `pnpm start` - Start production server
- `pnpm prisma:generate` - Generate Prisma Client
- `pnpm prisma:migrate` - Create and run database migrations
- `pnpm prisma:studio` - Open Prisma Studio (GUI for database)
- `pnpm prisma:seed` - Seed database with sample data

## 📚 API Documentation

### Swagger UI

Once the server is running, access interactive API documentation at:

- **Swagger UI**: http://localhost:3000/api-docs
- **OpenAPI JSON**: http://localhost:3000/api-docs.json

### Health Check

```
GET /check-health
```

Returns server health status.

## 🔐 Authentication

### Endpoints

#### Register

```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

#### Login

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### Google OAuth

```
POST /api/auth/google
Content-Type: application/json

{
  "token": "google-oauth-token"
}
```

#### Refresh Token

```
POST /api/auth/refresh
Cookie: refreshToken=<token>
```

#### Logout

```
POST /api/auth/logout
Cookie: refreshToken=<token>
```

### Authentication Flow

1. User logs in with credentials or Google OAuth
2. Server returns access token (JWT) and sets refresh token in HTTP-only cookie
3. Client includes access token in Authorization header for protected routes
4. When access token expires, client uses refresh token to get new access token
5. Logout invalidates refresh token

### Protected Routes

Protected routes require the `Authorization` header:

```
Authorization: Bearer <access-token>
```

Implement via the `authenticateToken` middleware.

## 📦 API Endpoints

### Products

```
GET    /api/products              # Get all products (with filters)
GET    /api/products/:id          # Get product by ID
POST   /api/products              # Create product (protected)
PUT    /api/products/:id          # Update product (protected)
DELETE /api/products/:id          # Delete product (protected)
```

**Query Parameters for GET /api/products:**

- `search` - Search term for product name/description
- `categoryIds` - Comma-separated category IDs
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `minRating` - Minimum rating filter
- `inStock` - Filter by stock status (true/false)
- `sortBy` - Sort field (price, rating, createdAt)
- `sortOrder` - Sort direction (asc, desc)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

### Categories

```
GET    /api/categories            # Get all categories
GET    /api/categories/:id        # Get category by ID
POST   /api/categories            # Create category (protected)
PUT    /api/categories/:id        # Update category (protected)
DELETE /api/categories/:id        # Delete category (protected)
```

### Authentication

```
POST   /api/auth/register         # Register new user
POST   /api/auth/login            # Login
POST   /api/auth/google           # Google OAuth login
POST   /api/auth/refresh          # Refresh access token
POST   /api/auth/logout           # Logout
GET    /api/auth/me               # Get current user (protected)
```

## 🗄️ Database Schema

### Models

#### User

- `id`: UUID (primary key)
- `email`: String (unique)
- `password`: String (nullable for OAuth users)
- `name`: String
- `provider`: String (local/google)
- `googleId`: String (unique, nullable)
- `createdAt`: DateTime
- `updatedAt`: DateTime

#### Product

- `id`: UUID (primary key)
- `name`: String
- `description`: Text
- `price`: Decimal(10,2)
- `rating`: Decimal(3,2)
- `inStock`: Boolean
- `createdAt`: DateTime
- `updatedAt`: DateTime

#### Category

- `id`: UUID (primary key)
- `name`: String (unique)

#### ProductImage

- `id`: UUID (primary key)
- `url`: String
- `productId`: UUID (foreign key)

#### ProductCategory

- `productId`: UUID (composite key)
- `categoryId`: UUID (composite key)

#### RefreshToken

- `id`: UUID (primary key)
- `token`: String (unique)
- `userId`: UUID (foreign key)
- `expiresAt`: DateTime
- `createdAt`: DateTime

## 🔧 Middleware

### Authentication Middleware

- `authenticateToken` - Validates JWT access token
- Extracts user information from token
- Attaches user to request object

### Error Middleware

- `errorHandler` - Centralized error handling
- `notFoundHandler` - 404 handler for undefined routes

## 🏗️ Architecture

### Repository Pattern

Data access is abstracted through repositories, making it easy to:

- Mock data for testing
- Change database implementation
- Maintain clean separation of concerns

### Service Layer

Business logic is encapsulated in service files:

- Input validation
- Business rule enforcement
- Data transformation
- External API integration

### Controller Layer

Controllers handle HTTP concerns:

- Request parsing
- Response formatting
- Status code management
- Error propagation

## 🔒 Security Best Practices

1. **Password Hashing**: bcrypt with salt rounds
2. **JWT Secrets**: Strong, unique secrets for tokens
3. **HTTP-Only Cookies**: Refresh tokens stored securely
4. **CORS**: Configured for specific origin
5. **Input Validation**: Zod schemas for all inputs
6. **SQL Injection Protection**: Prisma parameterized queries
7. **Environment Variables**: Sensitive data in .env

## 🧪 Testing

The API can be tested using:

- **Swagger UI**: Interactive testing at `/api-docs`
- **Postman/Insomnia**: Import OpenAPI spec
- **K6**: Load testing scripts in project root
- **cURL**: Command-line testing

## 🚀 Deployment

### Production Checklist

1. Set `NODE_ENV=production`
2. Use strong JWT secrets
3. Configure production database
4. Set up proper CORS origins
5. Enable HTTPS
6. Set up database backups
7. Configure logging
8. Set up monitoring

### Environment Variables for Production

```env
NODE_ENV=production
DATABASE_URL="mysql://user:password@prod-host:3306/product_search"
JWT_SECRET="production-secret"
JWT_REFRESH_SECRET="production-refresh-secret"
CLIENT_URL="https://your-production-domain.com"
PORT=3000
```

## 📝 API Response Format

### Success Response

```json
{
  "code": 200,
  "status": "success",
  "data": {
    /* response data */
  }
}
```

### Error Response

```json
{
  "code": 400,
  "status": "error",
  "message": "Error description"
}
```

### Paginated Response

```json
{
  "code": 200,
  "status": "success",
  "data": [
    /* items */
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## 🤝 Contributing

1. Follow the existing code structure
2. Add Swagger documentation for new endpoints
3. Validate inputs with Zod schemas
4. Write clean, typed TypeScript code
5. Use the repository pattern for data access

## 📄 License

This project is for educational purposes.
