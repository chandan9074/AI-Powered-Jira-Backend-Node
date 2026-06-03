// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body;
      const { accessToken, refreshToken, userId } = await AuthService.registerUser(email, password, name);

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

  private static setCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth/refresh', // Optimization: Only send this cookie on the refresh endpoint
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
  }
}