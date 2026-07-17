import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      colors: {
        ink: '#12131A',
        inksoft: '#4B4E5B',
        brand: '#4338CA',
        branddeep: '#2E278F',
        brandtint: '#ECEBFC',
        badge: '#F5A524',
        active: '#17A34A',
        line: '#DADCE6',
        bg: '#F1F2F6',
      },
    },
  },
  plugins: [],
};
export default config;
