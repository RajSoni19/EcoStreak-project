import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '@/models/User';
import { serverConfig } from '@/config/server';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
      return;
    }

    try {
      const decoded = jwt.verify(token, serverConfig.jwt.secret) as JWTPayload;
      
      // Check if user still exists and is active
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        res.status(401).json({ 
          success: false, 
          message: 'User not found' 
        });
        return;
      }

      if (!user.isActive) {
        res.status(401).json({ 
          success: false, 
          message: 'User account is deactivated' 
        });
        return;
      }

      req.user = user;
      next();
    } catch (jwtError) {
      if (jwtError instanceof jwt.JsonWebTokenError) {
        res.status(401).json({ 
          success: false, 
          message: 'Invalid token' 
        });
      } else if (jwtError instanceof jwt.TokenExpiredError) {
        res.status(401).json({ 
          success: false, 
          message: 'Token expired' 
        });
      } else {
        res.status(401).json({ 
          success: false, 
          message: 'Token verification failed' 
        });
      }
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Authentication error' 
    });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions' 
      });
      return;
    }

    next();
  };
};

export const requireAdmin = requireRole(['admin']);
export const requireNGO = requireRole(['ngo', 'admin']);
export const requireUser = requireRole(['user', 'ngo', 'admin']);

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, serverConfig.jwt.secret) as JWTPayload;
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication for optional routes
    next();
  }
};
