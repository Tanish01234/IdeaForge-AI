/**
 * IdeaForge AI – Image Generator Service
 * ─────────────────────────────────────────────────────────────
 * Routes image generation to the configured provider:
 *   • "openai"    → DALL-E 3 (default, best quality)
 *   • "stability" → Stability AI (Stable Diffusion XL)
 *   • "replicate" → Replicate hosted models (SDXL, Flux, etc.)
 *
 * API keys are read from process.env via config/env.js — never hardcoded.
 */

import axios from "axios";
import OpenAI from "openai";
import { config } from "../config/env.js";

// ─────────────────────────────────────────
// OpenAI DALL-E 3 Provider
// ─────────────────────────────────────────

const openai = new OpenAI({ apiKey: config.openai.apiKey });

/**
 * Generate image using DALL-E 3
 * @param {string} prompt - Detailed image generation prompt
 * @returns {Promise<string>} - Direct image URL (expires in ~1hr)
 */
async function generateWithDallE3(prompt) {
    if (!config.openai.apiKey) {
        throw new Error(
            "Missing required API key. Please add OPENAI_API_KEY to the .env file."
        );
    }

    const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "vivid",
    });

    return response.data[0].url;
}

// ─────────────────────────────────────────
// Stability AI Provider (Stable Diffusion XL)
// ─────────────────────────────────────────

/**
 * Generate image using Stability AI
 * @param {string} prompt - Detailed image generation prompt
 * @returns {Promise<string>} - Base64 image data URI
 */
async function generateWithStability(prompt) {
    if (
        !config.stability.apiKey ||
        config.stability.apiKey.startsWith("YOUR_")
    ) {
        throw new Error(
            "Missing required API key. Please add STABILITY_API_KEY to the .env file."
        );
    }

    const response = await axios.post(
        "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
        {
            text_prompts: [
                { text: prompt, weight: 1 },
                {
                    text: "blurry, ugly, distorted, low quality, watermark, text, logo",
                    weight: -1,
                },
            ],
            cfg_scale: 7,
            height: 1024,
            width: 1024,
            samples: 1,
            steps: 30,
        },
        {
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${config.stability.apiKey}`,
                "Content-Type": "application/json",
            },
        }
    );

    if (!response.data.artifacts || response.data.artifacts.length === 0) {
        throw new Error("Stability AI returned no generated images.");
    }

    const base64 = response.data.artifacts[0].base64;
    return `data:image/png;base64,${base64}`;
}

// ─────────────────────────────────────────
// Replicate Provider (SDXL / Flux etc.)
// ─────────────────────────────────────────

/**
 * Generate image using Replicate (using SDXL model)
 * @param {string} prompt - Detailed image generation prompt
 * @returns {Promise<string>} - Image URL from Replicate CDN
 */
async function generateWithReplicate(prompt) {
    if (
        !config.replicate.apiToken ||
        config.replicate.apiToken.startsWith("YOUR_")
    ) {
        throw new Error(
            "Missing required API key. Please add REPLICATE_API_TOKEN to the .env file."
        );
    }

    // Start the prediction
    const startResponse = await axios.post(
        "https://api.replicate.com/v1/predictions",
        {
            version:
                "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b", // SDXL
            input: {
                prompt: prompt,
                negative_prompt: "blurry, low quality, distorted, ugly, watermark",
                width: 1024,
                height: 1024,
                num_inference_steps: 25,
                guidance_scale: 7.5,
            },
        },
        {
            headers: {
                Authorization: `Token ${config.replicate.apiToken}`,
                "Content-Type": "application/json",
            },
        }
    );

    const predictionId = startResponse.data.id;

    // Poll for completion (max 60 seconds)
    for (let attempt = 0; attempt < 20; attempt++) {
        await new Promise((r) => setTimeout(r, 3000));

        const pollResponse = await axios.get(
            `https://api.replicate.com/v1/predictions/${predictionId}`,
            {
                headers: { Authorization: `Token ${config.replicate.apiToken}` },
            }
        );

        const { status, output, error } = pollResponse.data;

        if (status === "succeeded" && output && output.length > 0) {
            return output[0];
        }

        if (status === "failed") {
            throw new Error(`Replicate generation failed: ${error}`);
        }
    }

    throw new Error("Replicate image generation timed out after 60 seconds.");
}

// ─────────────────────────────────────────
// Main Dispatcher
// ─────────────────────────────────────────

/**
 * Generate an image using the configured provider.
 * Falls back to DALL-E 3 if provider is unknown.
 *
 * @param {string} prompt - Final AI image generation prompt
 * @returns {Promise<string>} - Image URL or data URI
 */
export async function generateImage(prompt) {
    const provider = config.imageProvider;

    console.log(`🖼️  Generating image via: ${provider.toUpperCase()}`);

    switch (provider) {
        case "stability":
            return generateWithStability(prompt);
        case "replicate":
            return generateWithReplicate(prompt);
        case "openai":
        default:
            return generateWithDallE3(prompt);
    }
}
