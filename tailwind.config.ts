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
        // Re-Sound Brand Colors
        'brand-blue': {
          DEFAULT: '#197FC7',
          light: '#4DA3DB',
          dark: '#1565a0',
          pale: '#E8F4FC',
        },
        'deep-blue': '#0A1628',
        'charcoal': '#1a1a2e',
        'warm-white': '#FDFEFF',
        'cream': '#F8F9FA',
        'sand': '#E5E5E5',
        'accent': '#2DBDA8',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'hero': ['4rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'hero-mobile': ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
      },
      spacing: {
        'section': '6rem',
        'section-mobile': '3rem',
      },
      borderRadius: {
        'panel': '20px',
        'button': '50px',
      },
      boxShadow: {
        'card': '0 10px 40px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 20px 50px rgba(0, 0, 0, 0.12)',
        'button': '0 10px 30px rgba(25, 127, 199, 0.3)',
        'nav': '0 2px 40px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease forwards',
        'float': 'float 6s ease-in-out infinite',
        'loop-rotate': 'loopRotate 20s linear infinite',
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        loopRotate: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },
      transitionDuration: {
        DEFAULT: '300ms',
      },
    },
  },
  plugins: [],
};

export default config;
