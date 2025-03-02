import { Request, Response, NextFunction } from 'express';
import { User } from '../lib/models/User.js';
import { verifyToken } from '../lib/utils/jwt.js';

export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authorization token required' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || typeof decoded !== 'object' || !('userId' in decoded)) {
      res.status(403).json({ error: 'Invalid token' });
      return;
    }

    const user = await User.findById(decoded.userId).exec();
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
