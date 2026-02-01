export interface APIResponse<T> {
  code: number;
  message: string;
  data?: T;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  code: number;
  message: string;
  data: T[];
  pagination: PaginationMeta;
}

export interface APIError {
  response?: {
    data?: {
      message?: string;
      errors?: Array<{
        path: string[];
        message: string;
      }>;
    };
    status?: number;
  };
  message?: string;
}
