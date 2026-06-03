import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes';
import cors from "cors";
import helmet from "helmet";

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);

export default app;