import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../../services/authService';
import type { LoginRequest } from '../../types/auth';
import { toast } from 'sonner';
import { getErrorMessage } from '../../types/error';

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (response) => {
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);

        toast.success('Login successful!');

        queryClient.invalidateQueries({ queryKey: ['profile'] });

        window.location.href = '/';
      }
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
};
