import httpClient from './httpClient';
import type { Category } from '../types/product';
import type { APIResponse } from '../types/api';

export class CategoryService {
  async getCategories(): Promise<Category[]> {
    const response =
      await httpClient.get<APIResponse<Category[]>>('/categories');
    return response.data.data || [];
  }
}

export const categoryService = new CategoryService();
