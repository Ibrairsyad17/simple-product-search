# Simple Product Search - Client

A modern React frontend application for product search and e-commerce functionality, built with Vite, TypeScript, and TailwindCSS.

## 🚀 Features

- **Product Search**: Real-time product search with debouncing
- **Advanced Filtering**: Filter by categories, price range, stock status, and ratings
- **Authentication**: Local login and Google OAuth integration
- **Responsive Design**: Mobile-first design with TailwindCSS
- **Modern UI**: Built with shadcn/ui components and Radix UI primitives
- **State Management**: Redux Toolkit for global state, React Query for server state
- **Type-Safe**: Full TypeScript support with strict mode

## 🛠️ Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite 7
- **Language**: TypeScript 5
- **Styling**: TailwindCSS 4
- **UI Components**: shadcn/ui + Radix UI
- **State Management**:
  - Redux Toolkit (global state)
  - TanStack Query (server state & caching)
- **Routing**: React Router DOM 7
- **HTTP Client**: Axios
- **OAuth**: @react-oauth/google
- **Notifications**: Sonner (toast notifications)

## 📁 Project Structure

```
src/
├── components/         # React components
│   ├── auth/          # Authentication components
│   ├── layout/        # Layout components (navbar, footer, etc.)
│   ├── product/       # Product-related components
│   ├── providers/     # Context providers
│   └── ui/            # shadcn/ui base components
├── hooks/             # Custom React hooks
│   ├── api/           # API query hooks (React Query)
│   ├── auth/          # Authentication hooks
│   └── miscellaneous/ # Utility hooks
├── redux/             # Redux store configuration
│   ├── slices/        # Redux slices
│   ├── hooks.ts       # Typed Redux hooks
│   └── store.ts       # Store configuration
├── services/          # API service layer
│   ├── authService.ts
│   ├── categoryService.ts
│   ├── productService.ts
│   └── httpClient.ts
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
├── constants/         # App constants
├── route.tsx          # Route definitions
└── main.tsx           # Application entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- PNPM package manager
- Backend server running (see [server README](../server/README.md))

### Installation

1. Install dependencies:

```bash
pnpm install
```

2. Create a `.env` file in the client directory:

```env
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

3. Start the development server:

```bash
pnpm dev
```

The application will be available at http://localhost:5173

## 📜 Available Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production (TypeScript compile + Vite build)
- `pnpm preview` - Preview production build locally
- `pnpm lint` - Run ESLint for code quality checks

## 🎨 UI Components

This project uses shadcn/ui components built on top of Radix UI primitives. Components are located in `src/components/ui/` and can be customized through `components.json`.

### Adding New Components

```bash
npx shadcn@latest add <component-name>
```

## 🔌 API Integration

### HTTP Client

All API calls go through the centralized `httpClient` (Axios instance) configured in `src/services/httpClient.ts`:

- Automatic JWT token attachment
- Request/response interceptors
- Error handling
- Credentials support

### Service Layer

API calls are organized by domain:

- `authService.ts` - Authentication endpoints
- `productService.ts` - Product CRUD operations
- `categoryService.ts` - Category operations

### React Query Hooks

Custom hooks in `src/hooks/api/` provide:

- Automatic caching
- Background refetching
- Optimistic updates
- Loading and error states

Example:

```typescript
const { data, isLoading, error } = useProducts(filters);
```

## 🔐 Authentication

The app supports two authentication methods:

1. **Local Authentication**: Email/password login
2. **Google OAuth**: Sign in with Google

Authentication state is managed through:

- Redux store for user data
- HTTP-only cookies for refresh tokens
- Local storage for access tokens (via JWT utility)

## 🎯 Key Features Implementation

### Product Search

- Debounced search input (500ms delay)
- URL parameter synchronization
- Persistent filters across page reloads

### Filtering

- Multiple category selection (checkbox-based)
- Price range slider
- Stock availability toggle
- Rating filter
- Sort options (price, rating, date)

### State Management

- **Redux**: User authentication, UI state
- **React Query**: Server data, caching, synchronization
- **URL State**: Search params for shareable filtered views

## 🎨 Styling

### TailwindCSS Configuration

Custom TailwindCSS setup with:

- Custom color palette
- Responsive breakpoints
- Dark mode support (class-based)
- Custom animations

### Utilities

- `cn()` - Utility for conditional class merging (clsx + tailwind-merge)
- CSS variables for theming

## 📱 Responsive Design

The application is fully responsive with breakpoints:

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🧪 Development Best Practices

1. **Type Safety**: Use TypeScript types from `src/types/`
2. **Component Structure**: Keep components small and focused
3. **Custom Hooks**: Extract reusable logic into hooks
4. **Service Layer**: Keep API logic in service files
5. **Error Handling**: Use try-catch with proper error types

## 🔧 Configuration Files

- `vite.config.ts` - Vite configuration
- `tsconfig.json` - TypeScript configuration
- `components.json` - shadcn/ui configuration
- `eslint.config.js` - ESLint rules

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
