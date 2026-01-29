import { prisma } from '../config/database.ts';
import { CategoryRepository } from './category.repository.ts';
import { UserRepository } from './user.repository.ts';
import { ProductRepository } from './product.repository.ts';

const userRepository = new UserRepository(prisma);
const categoryRepository = new CategoryRepository(prisma);
const productRepository = new ProductRepository(prisma);

export { userRepository, categoryRepository, productRepository };
