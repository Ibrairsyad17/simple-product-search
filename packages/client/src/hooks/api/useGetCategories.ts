import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../../services/categoryService';

/**
 * Hook to fetch all product categories
 * Categories are cached for 30 minutes as they rarely change
 */
export function useGetCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 1,
  });
}
