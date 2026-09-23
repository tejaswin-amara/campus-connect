/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(var(--brand-primary) / <alpha-value>)',
          hover: '#4f46e5',
          foreground: '#ffffff',
        },
        card: {
          DEFAULT: 'hsl(var(--surface-raised) / <alpha-value>)',
          foreground: 'hsl(var(--text-primary) / <alpha-value>)',
        },
        background: 'hsl(var(--bg-canvas) / <alpha-value>)', // #050508 true black
        surface: {
          base: 'hsl(var(--surface-base) / <alpha-value>)', // #0c0c12 background base
          raised: 'hsl(var(--surface-raised) / <alpha-value>)', // #14141e cards/modals
          overlay: 'hsl(var(--surface-overlay) / <alpha-value>)', // #1c1c2b popovers/drawers
        },
        border: {
          subtle: 'hsl(var(--border-subtle) / <alpha-value>)', // #20202e
          strong: 'hsl(var(--border-strong) / <alpha-value>)', // #303046
        },
        brand: {
          primary: 'hsl(var(--brand-primary) / <alpha-value>)', // Electric Cyan #00f0ff
          accent: 'hsl(var(--brand-accent) / <alpha-value>)', // Neon Indigo #6366f1
          glow: 'hsl(var(--brand-glow) / <alpha-value>)',
        },
        status: {
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#f43f5e',
          info: '#0ea5e9',
        },
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'JetBrains Mono', 'monospace'],
      },
      backdropBlur: {
        glass: '16px',
        heavy: '24px',
      },
      boxShadow: {
        glow: '0 0 24px -4px rgba(0, 240, 255, 0.25)',
        'glow-cyan': '0 0 24px -4px rgba(0, 240, 255, 0.25)',
        'glow-indigo': '0 0 24px -4px rgba(99, 102, 241, 0.25)',
      },
    },
  },
  plugins: [],
};
