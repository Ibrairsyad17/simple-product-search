import { useQuery } from '@tanstack/react-query';
import { authService } from '../../services/authService';
import { isTokenExpired } from '../../lib/jwt';

export const useProfile = () => {
  const token = localStorage.getItem('token');

  const enabled = (() => {
    if (!token) return false;
    return !isTokenExpired(token);
  })();

  return useQuery({
    queryKey: ['profile'],
    queryFn: () => authService.getProfile().then((res) => res.data?.user),
    enabled,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
};
