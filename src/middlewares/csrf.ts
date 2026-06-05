// src/middlewares/csrf.ts
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// Middleware to verify the CSRF token on state-changing requests
export const verifyCsrf = (req: Request, res: Response, next: NextFunction): void => {
  // GET requests don't change state, so they don't need CSRF protection
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const cookieToken = req.cookies['csrf-token'];
  const headerToken = req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    res.status(403).json({ error: 'CSRF token validation failed' });
    return;
  }

  next();
};

// Controller to issue the CSRF token when the React app first loads
export const issueCsrfToken = (req: Request, res: Response) => {
  const token = crypto.randomBytes(32).toString('hex');
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.cookie('csrf-token', token, {
    httpOnly: false, // Must be false so React can read it
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  });

  res.status(200).json({ message: 'CSRF token issued' });
};