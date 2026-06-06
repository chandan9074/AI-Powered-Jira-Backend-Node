import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes';
import cors from "cors";
import helmet from "helmet";
import { API_VERSION, ROUTES } from './constants/routes';

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Your React app URL
  credentials: true, // Crucial: Allows the browser to send HTTP-Only cookies
}));

// Routes
app.use(`${API_VERSION}${ROUTES.AUTH.BASE}`, authRoutes);

export default app;