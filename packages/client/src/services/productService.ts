import httpClient from './httpClient';
import type { Product, SearchProductsParams } from '../types/product';
import type { APIResponse, PaginatedResponse } from '../types/api';

export class ProductService {
  async searchProducts(
    params: SearchProductsParams
  ): Promise<PaginatedResponse<Product>> {
    const response = await httpClient.get<PaginatedResponse<Product>>(
      '/products',
      { params }
    );
    return response.data;
  }

  async getProduct(id: string): Promise<Product> {
    const response = await httpClient.get<Product>(`/products/${id}`);
    return response.data;
  }
}

export const productService = new ProductService();
