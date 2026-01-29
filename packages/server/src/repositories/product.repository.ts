import type { Product, Prisma } from '../../generated/prisma/client.js';
import type { SearchFilters, ProductWithDetails } from '../types/index.js';

export interface IProductRepository {
  findById(id: string): Promise<ProductWithDetails | null>;
  search(
    filters: SearchFilters
  ): Promise<{ products: ProductWithDetails[]; total: number }>;
  create(data: any): Promise<Product>;
  update(id: string, data: any): Promise<Product>;
  delete(id: string): Promise<void>;
}

export class ProductRepository implements IProductRepository {
  constructor(private prisma: any) {}

  async findById(id: string): Promise<ProductWithDetails | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        images: {
          select: {
            id: true,
            url: true,
          },
        },
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!product) return null;

    return {
      ...product,
      price: Number(product.price),
      rating: Number(product.rating),
      categories: product.categories.map((pc: any) => pc.category),
    };
  }

  async search(
    filters: SearchFilters
  ): Promise<{ products: ProductWithDetails[]; total: number }> {
    const {
      q,
      category,
      minPrice,
      maxPrice,
      inStock,
      sort = 'relevance',
      method = 'desc',
      page = 1,
      pageSize = 20,
    } = filters;

    const validPageSize = Math.min(pageSize, 100);
    const skip = (page - 1) * validPageSize;

    const where: Prisma.ProductWhereInput = {};

    if (q) {
      where.OR = [{ name: { contains: q } }, { description: { contains: q } }];
    }

    if (category && category.length > 0) {
      where.categories = {
        some: {
          categoryId: { in: category },
        },
      };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (inStock !== undefined) {
      where.inStock = inStock;
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = {};

    if (sort === 'price') {
      orderBy.price = method;
    } else if (sort === 'created_at') {
      orderBy.createdAt = method;
    } else if (sort === 'rating') {
      orderBy.rating = method;
    } else {
      // relevance - default to createdAt desc
      orderBy.createdAt = 'desc';
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: validPageSize,
        include: {
          images: {
            select: {
              id: true,
              url: true,
            },
          },
          categories: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    const transformedProducts = products.map((product: any) => ({
      ...product,
      price: Number(product.price),
      rating: Number(product.rating),
      categories: product.categories.map((pc: any) => pc.category),
    }));

    return {
      products: transformedProducts,
      total,
    };
  }

  async create(data: any): Promise<Product> {
    return this.prisma.product.create({
      data,
    });
  }

  async update(id: string, data: any): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({
      where: { id },
    });
  }
}
