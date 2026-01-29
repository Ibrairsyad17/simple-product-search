import type { Request, Response } from 'express';
import { categoryService } from '../services/index.js';

export class CategoryController {
  async getAll(req: Request, res: Response) {
    try {
      const categories = await categoryService.getAllCategories();
      res.json({
        code: 200,
        message: 'Categories retrieved successfully',
        data: categories,
      });
    } catch (error: any) {
      res.status(500).json({
        code: 500,
        message: error.message || 'Failed to get categories',
      });
    }
  }
}

export const categoryController = new CategoryController();
