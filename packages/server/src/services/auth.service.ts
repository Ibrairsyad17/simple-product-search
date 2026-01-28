import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config';
import { userRepository } from '../repositories';
import type { RegisterRequest, AuthResponse, LoginRequest } from '../types';
import { prisma } from '../config/database';

// @ts-ignore - CommonJS module
const bcryptHash = bcrypt.hash || bcrypt.default?.hash;
// @ts-ignore - CommonJS module
const bcryptCompare = bcrypt.compare || bcrypt.default?.compare;
// @ts-ignore - CommonJS module
const jwtSign = jwt.sign || jwt.default?.sign;
// @ts-ignore - CommonJS module
const jwtVerify = jwt.verify || jwt.default?.verify;

export class AuthService {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcryptHash(data.password, 10);

    const user = await userRepository.create({
      email: data.email,
      password: hashedPassword,
      name: data.name,
      provider: 'local',
    });

    const token = this.generateToken(user.id);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      code: 201,
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
      refreshToken,
    };
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    // Find user
    const user = await userRepository.findByEmail(data.email);
    if (!user || !user.password) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcryptCompare(data.password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user.id);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      code: 200,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
      refreshToken,
    };
  }

  generateToken(userId: string): string {
    const token = jwtSign({ userId }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    } as jwt.SignOptions);
    return token as string;
  }

  async generateRefreshToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(40).toString('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });

    return token;
  }
}

export const authService = new AuthService();
