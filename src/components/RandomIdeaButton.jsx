import { motion } from "framer-motion";

const CRAZY_COMBOS = [
    ["Dragon", "Motorcycle", "Tokyo"],
    ["Elephant", "Skateboard", "Space"],
    ["Pizza", "Taj Mahal"],
    ["Mermaid", "Cyberpunk", "Desert"],
    ["Tiger", "Robot", "City"],
    ["🦁", "🤖", "🌌"],
    ["Auto Rickshaw", "Spaceship"],
    ["Shark", "Samurai", "Volcano"],
    ["Panda", "DJ", "Neon City"],
    ["🐍", "⚡", "🏔️"],
    ["Castle", "Waterfall", "Night"],
    ["Astronaut", "Jungle", "Ancient Ruins"],
    ["Owl", "Library", "Steampunk"],
    ["🐙", "🚀", "🪐"],
    ["Cheetah", "Formula 1", "Lightning"],
    ["Whale", "Cloud City", "Sunset"],
    ["Samurai", "Neon Tokyo", "Rain"],
    ["Griffin", "Lighthouse", "Storm"],
    ["🦊", "🎭", "🌸"],
    ["Dinosaur", "Skyscraper", "Future"],
    ["Ice Dragon", "Desert", "Aurora"],
    ["🐘", "🏎️", "🌋"],
    ["Ninja", "Waterfall", "Moon"],
    ["Robot Dog", "Forest", "Fog"],
    ["🧙", "🚂", "🌌"],
];

export default function RandomIdeaButton({ onSelect }) {
    const handleClick = () => {
        const combo = CRAZY_COMBOS[Math.floor(Math.random() * CRAZY_COMBOS.length)];
        onSelect(combo);
    };

    return (
        <motion.button
            id="random-idea-btn"
            onClick={handleClick}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            className="flex items-center justify-center gap-2 px-5 py-4 rounded-xl font-bold text-sm transition-all"
            style={{
                background: "rgba(6,182,212,0.12)",
                border: "1.5px solid rgba(6,182,212,0.35)",
                color: "#67e8f9",
                cursor: "pointer",
                fontFamily: "Space Grotesk, sans-serif",
                whiteSpace: "nowrap",
            }}
        >
            🎲 Crazy Idea
        </motion.button>
    );
}
