/**
 * IdeaForge AI – Express Server Entry Point
 * ────────────────────────────────────────────────
 * Boots the backend API server with:
 *   • CORS (frontend whitelist only)
 *   • JSON body parsing
 *   • General rate limiting
 *   • API routes mounted at /api
 *   • Global error handler
 */

// Load dotenv FIRST — before any other imports read process.env
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env is one level up from /backend/
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Now import config (which will also call dotenv but vars are already set)
import "./config/env.js";

import express from "express";
import cors from "cors";
import { config } from "./config/env.js";
import { generalLimiter } from "./middleware/rateLimiter.js";
import generateRoutes from "./routes/generate.js";

const app = express();

// ─────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────

// CORS — only allow our frontend origin
app.use(
    cors({
        origin: [
            config.frontendUrl,
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ],
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// Parse JSON bodies (10MB limit for base64 image fallback)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// General rate limiter applied globally
app.use(generalLimiter);

// ─────────────────────────────────────────
// Routes
// ─────────────────────────────────────────

app.use("/api", generateRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: "Not found",
        message: `Route ${req.method} ${req.url} not found.`,
    });
});

// ─────────────────────────────────────────
// Global Error Handler
// ─────────────────────────────────────────

app.use((err, req, res, next) => {
    console.error("💥 Unhandled error:", err.stack);
    res.status(err.status || 500).json({
        error: "Internal server error",
        message:
            config.nodeEnv === "development"
                ? err.message
                : "Something went wrong. Please try again.",
    });
});

// ─────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────

app.listen(config.port, () => {
    console.log(`
╔═══════════════════════════════════════════╗
║       IdeaForge AI – Backend API          ║
╠═══════════════════════════════════════════╣
║  Status  : ✅ Running                     ║
║  Port    : ${config.port}                              ║
║  Mode    : ${config.nodeEnv}                  ║
║  Provider: ${config.imageProvider.toUpperCase().padEnd(8)}                       ║
╚═══════════════════════════════════════════╝

  API: http://localhost:${config.port}/api/health
`);
});

export default app;
