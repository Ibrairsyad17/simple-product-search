import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import type { LoginRequest } from '../../types/auth';
import { toast } from 'sonner';
import { getErrorMessage } from '../../types/error';

export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: () => {
      toast.success('Login successful!');

      queryClient.invalidateQueries({ queryKey: ['profile'] });

      setTimeout(() => {
        navigate('/', { replace: true });
      }, 100);
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
};
