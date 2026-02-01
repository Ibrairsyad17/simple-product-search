import {
  setEmail,
  setPassword,
  setTouched,
} from '../../redux/slices/loginForm.slice';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { GoogleLogin } from '@react-oauth/google';
import { Link } from 'react-router-dom';
import { useLoginForm } from '../../hooks/auth/useLoginForm';

export default function LoginForm() {
  const {
    email,
    password,
    isValid,
    touched,
    handleSubmit,
    handleGoogleSuccess,
    handleGoogleError,
    getFieldError,
    loginMutation,
    dispatch,
  } = useLoginForm();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-xs space-y-6 border p-6 rounded-lg shadow-xs bg-white">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Login</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email below to login to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              loginMutation.isPending ||
              (!isValid && (touched.email || touched.password))
            }
          >
            {loginMutation.isPending ? 'Signing in...' : 'Login'}
          </Button>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />
          </div>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
