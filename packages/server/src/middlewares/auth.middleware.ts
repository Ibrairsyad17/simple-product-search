import type { Request, Response, NextFunction } from 'express';
import { userRepository } from '../repositories/index.js';
import { authService } from '../services';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string | null;
      };
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token = req.cookies.token;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return res.status(401).json({
        message: 'Authentication required',
      });
    }

    const { userId } = authService.verifyToken(token);

    const user = await userRepository.findById(userId);
    if (!user) {
      return res.status(401).json({
        message: 'User not found',
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    next();
  } catch (error) {
    res.status(401).json({
      message: 'Invalid or expired token',
    });
  }
};

/**
 *
 * TODO: DELETE THIS AFTER TESTING
 *
 *
 */

export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token = req.cookies.token;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (token) {
      const { userId } = authService.verifyToken(token);
      const user = await userRepository.findById(userId);
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      }
    }
  } catch (error) {
    // Ignore errors in optional auth
  }

  next();
};
