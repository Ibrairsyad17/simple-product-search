import { useQueryClient } from '@tanstack/react-query';
import { authService } from '../../services/authService';
import { toast } from 'sonner';

export const useLogout = () => {
  const queryClient = useQueryClient();

  return async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      queryClient.clear();

      toast.success('Logged out successfully');

      window.location.href = '/login';
    }
  };
};
