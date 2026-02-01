import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../../services/categoryService';

export function useGetCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 1,
  });
}
