import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../../services/authService';
import type { RegisterRequest } from '../../types/auth';
import { toast } from 'sonner';
import { getErrorMessage } from '../../types/error';

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (response) => {
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);

        toast.success('Registration successful! Welcome!');

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
