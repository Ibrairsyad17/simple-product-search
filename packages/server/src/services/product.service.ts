import { productRepository } from '../repositories/index.js';
import type {
  SearchFilters,
  PaginatedResponse,
  ProductWithDetails,
} from '../types/index.js';

export class ProductService {
  async getProductById(id: string): Promise<ProductWithDetails> {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  async searchProducts(
    filters: SearchFilters
  ): Promise<PaginatedResponse<ProductWithDetails>> {
    const page = Math.max(filters.page || 1, 1);
    const pageSize = Math.min(Math.max(filters.pageSize || 20, 1), 100);

    const { products, total } = await productRepository.search({
      ...filters,
      page,
      pageSize,
    });

    return {
      code: 200,
      message: 'Products retrieved successfully',
      data: products,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }
}

export const productService = new ProductService();
