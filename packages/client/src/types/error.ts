import type { APIError } from './api';

export const getErrorMessage = (error: unknown): string => {
  const apiError = error as APIError;

  if (apiError?.response?.data?.message) {
    return apiError.response.data.message;
  }

  if (
    apiError?.response?.data?.errors &&
    Array.isArray(apiError.response.data.errors)
  ) {
    const errors = apiError.response.data.errors;
    if (errors.length > 0) {
      return errors.map((err) => err.message).join(', ');
    }
  }

  if (apiError?.message) {
    return apiError.message;
  }

  return 'An unexpected error occurred. Please try again.';
};

export const isAuthError = (error: unknown): boolean => {
  const apiError = error as APIError;
  return apiError?.response?.status === 401;
};

export const isValidationError = (error: unknown): boolean => {
  const apiError = error as APIError;
  return apiError?.response?.status === 400;
};

export const isNotFoundError = (error: unknown): boolean => {
  const apiError = error as APIError;
  return apiError?.response?.status === 404;
};
