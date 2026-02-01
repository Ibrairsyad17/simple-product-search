import { useQuery } from '@tanstack/react-query';
import { productService } from '../../services/productService';

export function useGetProduct(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProduct(id!),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}
