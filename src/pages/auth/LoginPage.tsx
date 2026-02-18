import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { authService, UserType } from '@/services/auth.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { LoginCredentials } from '@/types';
import { ROUTES } from '@/utils/constants';
import logo from '@/assets/logo.png';

export const LoginPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setUser, setError } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [userType, setUserType] = useState<UserType>('admin');

  const userTypeOptions = [
    { value: 'admin', label: 'Administrator' },
    { value: 'loan-officer', label: 'Loan Officer' },
  ];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>();

  const onSubmit = async (data: LoginCredentials) => {
    setIsLoading(true);
    setLoginError(null);
    setError(null);

    try {
      console.log('Attempting login with:', { username: data.username, userType });
      const response = await authService.login(data, userType);
      
      // Clear any cached data from previous sessions or failed attempts
      queryClient.clear();
      
      setUser(response.user);
      
      navigate(ROUTES.DASHBOARD);
    } catch (error) {
      console.error('Login error:', error);
      const message = error instanceof Error ? error.message : 'Login failed. Please try again.';
      setLoginError(message);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4 lg:hidden">
          <img src={logo} alt="Kassolend Logo" className="h-16 w-auto" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
        <p className="mt-2 text-sm text-gray-600">
          Sign in to your account to continue
        </p>
      </div>

      {loginError && (
        <div className="mb-4 p-4 bg-error-50 border border-error-200 rounded-lg">
          <p className="text-sm text-error-600">{loginError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Select
          label="Login As"
          options={userTypeOptions}
          value={userType}
          onChange={(e) => setUserType(e.target.value as UserType)}
        />

        <Input
          label="Username"
          type="text"
          placeholder="Enter your username"
          error={errors.username?.message}
          {...register('username', {
            required: 'Username is required',
          })}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters',
            },
          })}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
              Forgot password?
            </a>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          isLoading={isLoading}
        >
          Sign in
        </Button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Secure authentication
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
