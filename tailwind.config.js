/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Light Mode Color Scheme
        'bg-primary': '#f9fafb',      // Page background (gray-50)
        'bg-secondary': '#f3f4f6',     // Card backgrounds, hover states (gray-100)
        'bg-tertiary': '#e5e7eb',      // Borders, dividers (gray-200)
        'border-line': '#e5e7eb',      // Border Line (gray-200)
        'text-primary': '#111827',     // Headings, primary buttons (gray-900)
        'text-secondary': '#6b7280',   // Secondary text (gray-500)
        'text-disabled': '#9ca3af',    // Disabled Text (gray-400)
        'accent-primary': '#06b6d4',   // Primary accent, focus states (cyan-500)
        'accent-secondary': '#14b8a6', // Secondary accent (teal-500)
        'success': '#10b981',           // Success
        'warning': '#f59e0b',         // Warning
        'error': '#ef4444',           // Error
        
        // Shadcn/ui mappings
        border: '#e5e7eb',              // gray-200
        input: '#ffffff',               // white
        ring: '#06b6d4',                // cyan-500
        background: '#f9fafb',          // gray-50
        foreground: '#111827',         // gray-900
        primary: {
          DEFAULT: '#06b6d4',           // cyan-500
          foreground: '#ffffff',         // white
        },
        secondary: {
          DEFAULT: '#14b8a6',           // teal-500
          foreground: '#ffffff',        // white
        },
        destructive: {
          DEFAULT: '#ef4444',           // error
          foreground: '#ffffff',        // white
        },
        muted: {
          DEFAULT: '#f3f4f6',           // gray-100
          foreground: '#6b7280',        // gray-500
        },
        accent: {
          DEFAULT: '#06b6d4',           // cyan-500
          foreground: '#ffffff',        // white
        },
        popover: {
          DEFAULT: '#ffffff',           // white
          foreground: '#111827',        // gray-900
        },
        card: {
          DEFAULT: '#ffffff',           // white
          foreground: '#111827',        // gray-900
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}











