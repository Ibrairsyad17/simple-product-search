import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface ValidationError {
  field: 'email' | 'password' | 'name';
  message: string;
}

interface RegisterFormState {
  email: string;
  password: string;
  name: string;
  errors: ValidationError[];
  isValid: boolean;
  touched: {
    email: boolean;
    password: boolean;
    name: boolean;
  };
}

const initialState: RegisterFormState = {
  email: '',
  password: '',
  name: '',
  errors: [],
  isValid: false,
  touched: {
    email: false,
    password: false,
    name: false,
  },
};

/**
 * Validate email format
 */
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate registration form fields
 */
const validateForm = (
  email: string,
  password: string,
  name: string
): ValidationError[] => {
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

  // Name is optional, but if provided, validate it
  if (name && name.length < 2) {
    errors.push({
      field: 'name',
      message: 'Name must be at least 2 characters',
    });
  }

  return errors;
};

const registerFormSlice = createSlice({
  name: 'registerForm',
  initialState,
  reducers: {
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
      state.errors = validateForm(state.email, state.password, state.name);
      state.isValid = state.errors.length === 0;
    },
    setPassword: (state, action: PayloadAction<string>) => {
      state.password = action.payload;
      state.errors = validateForm(state.email, state.password, state.name);
      state.isValid = state.errors.length === 0;
    },
    setName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
      state.errors = validateForm(state.email, state.password, state.name);
      state.isValid = state.errors.length === 0;
    },
    setTouched: (
      state,
      action: PayloadAction<'email' | 'password' | 'name'>
    ) => {
      state.touched[action.payload] = true;
    },
    validateAllFields: (state) => {
      state.touched.email = true;
      state.touched.password = true;
      state.touched.name = true;
      state.errors = validateForm(state.email, state.password, state.name);
      state.isValid = state.errors.length === 0;
    },
    resetForm: (state) => {
      state.email = '';
      state.password = '';
      state.name = '';
      state.errors = [];
      state.isValid = false;
      state.touched = { email: false, password: false, name: false };
    },
  },
});

export const {
  setEmail,
  setPassword,
  setName,
  setTouched,
  validateAllFields,
  resetForm,
} = registerFormSlice.actions;

export default registerFormSlice.reducer;
