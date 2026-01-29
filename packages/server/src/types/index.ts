export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  code: number;
  message: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  token: string;
  refreshToken: string;
}

export interface SearchFilters {
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

export interface PaginatedResponse<T> {
  code: number;
  message: string;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductWithDetails {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  inStock: boolean;
  createdAt: Date;
  updatedAt: Date;
  images: { id: string; url: string }[];
  categories: { id: string; name: string }[];
}
