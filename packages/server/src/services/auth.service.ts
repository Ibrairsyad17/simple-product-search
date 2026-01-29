import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config';
import { userRepository } from '../repositories';
import type { RegisterRequest, AuthResponse, LoginRequest } from '../types';
import { prisma } from '../config/database';
import { OAuth2Client } from 'google-auth-library';

// @ts-ignore - CommonJS module
const bcryptHash = bcrypt.hash || bcrypt.default?.hash;
// @ts-ignore - CommonJS module
const bcryptCompare = bcrypt.compare || bcrypt.default?.compare;
// @ts-ignore - CommonJS module
const jwtSign = jwt.sign || jwt.default?.sign;
// @ts-ignore - CommonJS module
const jwtVerify = jwt.verify || jwt.default?.verify;

const googleClient = new OAuth2Client(config.google.clientId);

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

  async googleAuth(token: string): Promise<AuthResponse> {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: config.google.clientId,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new Error('Invalid Google token');
      }

      let user = await userRepository.findByGoogleId(payload.sub);

      if (!user) {
        const existingUser = await userRepository.findByEmail(payload.email);
        if (existingUser) {
          throw new Error('Email already exists with different provider');
        }

        user = await userRepository.create({
          email: payload.email,
          name: payload.name,
          provider: 'google',
          googleId: payload.sub,
        });
      }

      const jwtToken = this.generateToken(user.id);
      const refreshToken = await this.generateRefreshToken(user.id);

      return {
        code: 200,
        message: 'Google authentication successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token: jwtToken,
        refreshToken,
      };
    } catch (error) {
      throw new Error('Google authentication failed');
    }
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

  async refreshAccessToken(refreshToken: string): Promise<AuthResponse> {
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken) {
      throw new Error('Invalid refresh token');
    }

    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });
      throw new Error('Refresh token expired');
    }

    const newAccessToken = this.generateToken(storedToken.userId);

    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });
    const newRefreshToken = await this.generateRefreshToken(storedToken.userId);

    return {
      code: 200,
      message: 'Token refreshed successfully',
      user: {
        id: storedToken.user.id,
        email: storedToken.user.email,
        name: storedToken.user.name,
      },
      token: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  verifyToken(token: string): { userId: string } {
    try {
      const decoded = jwtVerify(token, config.jwt.secret);
      return decoded as { userId: string };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}

export const authService = new AuthService();
