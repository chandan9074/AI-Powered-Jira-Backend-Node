import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string({ error: 'Email is required' }).email('Invalid email format'),
    password: z.string({ error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    name: z.string({ error: 'Name is required' }).min(2, 'Name must be at least 2 characters'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string({ error: 'Email is required' }).email('Invalid email format'),
    password: z.string({ error: 'Password is required' }).min(1, 'Password cannot be empty'),
  }),
});