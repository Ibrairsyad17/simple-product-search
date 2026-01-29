import { prisma } from '../config/database.ts';
import { CategoryRepository } from './category.repository.ts';
import { UserRepository } from './user.repository.ts';

const userRepository = new UserRepository(prisma);
const categoryRepository = new CategoryRepository(prisma);

export { userRepository, categoryRepository };
