/**
 * IdeaForge AI – Generate Routes
 * ─────────────────────────────────────────────────────────────
 * POST /api/generate       → Main image + story generation endpoint
 * POST /api/camera-mode    → Upload photo for redesign analysis
 * GET  /api/health         → Health check
 */

import express from "express";
import multer from "multer";
import { generateImagePrompt, generateStory, analyzeImageForRedesign } from "../services/openaiService.js";
import { generateImage } from "../services/imageGenerator.js";
import {
    uploadImageFromUrl,
    uploadBase64Image,
    addWatermarkTransformation,
} from "../services/cloudinaryUpload.js";
import { generateLimiter, cameraLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// ─────────────────────────────────────────
// Multer – In-memory file upload (camera mode)
// ─────────────────────────────────────────

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
    fileFilter: (req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only image files (JPEG, PNG, WebP) are allowed."));
        }
    },
});

// ─────────────────────────────────────────
// GET /api/health
// ─────────────────────────────────────────

router.get("/health", (req, res) => {
    res.json({
        status: "ok",
        service: "IdeaForge AI Backend",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
    });
});

// ─────────────────────────────────────────
// POST /api/generate
// ─────────────────────────────────────────
// Body: { ideas: string[], style: string }
// Returns: { imageUrl, sceneTitle, story, prompt }

router.post("/generate", generateLimiter, async (req, res) => {
    try {
        const { ideas, style } = req.body;

        // ── Input validation
        if (!ideas || !Array.isArray(ideas) || ideas.length < 1) {
            return res.status(400).json({
                error: "Invalid input",
                message: "Please provide at least 1 idea in the 'ideas' array.",
            });
        }

        if (ideas.length > 5) {
            return res.status(400).json({
                error: "Too many ideas",
                message: "Maximum 5 ideas are allowed per generation.",
            });
        }

        const selectedStyle = style || "cinematic";

        // Sanitize ideas (remove empty strings, trim whitespace)
        const cleanIdeas = ideas
            .map((i) => String(i).trim())
            .filter((i) => i.length > 0);

        if (cleanIdeas.length === 0) {
            return res.status(400).json({
                error: "Invalid input",
                message: "Ideas cannot be empty strings.",
            });
        }

        console.log(`\n✨ Generating for ideas: [${cleanIdeas.join(", ")}] | Style: ${selectedStyle}`);

        // ── Step 1: Generate AI prompt & scene title (GPT-4o)
        console.log("  Step 1/3 → Crafting AI prompt...");
        const { prompt, sceneTitle } = await generateImagePrompt(cleanIdeas, selectedStyle);
        console.log(`  Prompt: "${prompt.substring(0, 80)}..."`);

        // ── Step 2: Generate image (provider-dependent)
        console.log("  Step 2/3 → Generating image...");
        let imageUrl = await generateImage(prompt);

        // ── Step 3: Upload to Cloudinary for permanent URL
        const publicId = `ideaforge_${Date.now()}`;
        if (imageUrl.startsWith("data:")) {
            imageUrl = await uploadBase64Image(imageUrl, publicId);
        } else {
            imageUrl = await uploadImageFromUrl(imageUrl, publicId);
        }

        // Add watermark transformation
        const watermarkedUrl = addWatermarkTransformation(imageUrl);

        // ── Step 4: Generate creative story (GPT-4o)
        console.log("  Step 3/3 → Writing creative story...");
        const story = await generateStory(sceneTitle, prompt, cleanIdeas);

        console.log(`  ✅ Done! Scene: "${sceneTitle}"`);

        // ── Send response
        res.json({
            success: true,
            imageUrl: watermarkedUrl || imageUrl,
            rawImageUrl: imageUrl,
            sceneTitle,
            story,
            prompt,
            style: selectedStyle,
            ideas: cleanIdeas,
            generatedAt: new Date().toISOString(),
        });
    } catch (err) {
        console.error("❌ Generation error:", err.message);

        // OpenAI content policy errors
        if (err.code === "content_policy_violation") {
            return res.status(422).json({
                error: "Content policy violation",
                message:
                    "Your ideas couldn't be processed due to content guidelines. Try different concepts!",
            });
        }

        // API key errors
        if (err.status === 401 || err.code === "invalid_api_key") {
            return res.status(500).json({
                error: "API configuration error",
                message:
                    "Missing required API key. Please add it to the .env file.",
            });
        }

        res.status(500).json({
            error: "Generation failed",
            message: err.message || "Something went wrong. Please try again.",
        });
    }
});

// ─────────────────────────────────────────
// POST /api/camera-mode
// ─────────────────────────────────────────
// Form data: file (image)
// Returns: { objectDetected, redesigns }

router.post("/camera-mode", cameraLimiter, upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: "No file uploaded",
                message: "Please upload an image file.",
            });
        }

        const { buffer, mimetype } = req.file;
        const base64 = buffer.toString("base64");

        console.log(`\n📷 Camera mode: analyzing ${mimetype} image (${Math.round(buffer.length / 1024)}KB)`);

        const result = await analyzeImageForRedesign(base64, mimetype);

        res.json({
            success: true,
            objectDetected: result.objectDetected,
            redesigns: result.redesigns,
        });
    } catch (err) {
        console.error("❌ Camera mode error:", err.message);
        res.status(500).json({
            error: "Analysis failed",
            message: err.message || "Could not analyze the image. Please try again.",
        });
    }
});

export default router;
