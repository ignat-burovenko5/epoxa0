import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          base: '#0C0C0C',     // Deepest background
          charcoal: '#1A1A1A', // Secondary dark
          bordeaux: '#4A1C20', // Deep rich accent
        },
        museum: {
          light: '#F7F5F0',    // Primary light background (Off-white/Pearl)
          warm: '#EBE5DA',     // Secondary light background (Parchment)
          stone: '#C4B7A6',    // Tertiary neutral
        },
        accent: {
          brass: '#A67C52',    // Tarnished brass for borders/subtle CTAs
          gold: '#B89A70',     // Antique gold for highlights (dark backgrounds)
          'gold-on-light': '#6B5340',
        }
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'], // Elegant historic
        sans: ['var(--font-inter)', 'Helvetica Neue', 'sans-serif'], // Structural
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '32': '8rem',    // Aggressive whitespace for sections
        '40': '10rem',   // Aggressive whitespace for sections
        '48': '12rem',   // Aggressive whitespace for sections
      },
      letterSpacing: {
        widest: '.25em', // Tracked out UI labels
      },
      transitionTimingFunction: {
        'luxury-ease': 'cubic-bezier(0.25, 0.1, 0.25, 1.0)',
      }
    },
  },
  plugins: [],
}
export default config