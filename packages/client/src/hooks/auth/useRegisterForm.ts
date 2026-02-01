import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { useRegister } from './useRegister';
import { useGoogleLogin as useGoogleLoginHook } from '../../hooks/auth/useGoogleLogin';
import { useEffect } from 'react';
import {
  resetForm,
  validateAllFields,
} from '../../redux/slices/registerForm.slice';

export const useRegisterForm = () => {
  const dispatch = useAppDispatch();
  const { email, password, name, errors, isValid, touched } = useAppSelector(
    (state) => state.registerForm
  );
  const registerMutation = useRegister();
  const googleLoginMutation = useGoogleLoginHook();

  useEffect(() => {
    dispatch(resetForm());
  }, [dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(validateAllFields());

    if (isValid) {
      registerMutation.mutate({ email, password, name: name || undefined });
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleGoogleSuccess = (credentialResponse: any) => {
    if (credentialResponse.credential) {
      googleLoginMutation.mutate({ token: credentialResponse.credential });
    }
  };

  const handleGoogleError = () => {
    console.error('Google login failed');
  };

  const getFieldError = (field: 'email' | 'password' | 'name') => {
    const error = errors.find((err) => err.field === field);
    return error && touched[field] ? error.message : null;
  };

  return {
    email,
    password,
    name,
    errors,
    isValid,
    touched,
    handleSubmit,
    handleGoogleSuccess,
    handleGoogleError,
    getFieldError,
    registerMutation,
    googleLoginMutation,
    dispatch,
  };
};
