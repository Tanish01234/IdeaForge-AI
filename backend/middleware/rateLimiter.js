/**
 * IdeaForge AI – Rate Limiter Middleware
 * ──────────────────────────────────────
 * Prevents API abuse and protects AI generation endpoints.
 * Different limits apply to different route types.
 */

import rateLimit from "express-rate-limit";

// ─────────────────────────────────────────
// Generation Rate Limiter (strict)
// 10 AI generations per IP per minute
// ─────────────────────────────────────────

export const generateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: "Too many requests",
        message:
            "You've hit the generation limit (10/min). Please wait a moment before forging again! ⚡",
        retryAfter: 60,
    },
    handler: (req, res, next, options) => {
        console.warn(`⚠️  Rate limit hit — IP: ${req.ip}`);
        res.status(429).json(options.message);
    },
});

// ─────────────────────────────────────────
// Camera Mode Limiter (moderate)
// 5 uploads per IP per minute
// ─────────────────────────────────────────

export const cameraLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: "Too many requests",
        message:
            "Camera mode limit reached (5/min). Please wait before analyzing more images.",
        retryAfter: 60,
    },
});

// ─────────────────────────────────────────
// General API Limiter (lenient)
// 100 requests per IP per 15 minutes
// ─────────────────────────────────────────

export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: "Too many requests",
        message: "Too many requests from this IP. Please try again later.",
    },
});
