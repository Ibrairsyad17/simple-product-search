import type { Category } from '../../generated/prisma/client.js';

export interface ICategoryRepository {
  findAll(): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  findByName(name: string): Promise<Category | null>;
  create(name: string): Promise<Category>;
}

export class CategoryRepository implements ICategoryRepository {
  constructor(private prisma: any) {}

  async findAll(): Promise<Category[]> {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<Category | null> {
    return this.prisma.category.findUnique({
      where: { id },
    });
  }

  async findByName(name: string): Promise<Category | null> {
    return this.prisma.category.findUnique({
      where: { name },
    });
  }

  async create(name: string): Promise<Category> {
    return this.prisma.category.create({
      data: { name },
    });
  }
}
