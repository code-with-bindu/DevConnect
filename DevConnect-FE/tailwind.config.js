// tailwind.config.js
import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Modern DevConnect color palette inspired by Tinder
        primary: {
          50: "#fef7f2",
          100: "#fce4d6",
          200: "#f9c9ad",
          300: "#f7aa7f",
          400: "#f48754",
          500: "#FF6B6B", // Main brand color (vibrant red)
          600: "#e85555",
          700: "#d13e3e",
          800: "#b92828",
          900: "#8f1f1f",
        },
        secondary: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22C55E", // Success green
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#145231",
        },
        accent: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0EA5E9", // Light blue accent
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c3d66",
        },
        neutral: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Poppins", "system-ui", "sans-serif"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
      },
      spacing: {
        xs: "0.25rem",
        sm: "0.5rem",
        md: "1rem",
        lg: "1.5rem",
        xl: "2rem",
        "2xl": "2.5rem",
        "3xl": "3rem",
        "4xl": "4rem",
      },
      borderRadius: {
        xs: "0.25rem",
        sm: "0.375rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
        full: "9999px",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        sm: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
        xl: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
        "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
        "3xl": "0 35px 60px -15px rgb(0 0 0 / 0.3)",
        soft: "0 8px 16px rgba(0, 0, 0, 0.06)",
        card: "0 2px 8px rgba(0, 0, 0, 0.08)",
        hover: "0 12px 24px rgba(0, 0, 0, 0.15)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "scale-up": "scaleUp 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "bounce-light": "bounceLight 2s infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleUp: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        bounceLight: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: ".5" },
        },
      },
      transitionDuration: {
        fast: "150ms",
        normal: "300ms",
        slow: "500ms",
      },
    },
  },
  darkMode: "class",
  plugins: [daisyui],
  daisyui: {
    themes: ["light"],
  },
};
