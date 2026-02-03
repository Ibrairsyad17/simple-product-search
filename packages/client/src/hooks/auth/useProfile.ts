import { useQuery } from '@tanstack/react-query';
import { authService } from '../../services/authService';

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => authService.getProfile().then((res) => res.user),
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
};
