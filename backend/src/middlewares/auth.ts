import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import type { IUser } from '../models/User';
import { User } from '../models/User';
import { ForbiddenError, UnauthorizedError } from '../utils/errorHandler';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ ...UnauthorizedError, message: 'Not logined' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '');
    if (typeof decoded === 'string') {
      res.status(401).json({ ...UnauthorizedError, message: 'Not logined' });
      return;
    }
    const user = await User.findOne({ username: decoded['username'] });
    if (!user) {
      res.status(401).json({ ...UnauthorizedError, message: 'Not logined' });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ ...UnauthorizedError, message: 'Not logined' });
  }
};

export const adminMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user?.admin) {
    res.status(403).json(ForbiddenError);
    return;
  }

  next();
};
