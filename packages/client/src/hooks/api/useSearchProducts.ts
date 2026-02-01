import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../../services/productService';
import type { SearchProductsParams } from '../../types/product';

export function useSearchProducts() {
  const [searchParams] = useSearchParams();

  // Parse URL params to SearchProductsParams
  const params: SearchProductsParams = {
    q: searchParams.get('q') || undefined,
    category: searchParams.getAll('category').filter(Boolean),
    minPrice: searchParams.get('minPrice')
      ? Number(searchParams.get('minPrice'))
      : undefined,
    maxPrice: searchParams.get('maxPrice')
      ? Number(searchParams.get('maxPrice'))
      : undefined,
    inStock: searchParams.get('inStock') === 'true' ? true : undefined,
    sort:
      (searchParams.get('sort') as SearchProductsParams['sort']) || 'relevance',
    method:
      (searchParams.get('method') as SearchProductsParams['method']) || 'desc',
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    pageSize: searchParams.get('pageSize')
      ? Number(searchParams.get('pageSize'))
      : 10,
  };

  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productService.searchProducts(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}
