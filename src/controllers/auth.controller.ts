import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { getCookieOptions } from '../utils/cookies';
import { ROUTES } from '../constants/routes';

export class AuthController {

  static async requestOtp(req: Request, res: Response) {
    try {
      const { email } = req.body;
      await AuthService.requestRegistrationOtp(email);
      
      res.status(200).json({ message: 'OTP sent successfully to email' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async register(req: Request, res: Response) {
    try {
      // Destructure otp from the request body
      const { email, password, name, otp } = req.body; 
      
      const { accessToken, refreshToken, userId } = await AuthService.registerUser(email, password, name, otp);

      AuthController.setCookies(res, accessToken, refreshToken);
      res.status(201).json({ message: 'Registration successful', userId });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const { accessToken, refreshToken, userId } = await AuthService.loginUser(email, password);

      AuthController.setCookies(res, accessToken, refreshToken);
      res.status(200).json({ message: 'Login successful', userId });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const { refreshToken } = req.cookies;

      if (refreshToken) {
        // Invalidate the session in the database/Redis
        await AuthService.logoutUser(refreshToken);
      }
    } catch (error) {
      console.error('Logout Controller Error:', error);
    } finally {

      res.clearCookie('accessToken');
      
      res.clearCookie('refreshToken', { path: ROUTES.AUTH.COOKIE_REFRESH_PATH });
      
      res.status(200).json({ message: 'Logged out successfully' });
    }
  }

  private static setCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie('accessToken', accessToken, {
      ...getCookieOptions(),
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      ...getCookieOptions(),
      path: ROUTES.AUTH.COOKIE_REFRESH_PATH, // Restrict refresh token to only be sent to the refresh endpoint
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
  }
}