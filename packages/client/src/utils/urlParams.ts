import type { SearchProductsParams } from '../types/product';

export function parseSearchParams(
  searchParams: URLSearchParams
): SearchProductsParams {
  const params: SearchProductsParams = {};

  const q = searchParams.get('q');
  if (q) params.q = q;

  const categories = searchParams.getAll('category');
  if (categories.length > 0) params.category = categories;

  const minPrice = searchParams.get('minPrice');
  if (minPrice) params.minPrice = Number(minPrice);

  const maxPrice = searchParams.get('maxPrice');
  if (maxPrice) params.maxPrice = Number(maxPrice);

  const inStock = searchParams.get('inStock');
  if (inStock !== null) params.inStock = inStock === 'true';

  const sort = searchParams.get('sort');
  if (sort && ['relevance', 'price', 'created_at', 'rating'].includes(sort)) {
    params.sort = sort as SearchProductsParams['sort'];
  }

  const method = searchParams.get('method');
  if (method && ['asc', 'desc'].includes(method)) {
    params.method = method as 'asc' | 'desc';
  }

  const page = searchParams.get('page');
  if (page) params.page = Number(page);

  const pageSize = searchParams.get('pageSize');
  if (pageSize) params.pageSize = Number(pageSize);

  return params;
}

export function toURLSearchParams(
  params: SearchProductsParams
): URLSearchParams {
  const searchParams = new URLSearchParams();

  if (params.q) searchParams.set('q', params.q);

  if (params.category && params.category.length > 0) {
    params.category.forEach((cat) => searchParams.append('category', cat));
  }

  if (params.minPrice !== undefined) {
    searchParams.set('minPrice', String(params.minPrice));
  }

  if (params.maxPrice !== undefined) {
    searchParams.set('maxPrice', String(params.maxPrice));
  }

  if (params.inStock !== undefined) {
    searchParams.set('inStock', String(params.inStock));
  }

  if (params.sort) searchParams.set('sort', params.sort);

  if (params.method) searchParams.set('method', params.method);

  if (params.page) searchParams.set('page', String(params.page));

  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));

  return searchParams;
}

export function buildQueryString(params: SearchProductsParams): string {
  const searchParams = toURLSearchParams(params);
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

export function hasActiveFilters(params: SearchProductsParams): boolean {
  return !!(
    params.q ||
    (params.category && params.category.length > 0) ||
    params.minPrice !== undefined ||
    params.maxPrice !== undefined ||
    params.inStock !== undefined
  );
}

export function clearFilters(
  params: SearchProductsParams
): SearchProductsParams {
  return {
    page: params.page,
    pageSize: params.pageSize,
    sort: params.sort,
    method: params.method,
  };
}
