import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import type { RegisterRequest } from '../../types/auth';
import { toast } from 'sonner';
import { getErrorMessage } from '../../types/error';

export const useRegister = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (response) => {
      // Server returns token at top level of response object
      const token = response.token;
      if (token) {
        localStorage.setItem('token', token);

        toast.success('Registration successful! Welcome!');

        queryClient.invalidateQueries({ queryKey: ['profile'] });

        setTimeout(() => {
          navigate('/', { replace: true });
        }, 100);
      }
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
};
