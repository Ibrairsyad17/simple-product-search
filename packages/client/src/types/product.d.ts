export interface ProductImage {
  id: string;
  url: string;
}

export interface ProductCategory {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
  categories: ProductCategory[];
}

export interface Category {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface SearchProductsParams {
  q?: string;
  category?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: 'relevance' | 'price' | 'created_at' | 'rating';
  method?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface SearchProductsResponse {
  data: Product[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
