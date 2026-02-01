import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'sonner';
import ReactQueryProvider from './components/providers/ReactQueryProvider';
import ReduxProvider from './components/providers/ReduxProvider';
import { router } from './route';
import { GOOGLE_CLIENT_ID } from './constants/baseUrl';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ReactQueryProvider>
        <ReduxProvider>
          <RouterProvider router={router} />
          <Toaster position="top-right" richColors />
        </ReduxProvider>
      </ReactQueryProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
