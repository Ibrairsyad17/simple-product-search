import { authService } from '../services';
import {
  googleAuthSchema,
  loginSchema,
  registerSchema,
} from '../utils/validation';
import type { Request, Response } from 'express';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const data = registerSchema.parse(req.body);
      const result = await authService.register(data);

      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          code: 400,
          message: error.message,
          errors: error.errors,
        });
      }
      res.status(400).json({
        code: 400,
        message: error.message || 'Registration failed',
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const data = loginSchema.parse(req.body);
      const result = await authService.login(data);

      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          code: 400,
          message: error.message,
          errors: error.errors,
        });
      }
      res.status(401).json({
        code: 401,
        message: error.message || 'Login failed',
      });
    }
  }

  async googleAuth(req: Request, res: Response) {
    try {
      const { token } = googleAuthSchema.parse(req.body);
      const result = await authService.googleAuth(token);

      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          code: 400,
          message: error.message || 'Google authentication failed',
          errors: error.errors,
        });
      }
      res.status(401).json({
        message: error.message || 'Google authentication failed',
      });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (refreshToken) {
        await authService.revokeRefreshToken(refreshToken);
      }

      res.clearCookie('token');
      res.clearCookie('refreshToken');
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({
        code: 500,
        message: error.message || 'Logout failed',
      });
    }
  }

  async refresh(req: Request, res: Response) {
    try {
      const refreshToken = req.body.refreshToken || req.cookies.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          code: 401,
          message: 'Unauthorized: No refresh token provided',
        });
      }

      const result = await authService.refreshAccessToken(refreshToken);

      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json(result);
    } catch (error: any) {
      res.status(401).json({
        code: 401,
        message: error.message || 'Token refresh failed',
      });
    }
  }

  async me(req: Request, res: Response) {
    res.json({ user: req.user });
  }
}

export const authController = new AuthController();
