/** @type {import('tailwindcss').Config} */

// ── MYDS primitive palette ──────────────────────────────────────────────
// Sourced from the Malaysia Government Design System (govtechmy/myds).
// https://design.digital.gov.my
const myds = {
  gray: {
    50: '#FAFAFA', 100: '#F4F4F5', 200: '#E4E4E7', 300: '#D4D4D8',
    400: '#A1A1AA', 500: '#6B6B74', 600: '#52525B', 700: '#3F3F46',
    800: '#27272A', 850: '#1D1D21', 900: '#18181B', 930: '#161619',
    950: '#09090B',
  },
  primary: {
    50: '#EFF6FF', 100: '#DBEAFE', 200: '#C2D5FF', 300: '#96B7FF',
    400: '#6394FF', 500: '#3A75F6', 600: '#2563EB', 700: '#1D4ED8',
    800: '#1E40AF', 900: '#1E3A8A', 950: '#172554',
  },
  danger: {
    50: '#FEF2F2', 100: '#FEE2E2', 200: '#FECACA', 300: '#FCA5A5',
    400: '#F87171', 500: '#EF4444', 600: '#DC2626', 700: '#B91C1C',
    800: '#991B1B', 900: '#7F1D1D', 950: '#450A0A',
  },
  success: {
    50: '#F0FDF4', 100: '#DCFCE7', 200: '#BBF7D0', 300: '#83DAA3',
    400: '#4ADE80', 500: '#22C55E', 600: '#16A34A', 700: '#15803D',
    800: '#166534', 900: '#14532D', 950: '#052E16',
  },
  warning: {
    50: '#FEFCE8', 100: '#FEF9C3', 200: '#FEF08A', 300: '#FDE047',
    400: '#FACC15', 500: '#EAB308', 600: '#CA8A04', 700: '#A16207',
    800: '#854D0E', 900: '#713F12', 950: '#422006',
  },
};

export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // MYDS spacing tokens (used for the 18px responsive edge margin).
      spacing: {
        2.5: '0.625rem',
        4.5: '1.125rem',
        10.5: '2.625rem',
      },
      // Remap the colour names already used across the app onto the MYDS
      // palette, so existing markup adopts the MYDS look without rewrites.
      colors: {
        slate: myds.gray,
        gray: myds.gray,
        zinc: myds.gray,
        neutral: myds.gray,
        blue: myds.primary,
        indigo: myds.primary,
        sky: myds.primary,
        emerald: myds.success,
        green: myds.success,
        teal: myds.success,
        rose: myds.danger,
        red: myds.danger,
        amber: myds.warning,
        yellow: myds.warning,
        orange: myds.warning,
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"Roboto Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'heading-xl': ['3.75rem', { lineHeight: '4.5rem' }],
        'heading-lg': ['3rem', { lineHeight: '3.75rem' }],
        'heading-md': ['2.25rem', { lineHeight: '2.75rem' }],
        'heading-sm': ['1.875rem', { lineHeight: '2.375rem' }],
        'heading-xs': ['1.5rem', { lineHeight: '2rem' }],
        'heading-2xs': ['1.25rem', { lineHeight: '1.75rem' }],
        'body-xl': ['1.25rem', { lineHeight: '1.875rem' }],
        'body-lg': ['1.125rem', { lineHeight: '1.625rem' }],
        'body-md': ['1rem', { lineHeight: '1.5rem' }],
        'body-sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'body-xs': ['0.75rem', { lineHeight: '1.125rem' }],
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        DEFAULT: '8px',
        md: '8px',
        lg: '12px',
        xl: '14px',
        '2xl': '16px',
        full: '9999px',
      },
      boxShadow: {
        button: '0px 1px 3px 0px rgba(0, 0, 0, 0.07)',
        card: '0px 2px 6px 0px rgba(0, 0, 0, 0.05), 0px 6px 24px 0px rgba(0, 0, 0, 0.05)',
        'context-menu': '0px 2px 6px 0px rgba(0, 0, 0, 0.05), 0px 12px 50px 0px rgba(0, 0, 0, 0.10)',
      },
    },
  },
  plugins: [],
}
