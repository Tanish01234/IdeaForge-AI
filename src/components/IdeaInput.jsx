import { useState, useRef, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MAX_IDEAS = 5;

export default function IdeaInput({ ideas, setIdeas }) {
    const [input, setInput] = useState("");
    const inputRef = useRef(null);

    const addIdea = (value) => {
        const trimmed = value.trim();
        if (!trimmed) return;
        if (ideas.length >= MAX_IDEAS) return;
        if (ideas.includes(trimmed)) return;
        setIdeas([...ideas, trimmed]);
        setInput("");
    };

    const removeIdea = (idx) => {
        setIdeas(ideas.filter((_, i) => i !== idx));
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" || e.key === "," || e.key === "+") {
            e.preventDefault();
            addIdea(input);
        }
        if (e.key === "Backspace" && input === "" && ideas.length > 0) {
            setIdeas(ideas.slice(0, -1));
        }
    };

    return (
        <div>
            {/* Tag chips */}
            <AnimatePresence>
                {ideas.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-wrap gap-2 mb-3"
                    >
                        {ideas.map((idea, i) => (
                            <motion.span
                                key={idea + i}
                                initial={{ opacity: 0, scale: 0.7 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.7 }}
                                transition={{ duration: 0.2 }}
                                className="tag-chip"
                            >
                                {idea}
                                <button
                                    className="remove-btn"
                                    onClick={() => removeIdea(i)}
                                    aria-label={`Remove ${idea}`}
                                >
                                    ×
                                </button>
                            </motion.span>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input field */}
            <div className="flex gap-2">
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={ideas.length >= MAX_IDEAS}
                    placeholder={
                        ideas.length === 0
                            ? "Type an idea, emoji, or object and press Enter…"
                            : ideas.length >= MAX_IDEAS
                                ? `Max ${MAX_IDEAS} ideas reached!`
                                : "Add another idea… (Enter or +)"
                    }
                    className="forge-input"
                    id="idea-input"
                    autoComplete="off"
                />
                <button
                    onClick={() => addIdea(input)}
                    disabled={!input.trim() || ideas.length >= MAX_IDEAS}
                    className="px-4 py-3 rounded-xl font-bold text-white transition-all"
                    style={{
                        background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
                        opacity: !input.trim() || ideas.length >= MAX_IDEAS ? 0.4 : 1,
                        minWidth: "52px",
                    }}
                    aria-label="Add idea"
                >
                    +
                </button>
            </div>

            {/* Hint */}
            <p className="text-xs mt-2" style={{ color: "var(--forge-muted)" }}>
                Press{" "}
                <kbd className="px-1.5 py-0.5 rounded text-xs" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    Enter
                </kbd>{" "}
                or{" "}
                <kbd className="px-1.5 py-0.5 rounded text-xs" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    +
                </kbd>{" "}
                to add. Up to {MAX_IDEAS} ideas. Emojis welcome! 🎉
            </p>
        </div>
    );
}
