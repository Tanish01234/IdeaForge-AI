import { useState, useRef } from "react";
import { Toaster } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import HeroSection from "./components/HeroSection.jsx";
import IdeaInput from "./components/IdeaInput.jsx";
import StyleSelector from "./components/StyleSelector.jsx";
import GenerateButton from "./components/GenerateButton.jsx";
import RandomIdeaButton from "./components/RandomIdeaButton.jsx";
import ResultCard from "./components/ResultCard.jsx";
import CameraMode from "./components/CameraMode.jsx";
import ParticleBackground from "./components/ParticleBackground.jsx";
import axios from "axios";
import toast from "react-hot-toast";

export default function App() {
    const [ideas, setIdeas] = useState([]);
    const [style, setStyle] = useState("cinematic");
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState(null);
    const resultRef = useRef(null);

    const handleGenerate = async () => {
        if (ideas.length === 0) {
            toast.error("Add at least one idea to forge! ✨");
            return;
        }

        setIsGenerating(true);
        setResult(null);

        try {
            const response = await axios.post("/api/generate", { ideas, style });
            setResult(response.data);

            // Smooth scroll to result
            setTimeout(() => {
                resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 300);
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                "Something went wrong. Please check your API key and try again.";
            toast.error(msg, { duration: 5000 });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="relative min-h-screen" style={{ background: "#05050f" }}>
            {/* Animated particle background */}
            <ParticleBackground />

            {/* Toast notifications */}
            <Toaster
                position="top-center"
                toastOptions={{
                    style: {
                        background: "#0d0d1f",
                        color: "#f1f0fb",
                        border: "1px solid rgba(124,58,237,0.3)",
                        fontFamily: "Space Grotesk, sans-serif",
                    },
                }}
            />

            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-6">
                {/* Hero */}
                <HeroSection />

                {/* Main Input Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                    className="glass-card p-6 sm:p-8 mb-8"
                >
                    {/* Idea Input */}
                    <div className="mb-6">
                        <div className="section-badge mb-4">
                            <span>💡</span> Step 1 — Your Ideas
                        </div>
                        <IdeaInput ideas={ideas} setIdeas={setIdeas} />
                    </div>

                    <div className="divider" />

                    {/* Style Selector */}
                    <div className="mb-6">
                        <div className="section-badge mb-4">
                            <span>🎨</span> Step 2 — Visual Style
                        </div>
                        <StyleSelector selected={style} onSelect={setStyle} />
                    </div>

                    <div className="divider" />

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <RandomIdeaButton onSelect={setIdeas} />
                        <GenerateButton
                            onClick={handleGenerate}
                            isLoading={isGenerating}
                            disabled={ideas.length === 0}
                        />
                    </div>
                </motion.div>

                {/* Result */}
                <AnimatePresence>
                    {(result || isGenerating) && (
                        <div ref={resultRef}>
                            <ResultCard result={result} isLoading={isGenerating} />
                        </div>
                    )}
                </AnimatePresence>

                {/* Camera Mode */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.6, ease: "easeOut" }}
                    className="mt-8"
                >
                    <CameraMode />
                </motion.div>

                {/* Footer */}
                <footer className="text-center py-10 mt-8">
                    <p className="text-sm" style={{ color: "var(--forge-muted)" }}>
                        IdeaForge AI - Built by ❤️{" "}
                        <span className="gradient-text font-semibold">Tanis Bedia</span>
                        {" · "}Turn imagination into reality
                    </p>
                </footer>
            </div>
        </div>
    );
}
