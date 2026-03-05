/**
 * IdeaForge AI – Environment Configuration
 * ─────────────────────────────────────────
 * Loads and validates all required environment variables.
 * If a critical key is missing, the server will refuse to start
 * rather than silently fail at runtime.
 */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root (two levels up from backend/config/)
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// ─────────────────────────────────────────
// Keys classified by criticality
// ─────────────────────────────────────────

/** Keys required for the app to function at all */
const REQUIRED_KEYS = ["OPENAI_API_KEY"];

/** Keys required only for optional features */
const OPTIONAL_KEYS = [
  "STABILITY_API_KEY",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "REMOVE_BG_API_KEY",
  "REPLICATE_API_TOKEN",
];

// ─────────────────────────────────────────
// Validation
// ─────────────────────────────────────────

function validateEnv() {
  const missing = [];
  const warnings = [];

  // Check required keys
  for (const key of REQUIRED_KEYS) {
    if (!process.env[key] || process.env[key] === "YOUR_API_KEY_HERE") {
      missing.push(key);
    }
  }

  // Warn about optional keys
  for (const key of OPTIONAL_KEYS) {
    if (!process.env[key] || process.env[key].startsWith("YOUR_")) {
      warnings.push(key);
    }
  }

  if (missing.length > 0) {
    console.error("\n❌  [IdeaForge AI] Missing required API keys:");
    missing.forEach((k) => console.error(`   • ${k}`));
    console.error(
      "\n   Please add them to your .env file.\n   See .env.example for reference.\n"
    );
    process.exit(1); // Fail fast – don't start with broken config
  }

  if (warnings.length > 0) {
    console.warn("\n⚠️  [IdeaForge AI] Optional API keys not configured:");
    warnings.forEach((k) => console.warn(`   • ${k}`));
    console.warn("   Some features may be unavailable.\n");
  }
}

validateEnv();

// ─────────────────────────────────────────
// Export typed config object
// ─────────────────────────────────────────

export const config = {
  // Server
  port: parseInt(process.env.PORT || "8000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",

  // Image provider selection
  imageProvider: process.env.IMAGE_PROVIDER || "openai", // "openai" | "stability" | "replicate"

  // OpenAI
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },

  // Stability AI
  stability: {
    apiKey: process.env.STABILITY_API_KEY,
  },

  // Cloudinary
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    isConfigured: !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET &&
      !process.env.CLOUDINARY_CLOUD_NAME.startsWith("YOUR_")
    ),
  },

  // Remove.bg
  removeBg: {
    apiKey: process.env.REMOVE_BG_API_KEY,
  },

  // Replicate
  replicate: {
    apiToken: process.env.REPLICATE_API_TOKEN,
  },
};
