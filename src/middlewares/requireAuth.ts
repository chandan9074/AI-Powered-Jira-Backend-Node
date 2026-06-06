import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// 1. Define the shape of our JWT payload
interface JwtPayload {
  userId: string;
}

// 2. Extend the Express Request interface to include our user data
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Extract the token from the HTTP-Only cookies
    const token = req.cookies.accessToken;

    if (!token) {
      res.status(401).json({ error: 'Authentication required. No token provided.' });
      return;
    }

    // Verify the token using the secret
    const secret = process.env.JWT_SECRET || 'super_secret_dev_key_change_in_prod';
    const decoded = jwt.verify(token, secret) as JwtPayload;

    // Attach the decoded payload to the request object for downstream controllers to use
    req.user = decoded;

    // Proceed to the next middleware or the controller
    next();
  } catch (error) {
    // If the token is expired or tampered with, jwt.verify throws an error
    res.status(401).json({ error: 'Token is invalid or expired.' });
    return;
  }
};