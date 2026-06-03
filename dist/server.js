"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_js_1 = __importDefault(require("./app.js"));
const PORT = process.env.PORT || 5000;
const server = app_js_1.default.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
process.on("SIGTERM", () => {
    console.log("SIGTERM received, shutting down gracefully...");
    server.close(async () => {
        console.log("Server closed");
        // Close the DB pool so the process can exit cleanly
        console.log("DB pool closed.");
        process.exit(0);
    });
});
