/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        zippy: {
          green: '#39e639',
          'green-light': '#5ff05f',
          'green-dark': '#2cbd2c',
          'green-dim': 'rgba(57,230,57,0.15)',
          bg: '#050a12',
          surface: '#0d1420',
          'surface-2': '#111827',
          border: 'rgba(57,230,57,0.15)',
        },
      },
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 24px rgba(57,230,57,0.4), 0 4px 24px rgba(0,0,0,0.5)',
        'neon-sm': '0 0 12px rgba(57,230,57,0.3)',
        'neon-lg': '0 0 40px rgba(57,230,57,0.5), 0 8px 40px rgba(0,0,0,0.6)',
        dark: '0 4px 24px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
};
