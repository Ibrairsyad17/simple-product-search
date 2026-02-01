import { configureStore } from '@reduxjs/toolkit';
import loginFormReducer from './slices/loginForm.slice';
import registerFormReducer from './slices/registerForm.slice';

export const store = configureStore({
  reducer: {
    loginForm: loginFormReducer,
    registerForm: registerFormReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
