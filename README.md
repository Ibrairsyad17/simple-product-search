# Simple Product Search

A full-stack e-commerce product search application built with modern web technologies. This monorepo contains both the frontend client and backend server for a scalable product search and management system.

## 🚀 Features

- **Product Search & Filtering**: Advanced product search with category filtering, price ranges, and ratings
- **Authentication**: Local authentication and Google OAuth integration
- **Real-time Search**: Debounced search with instant results
- **Responsive Design**: Modern UI built with React, TailwindCSS, and shadcn/ui
- **RESTful API**: Well-documented API with Swagger/OpenAPI documentation
- **Database**: Prisma ORM with MySQL/MariaDB for efficient data management
- **Load Testing**: K6 integration for performance testing
- **Type Safety**: Full TypeScript support across the stack

## 📁 Project Structure

```
.
├── packages/
│   ├── client/         # React + Vite frontend application
│   └── server/         # Express.js backend API
├── k6-tests/           # Load testing scripts
├── index.ts            # Concurrent development runner
└── pnpm-workspace.yaml # PNPM workspace configuration
```

## 🛠️ Tech Stack

### Frontend

- React 19 with TypeScript
- Vite for build tooling
- TailwindCSS 4 for styling
- shadcn/ui components
- Redux Toolkit & React Query for state management
- React Router for navigation

### Backend

- Node.js with Express 5
- Prisma ORM
- JWT authentication
- Google OAuth 2.0
- Swagger for API documentation
- MySQL/MariaDB database

## 📋 Prerequisites

- Node.js 18+ or Bun runtime
- PNPM package manager
- MySQL/MariaDB database
- Google OAuth credentials (for OAuth login)

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd simple-product-search
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

#### Server (.env in packages/server/)

```env
DATABASE_URL="mysql://user:password@localhost:3306/product_search"
JWT_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
CLIENT_URL="http://localhost:5173"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
PORT=3000
```

#### Client (.env in packages/client/)

```env
VITE_API_URL="http://localhost:3000"
VITE_GOOGLE_CLIENT_ID="your-google-client-id"
```

### 4. Set up the database

```bash
cd packages/server
pnpm prisma:migrate
pnpm prisma:seed    # Optional: seed with sample data
```

### 5. Run the development servers

From the root directory:

```bash
pnpm dev
```

This will start both the client (http://localhost:5173) and server (http://localhost:3000) concurrently.

Or run them separately:

```bash
# Terminal 1 - Server
cd packages/server
pnpm dev

# Terminal 2 - Client
cd packages/client
pnpm dev
```

## 📚 API Documentation

Once the server is running, visit:

- Swagger UI: http://localhost:3000/api-docs
- OpenAPI JSON: http://localhost:3000/api-docs.json

## 🧪 Load Testing

Run K6 load tests to evaluate performance:

```bash
# Login test
k6 run k6-tests/login-test.js

# Search test
k6 run k6-tests/search-test.js

# Concurrent test
k6 run k6-tests/concurrent-test.js
```

## 📦 Available Scripts

### Root Level

- `pnpm dev` - Run both client and server in development mode
- `pnpm format` - Format code with Prettier

### Server

- `pnpm dev` - Start development server with hot reload
- `pnpm start` - Start production server
- `pnpm prisma:generate` - Generate Prisma client
- `pnpm prisma:migrate` - Run database migrations
- `pnpm prisma:studio` - Open Prisma Studio
- `pnpm prisma:seed` - Seed database with sample data

### Client

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint

## 🗂️ Database Schema

- **Users**: User accounts with local and OAuth support
- **Products**: Product catalog with images and categories
- **Categories**: Product categorization
- **RefreshTokens**: JWT refresh token management

## 🔒 Authentication

The application supports two authentication methods:

1. **Local Authentication**: Email/password with bcrypt hashing
2. **Google OAuth**: Sign in with Google account

Tokens are managed using JWT with access and refresh token strategy.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is for educational purposes.

## 🔗 Links

- [Client Documentation](./packages/client/README.md)
- [Server Documentation](./packages/server/README.md)
