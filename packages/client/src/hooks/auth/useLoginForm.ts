import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { useLogin } from './useLogin';
import { useGoogleLogin as useGoogleLoginHook } from '../../hooks/auth/useGoogleLogin';
import { useEffect } from 'react';
import {
  resetForm,
  validateAllFields,
} from '../../redux/slices/registerForm.slice';

export const useLoginForm = () => {
  const dispatch = useAppDispatch();
  const { email, password, errors, isValid, touched } = useAppSelector(
    (state) => state.loginForm
  );
  const loginMutation = useLogin();
  const googleLoginMutation = useGoogleLoginHook();

  useEffect(() => {
    dispatch(resetForm());
  }, [dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(validateAllFields());

    if (isValid) {
      loginMutation.mutate({ email, password });
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

  const getFieldError = (field: 'email' | 'password') => {
    const error = errors.find((err) => err.field === field);
    return error && touched[field] ? error.message : null;
  };

  return {
    email,
    password,
    errors,
    isValid,
    touched,
    handleSubmit,
    handleGoogleSuccess,
    handleGoogleError,
    getFieldError,
    loginMutation,
    googleLoginMutation,
    dispatch,
  };
};
