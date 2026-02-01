import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import { GoogleAuthRequest } from '@/types/auth';
import { toast } from 'sonner';
import { getErrorMessage } from '@/types/error';

export const useGoogleLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GoogleAuthRequest) => authService.googleAuth(data),
    onSuccess: (response) => {
      if (response.data?.token) {
        // Store token in localStorage
        localStorage.setItem('token', response.data.token);

        // Show success message
        toast.success('Login with Google successful!');

        // Invalidate profile query to refetch user data
        queryClient.invalidateQueries({ queryKey: ['profile'] });

        // Redirect to home page
        window.location.href = '/';
      }
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
};
