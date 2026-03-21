/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#080d14',
        surface: '#0d1520',
        'surface-2': '#13161e',
        'mission-header': '#c47a1a',
        amber: {
          DEFAULT: '#e8a045',
          dark: '#c47a1a',
        },
        teal: {
          DEFAULT: '#4ab8b0',
        },
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', 'monospace'],
        serif: ['"Lora"', 'serif'],
      },
    },
  },
  plugins: [],
}

