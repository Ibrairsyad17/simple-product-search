import { useQuery } from '@tanstack/react-query';
import { productService } from '../../services/productService';

/**
 * Hook to fetch a single product by ID
 * @param id - Product UUID
 * @param enabled - Whether the query should be enabled (default: true when id exists)
 */
export function useGetProduct(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProduct(id!),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}
