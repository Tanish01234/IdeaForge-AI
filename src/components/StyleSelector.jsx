import { motion } from "framer-motion";

const STYLES = [
    { key: "realistic", label: "Realistic", emoji: "📷", desc: "Hyperrealistic 8K" },
    { key: "cinematic", label: "Cinematic", emoji: "🎬", desc: "Movie still" },
    { key: "anime", label: "Anime", emoji: "⛩️", desc: "Studio Ghibli" },
    { key: "pixar", label: "Pixar", emoji: "🎠", desc: "3D Animation" },
    { key: "fantasy", label: "Fantasy", emoji: "🧙", desc: "Epic fantasy art" },
    { key: "cyberpunk", label: "Cyberpunk", emoji: "🌆", desc: "Neon dystopia" },
    { key: "3d-render", label: "3D Render", emoji: "💎", desc: "Octane render" },
    { key: "minimal", label: "Minimal", emoji: "🪷", desc: "Clean & geometric" },
];

export default function StyleSelector({ selected, onSelect }) {
    return (
        <div className="grid grid-cols-4 sm:grid-cols-4 gap-2.5">
            {STYLES.map((s, i) => (
                <motion.button
                    key={s.key}
                    id={`style-${s.key}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSelect(s.key)}
                    className={`style-card ${selected === s.key ? "active" : ""}`}
                >
                    <div className="text-2xl mb-1">{s.emoji}</div>
                    <div
                        className="text-xs font-700 leading-tight"
                        style={{
                            color: selected === s.key ? "#c4b5fd" : "rgba(255,255,255,0.8)",
                            fontWeight: 600,
                        }}
                    >
                        {s.label}
                    </div>
                    <div
                        className="text-xs mt-0.5 hidden sm:block"
                        style={{ color: "var(--forge-muted)", fontSize: "0.65rem" }}
                    >
                        {s.desc}
                    </div>
                </motion.button>
            ))}
        </div>
    );
}
