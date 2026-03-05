import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";

export default function CameraMode() {
    const [isDragActive, setIsDragActive] = useState(false);
    const [preview, setPreview] = useState(null);
    const [file, setFile] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const inputRef = useRef(null);

    const handleFile = (f) => {
        if (!f || !f.type.startsWith("image/")) {
            toast.error("Please upload an image file (JPEG, PNG, WebP)");
            return;
        }
        if (f.size > 10 * 1024 * 1024) {
            toast.error("Image too large. Max 10MB.");
            return;
        }
        setFile(f);
        setResult(null);
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(f);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragActive(false);
        handleFile(e.dataTransfer.files[0]);
    };

    const handleAnalyze = async () => {
        if (!file) return;
        setIsAnalyzing(true);
        setResult(null);
        try {
            const formData = new FormData();
            formData.append("image", file);
            const res = await axios.post("/api/camera-mode", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setResult(res.data);
        } catch (err) {
            const msg = err.response?.data?.message || "Analysis failed. Please try again.";
            toast.error(msg);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const REDESIGN_COLORS = [
        "rgba(124,58,237,0.2)",
        "rgba(6,182,212,0.15)",
        "rgba(236,72,153,0.15)",
    ];
    const REDESIGN_BORDERS = [
        "rgba(124,58,237,0.4)",
        "rgba(6,182,212,0.35)",
        "rgba(236,72,153,0.35)",
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glass-card p-6 sm:p-8"
        >
            {/* Header */}
            <div className="section-badge mb-2">📷 Camera Mode – AI Redesign</div>
            <p className="text-sm mb-5" style={{ color: "var(--forge-muted)" }}>
                Upload any photo and the AI will suggest 3 creative redesign concepts for the main object.
            </p>

            <div className="flex flex-col sm:flex-row gap-6">
                {/* Drop zone */}
                <div className="flex-1">
                    <div
                        id="camera-dropzone"
                        className={`drop-zone ${isDragActive ? "drag-active" : ""}`}
                        onClick={() => inputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
                        onDragLeave={() => setIsDragActive(false)}
                        onDrop={handleDrop}
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFile(e.target.files[0])}
                            id="camera-file-input"
                        />
                        {preview ? (
                            <div className="relative">
                                <img
                                    src={preview}
                                    alt="Uploaded"
                                    className="max-h-48 mx-auto rounded-xl object-contain"
                                />
                                <p className="text-xs mt-3" style={{ color: "var(--forge-muted)" }}>
                                    Click to change image
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="text-4xl mb-3">📸</div>
                                <p className="font-semibold mb-1" style={{ color: "rgba(255,255,255,0.7)" }}>
                                    Drop your photo here
                                </p>
                                <p className="text-xs" style={{ color: "var(--forge-muted)" }}>
                                    or click to browse · JPEG, PNG, WebP · Max 10MB
                                </p>
                            </>
                        )}
                    </div>

                    {/* Analyze button */}
                    {file && (
                        <motion.button
                            id="camera-analyze-btn"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                            className="forge-btn w-full mt-3 flex items-center justify-center gap-2"
                        >
                            {isAnalyzing ? (
                                <>
                                    <span className="inline-block w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                    Analyzing with AI…
                                </>
                            ) : (
                                <>🔍 Analyze & Reimagine</>
                            )}
                        </motion.button>
                    )}
                </div>

                {/* Results */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            key="camera-result"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex-1"
                        >
                            {result.objectDetected && (
                                <p className="text-sm font-semibold mb-3" style={{ color: "rgba(255,255,255,0.6)" }}>
                                    🔍 Detected:{" "}
                                    <span style={{ color: "#c4b5fd" }}>{result.objectDetected}</span>
                                </p>
                            )}
                            <div className="flex flex-col gap-3">
                                {result.redesigns?.map((r, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.15 }}
                                        className="p-4 rounded-xl"
                                        style={{
                                            background: REDESIGN_COLORS[i],
                                            border: `1px solid ${REDESIGN_BORDERS[i]}`,
                                        }}
                                    >
                                        <p className="font-bold text-sm mb-1" style={{ color: "white" }}>
                                            {i + 1}. {r.concept}
                                        </p>
                                        <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
                                            {r.description}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {isAnalyzing && (
                        <motion.div
                            key="camera-loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex-1 flex flex-col gap-3"
                        >
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="skeleton rounded-xl" style={{ height: "72px" }} />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
