import { categoryRepository } from '../repositories/index.js';
import type { Category } from '@prisma/client';

export class CategoryService {
  async getAllCategories(): Promise<Category[]> {
    const categories = await categoryRepository.findAll();
    return categories.map((cat) => ({ ...cat, id: cat.id }));
  }

  async getCategoryById(id: number): Promise<Category> {
    const category = await categoryRepository.findById(String(id));
    if (!category) {
      throw new Error('Category not found');
    }
    return { ...category, id: category.id };
  }
}

export const categoryService = new CategoryService();
