import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Midnight Manhattan Palette
        void: {
          DEFAULT: '#050505',
          50: '#0a0a0f',
          100: '#0d0d14',
          200: '#12121a',
          300: '#1a1a25',
          400: '#252533',
        },
        midnight: {
          DEFAULT: '#0a0a14',
          600: '#1a1a28',
          700: '#141420',
          800: '#0d0d18',
          900: '#080810',
        },
        electric: {
          DEFAULT: '#00D4FF',
          50: '#E5FAFF',
          100: '#B3F0FF',
          200: '#80E6FF',
          300: '#4DDBFF',
          400: '#1AD1FF',
          500: '#00D4FF',
          600: '#00A8CC',
          700: '#007D99',
          800: '#005266',
          900: '#002633',
        },
        gold: {
          DEFAULT: '#FFD700',
          50: '#FFFEF0',
          100: '#FFF9CC',
          200: '#FFF099',
          300: '#FFE766',
          400: '#FFDE33',
          500: '#FFD700',
          600: '#CCAC00',
          700: '#998100',
          800: '#665600',
          900: '#332B00',
        },
        glass: {
          white: 'rgba(255, 255, 255, 0.05)',
          border: 'rgba(255, 255, 255, 0.1)',
          hover: 'rgba(255, 255, 255, 0.08)',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(var(--tw-gradient-stops))',
        'gradient-manhattan': 'linear-gradient(180deg, #050505 0%, #0a0a14 50%, #050510 100%)',
        'gradient-glow': 'linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(255, 215, 0, 0.15) 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 212, 255, 0.10)',
        'glass-hover': '0 8px 32px 0 rgba(0, 212, 255, 0.20)',
        'glass-gold': '0 8px 32px 0 rgba(255, 215, 0, 0.15)',
        'glow-electric': '0 0 60px rgba(0, 212, 255, 0.4)',
        'glow-gold': '0 0 60px rgba(255, 215, 0, 0.3)',
        'inner-glow': 'inset 0 0 60px rgba(0, 212, 255, 0.05)',
      },
      backdropBlur: {
        xs: '2px',
        '2xl': '40px',
        '3xl': '64px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'float-slower': 'float 12s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'gradient-x': 'gradient-x 15s ease infinite',
        'gradient-y': 'gradient-y 15s ease infinite',
        'circuit': 'circuit 2s linear infinite',
        'scan-line': 'scan-line 8s linear infinite',
        'skyline': 'skyline 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%': { opacity: '0.7', filter: 'brightness(1.2)' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'gradient-y': {
          '0%, 100%': { backgroundPosition: '50% 0%' },
          '50%': { backgroundPosition: '50% 100%' },
        },
        circuit: {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        skyline: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
