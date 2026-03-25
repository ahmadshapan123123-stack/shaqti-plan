import type { Config } from 'tailwindcss';
import rtl from 'tailwindcss-rtl';

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Cairo', 'Inter', 'Noto Sans Arabic', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        gray: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          800: '#1e293b',
          900: '#0f172a',
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      fontSize: {
        xs: '11px',
        sm: '13px',
        base: '15px',
        lg: '17px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '30px',
      },
      spacing: {
        '4.5': '18px',
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '18px',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        md: '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.04)',
        lg: '0 10px 25px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.04)',
        xl: '0 20px 40px rgba(0,0,0,0.10), 0 8px 16px rgba(0,0,0,0.06)',
      },
      animation: {
        'loading-bar': 'loadingBar 1.2s ease-in-out forwards',
        'fade-out': 'fadeOut 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out forwards',
        'slide-down': 'slideDown 0.2s ease-out forwards',
        'scale-in': 'scaleIn 0.25s ease-out forwards',
        'scale-out': 'scaleOut 0.2s ease-out forwards',
      },
      keyframes: {
        loadingBar: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-4px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
      },
      transitionDuration: {
        '75': '75ms',
        '150': '150ms',
        '200': '200ms',
        '250': '250ms',
        '300': '300ms',
      },
    },
  },
  plugins: [rtl],
};

export default config;
