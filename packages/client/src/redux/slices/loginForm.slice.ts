import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface ValidationError {
  field: 'email' | 'password';
  message: string;
}

interface LoginFormState {
  email: string;
  password: string;
  errors: ValidationError[];
  isValid: boolean;
  touched: {
    email: boolean;
    password: boolean;
  };
}

const initialState: LoginFormState = {
  email: '',
  password: '',
  errors: [],
  isValid: false,
  touched: {
    email: false,
    password: false,
  },
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateForm = (email: string, password: string): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!isValidEmail(email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (password.length < 6) {
    errors.push({
      field: 'password',
      message: 'Password must be at least 6 characters',
    });
  }

  return errors;
};

const loginFormSlice = createSlice({
  name: 'loginForm',
  initialState,
  reducers: {
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
      state.errors = validateForm(state.email, state.password);
      state.isValid = state.errors.length === 0;
    },
    setPassword: (state, action: PayloadAction<string>) => {
      state.password = action.payload;
      state.errors = validateForm(state.email, state.password);
      state.isValid = state.errors.length === 0;
    },
    setTouched: (state, action: PayloadAction<'email' | 'password'>) => {
      state.touched[action.payload] = true;
    },
    validateAllFields: (state) => {
      state.touched.email = true;
      state.touched.password = true;
      state.errors = validateForm(state.email, state.password);
      state.isValid = state.errors.length === 0;
    },
    resetForm: (state) => {
      state.email = '';
      state.password = '';
      state.errors = [];
      state.isValid = false;
      state.touched = { email: false, password: false };
    },
  },
});

export const {
  setEmail,
  setPassword,
  setTouched,
  validateAllFields,
  resetForm,
} = loginFormSlice.actions;

export default loginFormSlice.reducer;
