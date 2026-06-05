import { CookieOptions } from 'express';

export const getCookieOptions = (): CookieOptions => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction, // Must be true if SameSite is 'none'
    // 'strict' if same domain, 'none' if cross-domain in production
    sameSite: isProduction ? 'none' : 'lax', 
  };
};