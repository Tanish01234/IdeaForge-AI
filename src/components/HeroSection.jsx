import { motion } from "framer-motion";

export default function HeroSection() {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center py-14 sm:py-20"
        >
            {/* Badge */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 mb-6"
            >
                <span className="section-badge text-sm">
                    ✨ AI Reality Mixer · Powered by GPT-4o + DALL-E 3
                </span>
            </motion.div>

            {/* Main Title */}
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7 }}
                className="text-5xl sm:text-7xl font-black mb-4 leading-tight tracking-tight"
            >
                <span className="gradient-text text-glow">IdeaForge</span>
                <span className="text-white"> AI</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.7 }}
                className="text-2xl sm:text-3xl font-semibold mb-4"
                style={{ color: "rgba(255,255,255,0.75)" }}
            >
                Mix ideas. Create{" "}
                <span className="gradient-text-gold">impossible worlds.</span>
            </motion.p>

            {/* Description */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.7 }}
                className="text-base sm:text-lg max-w-xl mx-auto leading-relaxed"
                style={{ color: "var(--forge-muted)" }}
            >
                Enter 2–5 ideas, emojis, or objects. The AI merges them into a{" "}
                <strong style={{ color: "#c4b5fd" }}>stunning visual</strong> and{" "}
                <strong style={{ color: "#c4b5fd" }}>creative story.</strong>
            </motion.p>

            {/* Example pills */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                className="flex flex-wrap justify-center gap-2 mt-6"
            >
                {[
                    "🐯 Tiger + 🤖 Robot + 🌆 City",
                    "🍕 Pizza + 🕌 Taj Mahal",
                    "🦁 + 🌌 + ⚡",
                    "🚀 Rickshaw + 🛸 Spaceship",
                ].map((ex, i) => (
                    <span
                        key={i}
                        className="text-xs px-3 py-1.5 rounded-full font-medium"
                        style={{
                            background: "rgba(124,58,237,0.1)",
                            border: "1px solid rgba(124,58,237,0.25)",
                            color: "rgba(255,255,255,0.5)",
                        }}
                    >
                        {ex}
                    </span>
                ))}
            </motion.div>
        </motion.div>
    );
}
