import type { Request, Response } from 'express';
import { productService } from '../services/index.js';
import { searchProductsSchema, productIdSchema } from '../utils/validation.js';

export class ProductController {
  async search(req: Request, res: Response) {
    try {
      let category = req.query.category;
      if (typeof category === 'string') {
        category = [category];
      }

      const filters = searchProductsSchema.parse({
        ...req.query,
        category,
      });

      const result = await productService.searchProducts(filters);
      res.json(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          code: 400,
          message: 'Validation error',
          errors: error.errors,
        });
      }
      res.status(500).json({
        code: 500,
        message: error.message || 'Search failed',
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = productIdSchema.parse(req.params);
      const product = await productService.getProductById(id);
      res.json(product);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          code: 400,
          message: 'Validation error',
          errors: error.errors,
        });
      }
      if (error.message === 'Product not found') {
        return res.status(404).json({
          code: 404,
          message: 'Product not found',
        });
      }
      res.status(500).json({
        code: 500,
        message: error.message || 'Failed to get product',
      });
    }
  }
}

export const productController = new ProductController();
