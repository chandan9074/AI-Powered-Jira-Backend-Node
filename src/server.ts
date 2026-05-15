import "dotenv/config";
import app from "./app.js";
import pool from "./config/database.js";

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  server.close(async () => {
    console.log("Server closed");

    // Close the DB pool so the process can exit cleanly
    await pool.end();
    console.log("DB pool closed.");
    process.exit(0);
  });
});
