/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
                display: ["Space Grotesk", "sans-serif"],
            },
            colors: {
                forge: {
                    bg: "#05050f",
                    card: "#0d0d1f",
                    border: "#1e1e3f",
                    purple: "#7c3aed",
                    violet: "#5b21b6",
                    cyan: "#06b6d4",
                    pink: "#ec4899",
                    glow: "#a855f7",
                },
            },
            animation: {
                float: "float 6s ease-in-out infinite",
                pulse2: "pulse2 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                shimmer: "shimmer 2s linear infinite",
                "spin-slow": "spin 8s linear infinite",
            },
            keyframes: {
                float: {
                    "0%, 100%": { transform: "translateY(0px)" },
                    "50%": { transform: "translateY(-10px)" },
                },
                pulse2: {
                    "0%, 100%": { opacity: "1" },
                    "50%": { opacity: "0.6" },
                },
                shimmer: {
                    "0%": { backgroundPosition: "-200% 0" },
                    "100%": { backgroundPosition: "200% 0" },
                },
            },
        },
    },
    plugins: [],
};
