import express from "express";
import type { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import pool from "./config/database.js";

const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Health Check Route
app.get("/health", async (req: Request, res: Response) => {
  try {
    // Perform a simple query to check DB health
    const result = await pool.query("SELECT NOW()");
    res.status(200).json({
      status: "UP",
      database: "CONNECTED",
      time: result.rows[0].now,
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "DOWN", error: "Database connection failed" });
  }
});

export default app;
