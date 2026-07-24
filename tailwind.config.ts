import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FDFBF7",
        charcoal: "#1A1A1A",
        "soft-charcoal": "#4A4A4A",
        // Primary color palette - Deep Ocean Blue (Elegant & Professional)
        primary: {
          DEFAULT: "#1E3A5F",
          50: "#E8EDF3",
          100: "#D1DBE7",
          200: "#A3B7CF",
          300: "#7593B7",
          400: "#476F9F",
          500: "#1E3A5F", // Main color - Deep Ocean Blue
          600: "#182E4C",
          700: "#122239",
          800: "#0C1626",
          900: "#060B13",
        },
        // Secondary - Vibrant Teal (Energy & Movement)
        secondary: {
          DEFAULT: "#2A9D8F",
          50: "#E8F5F3",
          100: "#D1EBE7",
          200: "#A3D7CF",
          300: "#75C3B7",
          400: "#47AF9F",
          500: "#2A9D8F", // Vibrant Teal
          600: "#227E72",
          700: "#1A5F56",
          800: "#124039",
          900: "#0A211D",
        },
        // Accent - Warm Coral (Passion & Energy)
        accent: {
          DEFAULT: "#E76F51",
          50: "#FDF3F1",
          100: "#FBE7E3",
          200: "#F7CFC7",
          300: "#F3B7AB",
          400: "#EF9F8F",
          500: "#E76F51", // Warm Coral
          600: "#B95941",
          700: "#8B4331",
          800: "#5D2C20",
          900: "#2E1610",
        },
        // Tertiary - Soft Lavender (Elegance & Grace)
        tertiary: {
          DEFAULT: "#8B7FA8",
          50: "#F5F4F8",
          100: "#EBE9F1",
          200: "#D7D3E3",
          300: "#C3BDD5",
          400: "#AFA7C7",
          500: "#8B7FA8", // Soft Lavender
          600: "#6F6686",
          700: "#534C64",
          800: "#373342",
          900: "#1B1921",
        },
        // Legacy support - map to new colors
        terracotta: "#E76F51", // Maps to accent
        "deep-violet": "#2A9D8F", // Maps to secondary
        "energy-accent": "#E76F51", // Maps to accent
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
        "6xl": "3rem",
      },
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-sora)", "sans-serif"],
        nav: ["var(--font-nav)", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-up": "slideUp 0.8s ease-out",
        "scale-in": "scaleIn 0.5s ease-out",
        "float": "float 3s ease-in-out infinite",
        "dance-wiggle": "danceWiggle 0.6s ease-in-out",
        "press": "press 0.1s ease-out",
        "success-pop": "successPop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(40px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        danceWiggle: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-3deg)" },
          "75%": { transform: "rotate(3deg)" },
        },
        press: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(0.95)" },
          "100%": { transform: "scale(1)" },
        },
        successPop: {
          "0%": { transform: "scale(0)", opacity: "0" },
          "50%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      boxShadow: {
        "skeu-sm": "0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 4px rgba(0, 0, 0, 0.04)",
        "skeu-md": "0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.06)",
        "skeu-lg": "0 8px 32px rgba(0, 0, 0, 0.1), 0 4px 16px rgba(0, 0, 0, 0.08)",
        "inner-soft": "inset 0 2px 4px rgba(0, 0, 0, 0.05)",
      },
      maxWidth: {
        "8xl": "88rem",   /* 1408px - content cap on large screens */
        "9xl": "96rem",   /* 1536px */
      },
      screens: {
        "3xl": "1920px",
      },
    },
  },
  plugins: [],
};

export default config;

