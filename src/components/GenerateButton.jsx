import { motion } from "framer-motion";

export default function GenerateButton({ onClick, isLoading, disabled }) {
    return (
        <motion.button
            id="forge-generate-btn"
            onClick={onClick}
            disabled={isLoading || disabled}
            whileTap={{ scale: 0.97 }}
            className="forge-btn flex-1 flex items-center justify-center gap-3"
            style={{ minHeight: "58px" }}
        >
            {isLoading ? (
                <>
                    <span className="inline-block w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Forging Reality…</span>
                </>
            ) : (
                <>
                    <span className="text-xl">✨</span>
                    <span>Forge It!</span>
                </>
            )}
        </motion.button>
    );
}
