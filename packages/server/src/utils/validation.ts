import { z } from 'zod';

export const registerSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  name: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const searchProductsSchema = z.object({
  q: z.string().optional(),
  category: z.array(z.string().uuid()).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  inStock: z.coerce.boolean().optional(),
  sort: z.enum(['relevance', 'price', 'created_at', 'rating']).optional(),
  method: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(20),
});

export const productIdSchema = z.object({
  id: z.string().uuid('Invalid product ID format'),
});
