import { prisma } from '../config/database.ts';
import { UserRepository } from './user.repository.ts';

const userRepository = new UserRepository(prisma);

export { userRepository };
