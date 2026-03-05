import { motion, AnimatePresence } from "framer-motion";
import ShareButtons from "./ShareButtons.jsx";

export default function ResultCard({ result, isLoading }) {
    return (
        <AnimatePresence mode="wait">
            {isLoading && (
                <motion.div
                    key="loading"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="glass-card p-8 mb-8"
                >
                    {/* Loading skeleton */}
                    <div className="section-badge mb-6">⚡ Forging Your Reality…</div>
                    <div className="flex flex-col sm:flex-row gap-6">
                        {/* Image skeleton */}
                        <div
                            className="skeleton rounded-2xl flex-shrink-0"
                            style={{ width: "100%", maxWidth: "320px", aspectRatio: "1" }}
                        />
                        <div className="flex-1 flex flex-col gap-3 justify-center">
                            <div className="skeleton h-8 rounded-lg w-3/4" />
                            <div className="skeleton h-4 rounded w-full" />
                            <div className="skeleton h-4 rounded w-5/6" />
                            <div className="skeleton h-4 rounded w-4/6" />
                            <div className="flex gap-2 mt-2">
                                <div className="skeleton h-10 rounded-lg w-28" />
                                <div className="skeleton h-10 rounded-lg w-28" />
                            </div>
                            <div className="mt-4 flex items-center gap-2">
                                <span
                                    className="inline-block w-4 h-4 rounded-full border-2 animate-spin"
                                    style={{ borderColor: "rgba(124,58,237,0.3)", borderTopColor: "#7c3aed" }}
                                />
                                <span className="text-sm" style={{ color: "var(--forge-muted)" }}>
                                    AI is crafting your visual…
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {result && !isLoading && (
                <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="glass-card p-6 sm:p-8 mb-8 glow-purple"
                >
                    <div className="section-badge mb-6">
                        <span>🎨</span> Your Generated Reality
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
                        {/* Image */}
                        <motion.div
                            className="result-image-wrapper flex-shrink-0"
                            style={{ width: "100%", maxWidth: "340px", alignSelf: "flex-start" }}
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1, duration: 0.5 }}
                        >
                            <img
                                src={result.imageUrl}
                                alt={result.sceneTitle}
                                loading="lazy"
                            />
                            <div className="watermark-overlay">
                                ⚡
                            </div>
                        </motion.div>

                        {/* Text content */}
                        <div className="flex-1">
                            {/* Ideas used */}
                            <div className="flex flex-wrap gap-1.5 mb-3">
                                {result.ideas?.map((idea, i) => (
                                    <span key={i} className="tag-chip text-xs px-2 py-1">{idea}</span>
                                ))}
                                {result.style && (
                                    <span
                                        className="text-xs px-2.5 py-1 rounded-full font-semibold"
                                        style={{
                                            background: "rgba(6,182,212,0.12)",
                                            border: "1px solid rgba(6,182,212,0.3)",
                                            color: "#67e8f9",
                                        }}
                                    >
                                        {result.style}
                                    </span>
                                )}
                            </div>

                            {/* Scene title */}
                            <motion.h2
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-2xl sm:text-3xl font-black mb-3 gradient-text leading-tight"
                            >
                                {result.sceneTitle}
                            </motion.h2>

                            {/* Creative story */}
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.35 }}
                                className="leading-relaxed mb-4 text-sm sm:text-base"
                                style={{ color: "rgba(255,255,255,0.75)" }}
                            >
                                {result.story}
                            </motion.p>

                            {/* Prompt (collapsible) */}
                            <details className="mb-2">
                                <summary
                                    className="text-xs cursor-pointer mb-1 font-semibold"
                                    style={{ color: "var(--forge-muted)" }}
                                >
                                    🔍 View AI Prompt
                                </summary>
                                <p
                                    className="text-xs mt-2 p-3 rounded-lg leading-relaxed"
                                    style={{
                                        background: "rgba(124,58,237,0.1)",
                                        border: "1px solid rgba(124,58,237,0.2)",
                                        color: "rgba(255,255,255,0.55)",
                                        fontFamily: "monospace",
                                    }}
                                >
                                    {result.prompt}
                                </p>
                            </details>

                            {/* Share buttons */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <ShareButtons result={result} />
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
