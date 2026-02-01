import { useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import { toast } from 'sonner';

export const useLogout = () => {
  const queryClient = useQueryClient();

  return async () => {
    try {
      // Call logout endpoint
      await authService.logout();
    } catch (error) {
      // Continue with local cleanup even if API call fails
      console.error('Logout API error:', error);
    } finally {
      // Clear token from localStorage
      localStorage.removeItem('token');

      // Clear all React Query cache
      queryClient.clear();

      // Show success message
      toast.success('Logged out successfully');

      // Redirect to login page
      window.location.href = '/login';
    }
  };
};
