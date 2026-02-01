import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  setEmail,
  setPassword,
  setName,
  setTouched,
  validateAllFields,
  resetForm,
} from '../../redux/slices/registerForm.slice';
import { useRegister } from '../../hooks/auth/useRegister';
import { useGoogleLogin as useGoogleLoginHook } from '../../hooks/auth/useGoogleLogin';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { GoogleLogin } from '@react-oauth/google';
import { Link } from 'react-router-dom';

export default function RegistrationForm() {
  const dispatch = useAppDispatch();
  const { email, password, name, errors, isValid, touched } = useAppSelector(
    (state) => state.registerForm
  );
  const registerMutation = useRegister();
  const googleLoginMutation = useGoogleLoginHook();

  // Reset form on mount
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Create an account</h1>
          <p className="text-sm text-muted-foreground">
            Enter your details below to create your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name (Optional)</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => dispatch(setName(e.target.value))}
              onBlur={() => dispatch(setTouched('name'))}
              className={getFieldError('name') ? 'border-red-500' : ''}
            />
            {getFieldError('name') && (
              <p className="text-sm text-red-500">{getFieldError('name')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => dispatch(setEmail(e.target.value))}
              onBlur={() => dispatch(setTouched('email'))}
              className={getFieldError('email') ? 'border-red-500' : ''}
            />
            {getFieldError('email') && (
              <p className="text-sm text-red-500">{getFieldError('email')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => dispatch(setPassword(e.target.value))}
              onBlur={() => dispatch(setTouched('password'))}
              className={getFieldError('password') ? 'border-red-500' : ''}
            />
            {getFieldError('password') && (
              <p className="text-sm text-red-500">
                {getFieldError('password')}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={
              registerMutation.isPending ||
              (!isValid && (touched.email || touched.password || touched.name))
            }
          >
            {registerMutation.isPending ? 'Creating account...' : 'Sign up'}
          </Button>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />
          </div>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
