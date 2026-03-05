/**
 * IdeaForge AI – OpenAI Service
 * ──────────────────────────────────────────────────────────────
 * Handles:
 *   1. AI Prompt Engineering  – merges user ideas into a vivid image prompt
 *   2. Story Generation       – writes a short creative scene description
 *   3. Camera Mode Analysis   – analyzes uploaded images via GPT-4o Vision
 *
 * Includes SMART FALLBACK: if OpenAI quota is exceeded (429),
 * uses template-based generation so the app always works.
 */

import OpenAI from "openai";
import { config } from "../config/env.js";

// ─────────────────────────────────────────
// Client Initialization
// ─────────────────────────────────────────

let openai = null;
try {
    if (config.openai.apiKey && !config.openai.apiKey.startsWith("YOUR_")) {
        openai = new OpenAI({ apiKey: config.openai.apiKey });
    }
} catch (e) {
    console.warn("⚠️  OpenAI client could not be initialized — using fallback mode.");
}

// ─────────────────────────────────────────
// Style-Specific Prompt Enhancers
// ─────────────────────────────────────────

const STYLE_ENHANCERS = {
    realistic:
        "photorealistic, ultra-detailed, 8k resolution, natural lighting, hyperrealistic, sharp focus",
    cinematic:
        "cinematic lighting, dramatic atmosphere, volumetric fog, movie still, anamorphic lens, epic composition",
    anime:
        "anime art style, Studio Ghibli inspired, vibrant colors, cel shading, detailed line art, manga style",
    pixar:
        "Pixar 3D animation style, soft subsurface scattering, expressive features, warm lighting, Disney quality, charming",
    fantasy:
        "epic fantasy art, magical atmosphere, mystical lighting, detailed environment, fantasy oil painting, ethereal",
    "cyberpunk":
        "cyberpunk aesthetic, neon lights, rain-soaked streets, dark dystopian future, blade runner aesthetic, neon reflections",
    "3d-render":
        "octane render, 3D render, blender 3D, photorealistic materials, studio lighting, ray tracing, ultra-detailed",
    minimal:
        "minimalist art, clean composition, flat design, soft pastel colors, geometric shapes, modern aesthetic",
};

const STYLE_ADJECTIVES = {
    realistic: "ultra-realistic",
    cinematic: "cinematic",
    anime: "anime-style",
    pixar: "Pixar-style",
    fantasy: "epic fantasy",
    "cyberpunk": "cyberpunk neon",
    "3d-render": "3D-rendered",
    minimal: "minimalist",
};

// ─────────────────────────────────────────
// FALLBACK: Template-based Prompt Generator
// Used when OpenAI quota is exceeded
// ─────────────────────────────────────────

function templatePrompt(ideas, style) {
    const styleKey = style.toLowerCase().replace(/\s+/g, "-");
    const enhancer = STYLE_ENHANCERS[styleKey] || STYLE_ENHANCERS.cinematic;
    const adj = STYLE_ADJECTIVES[styleKey] || "cinematic";

    const combined = ideas.join(", ");
    const titleWords = ideas.map(w => w.replace(/[^\w\s]/g, "").trim()).filter(Boolean);

    // Generate a scene title from the ideas
    const sceneTitle = titleWords.length >= 2
        ? `${titleWords[titleWords.length - 1]} of the ${titleWords[0]}`
        : titleWords[0] || "The Vision";

    // Build a coherent prompt
    const prompt = `A breathtaking ${adj} scene featuring ${combined} merged together in perfect harmony, epic scale composition, dramatic lighting, intricate details, masterful artwork, ${enhancer}`;

    return { prompt, sceneTitle };
}

// ─────────────────────────────────────────
// FALLBACK: Template-based Story Generator
// ─────────────────────────────────────────

const STORY_TEMPLATES = [
    (title, ideas) => `In a world where ${ideas[0] || "the impossible"} and ${ideas[1] || "wonder"} collide, the legend of ${title} was born — a vision so striking it defied every boundary of imagination.`,
    (title, ideas) => `They said it could never exist. But ${title} emerged from the chaos of ${ideas.slice(0, 2).join(" and ")}, shattering everything humanity thought it knew about what was possible.`,
    (title, ideas) => `Where ${ideas[0] || "power"} meets ${ideas[1] || "beauty"}, something extraordinary takes shape. ${title} stands as proof that the universe's greatest creations are born from the most unlikely combinations.`,
    (title, ideas) => `The fusion of ${ideas.join(", ")} gave rise to ${title} — an entity that exists at the edge of reality, equally terrifying and sublime in its impossible beauty.`,
    (title, ideas) => `Ancient prophecies spoke of a day when ${ideas[0] || "two worlds"} would merge. ${title} is that prophecy made real — a breathtaking testament to what exists beyond the limits of the possible.`,
];

function templateStory(sceneTitle, ideas) {
    const pick = STORY_TEMPLATES[Math.floor(Math.random() * STORY_TEMPLATES.length)];
    return pick(sceneTitle, ideas);
}

// ─────────────────────────────────────────
// Helper: check if error is quota-related
// ─────────────────────────────────────────

function isQuotaError(err) {
    return (
        err.status === 429 ||
        err.code === "insufficient_quota" ||
        (err.message && err.message.includes("quota")) ||
        (err.message && err.message.includes("exceeded"))
    );
}

// ─────────────────────────────────────────
// 1. Generate AI Image Prompt from Ideas
// ─────────────────────────────────────────

export async function generateImagePrompt(ideas, style) {
    const styleKey = style.toLowerCase().replace(/\s+/g, "-");
    const styleEnhancer = STYLE_ENHANCERS[styleKey] || STYLE_ENHANCERS.cinematic;
    const ideasText = ideas.join(" + ");

    // Try OpenAI first
    if (openai) {
        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: `You are a world-class AI image prompt engineer. Your specialty is merging disparate concepts into coherent, vivid, and visually stunning image prompts. You always output JSON only — no markdown, no explanation.`,
                    },
                    {
                        role: "user",
                        content: `Merge these ideas into one vivid, detailed AI image generation prompt in ${style} style:
Ideas: ${ideasText}

Rules:
- Create a coherent, imaginative scene that logically combines ALL ideas
- The prompt must be 2-3 sentences, rich with visual detail
- DO NOT use phrases like "a combination of" — describe the merged scene directly
- Append these style keywords at the end: ${styleEnhancer}
- The scene title should be 3-5 dramatic words

Return ONLY valid JSON:
{
  "prompt": "...",
  "sceneTitle": "..."
}`,
                    },
                ],
                temperature: 0.85,
                max_tokens: 300,
                response_format: { type: "json_object" },
            });

            const raw = completion.choices[0].message.content;
            const result = JSON.parse(raw);
            if (result.prompt && result.sceneTitle) return result;
        } catch (err) {
            if (isQuotaError(err)) {
                console.warn("⚠️  OpenAI quota exceeded — using smart template fallback for prompt.");
            } else {
                throw err; // rethrow non-quota errors
            }
        }
    }

    // Fallback to template
    console.log("📝 Generating prompt using template fallback...");
    return templatePrompt(ideas, style);
}

// ─────────────────────────────────────────
// 2. Generate Creative Story
// ─────────────────────────────────────────

export async function generateStory(sceneTitle, imagePrompt, ideas = []) {
    // Try OpenAI first
    if (openai) {
        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: `You are a visionary sci-fi and fantasy storyteller. You write evocative, cinematic micro-stories in 2–3 sentences. Your stories feel like the opening line of an award-winning novel. Keep them under 70 words.`,
                    },
                    {
                        role: "user",
                        content: `Write a creative 2–3 sentence story for this scene.

Scene Title: ${sceneTitle}
Visual Context: ${imagePrompt}

Make it: poetic, imaginative, mysterious, and exciting.
Do NOT start with "In a" — vary your opening.
Output ONLY the story text, nothing else.`,
                    },
                ],
                temperature: 0.9,
                max_tokens: 150,
            });
            return completion.choices[0].message.content.trim();
        } catch (err) {
            if (isQuotaError(err)) {
                console.warn("⚠️  OpenAI quota exceeded — using template fallback for story.");
            } else {
                throw err;
            }
        }
    }

    // Fallback to template
    console.log("✍️  Generating story using template fallback...");
    return templateStory(sceneTitle, ideas);
}

// ─────────────────────────────────────────
// 3. Camera Mode – Object Redesign Analysis
// ─────────────────────────────────────────

export async function analyzeImageForRedesign(imageBase64, mimeType) {
    if (!openai) {
        // Fallback: return generic redesign ideas
        return {
            objectDetected: "Object",
            redesigns: [
                { concept: "Futuristic Neon Edition", description: "Reimagined with holographic panels, neon accent lighting, and a sleek cyberpunk aesthetic that pulses with electric energy." },
                { concept: "Organic Bio-Tech Hybrid", description: "Fused with living organic materials and embedded bio-circuitry, creating a seamless blend of nature and cutting-edge technology." },
                { concept: "Ancient Mystical Relic", description: "Transformed into an ancient artifact adorned with glowing runes, mystic crystals, and an aura of forgotten magical power." },
            ],
        };
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are a visionary product designer and futurist. You analyze everyday objects and reimagine them as extraordinary, futuristic, or fantastical redesigns. You always return JSON only.`,
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `Analyze the main object in this image and suggest exactly 3 creative redesign concepts. Each concept should be bold, imaginative, and specific.

Return ONLY valid JSON:
{
  "objectDetected": "...",
  "redesigns": [
    { "concept": "Concept Name", "description": "One sentence visual description of the redesign." },
    { "concept": "Concept Name", "description": "One sentence visual description of the redesign." },
    { "concept": "Concept Name", "description": "One sentence visual description of the redesign." }
  ]
}`,
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:${mimeType};base64,${imageBase64}`,
                                detail: "auto",
                            },
                        },
                    ],
                },
            ],
            temperature: 0.8,
            max_tokens: 400,
            response_format: { type: "json_object" },
        });

        const raw = completion.choices[0].message.content;
        const result = JSON.parse(raw);
        if (!result.redesigns || !Array.isArray(result.redesigns)) {
            throw new Error("OpenAI Vision returned malformed redesign response.");
        }
        return result;
    } catch (err) {
        if (isQuotaError(err)) {
            console.warn("⚠️  OpenAI quota exceeded — using fallback redesigns.");
            return {
                objectDetected: "Object",
                redesigns: [
                    { concept: "Futuristic Neon Edition", description: "Reimagined with holographic panels, neon accent lighting, and a sleek cyberpunk aesthetic that pulses with electric energy." },
                    { concept: "Organic Bio-Tech Hybrid", description: "Fused with living organic materials and embedded bio-circuitry, creating a seamless blend of nature and cutting-edge technology." },
                    { concept: "Ancient Mystical Relic", description: "Transformed into an ancient artifact adorned with glowing runes, mystic crystals, and an aura of forgotten magical power." },
                ],
            };
        }
        throw err;
    }
}
