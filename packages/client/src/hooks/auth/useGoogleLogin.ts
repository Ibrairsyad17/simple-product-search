import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import type { GoogleAuthRequest } from '../../types/auth';
import { toast } from 'sonner';
import { getErrorMessage } from '../../types/error';

export const useGoogleLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: GoogleAuthRequest) => authService.googleAuth(data),
    onSuccess: () => {
      toast.success('Login with Google successful!');

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
