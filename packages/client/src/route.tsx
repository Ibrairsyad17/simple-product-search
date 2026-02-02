import { createBrowserRouter } from 'react-router-dom';
import LoginForm from './components/auth/LoginForm';
import RegistrationForm from './components/auth/RegistrationForm';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';
import { ProductSearchPage } from './components/product/ProductSearchPage';
import { ProductDetailPage } from './components/product/ProductDetailPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginForm />
      </PublicRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <RegistrationForm />
      </PublicRoute>
    ),
  },
  {
    path: '/',
    element: <ProductSearchPage />,
  },
  {
    path: '/products/:id',
    element: (
      <ProtectedRoute>
        <ProductDetailPage />
      </ProtectedRoute>
    ),
  },
]);
