/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0F2742',
          dark: '#09192C',
          light: '#1E3A5F',
          50: '#F0F5FA',
          100: '#E1EBF5',
          800: '#0F2742',
          900: '#09192C',
        },
        gold: {
          DEFAULT: '#C79A45',
          hover: '#B38634',
          light: '#F7EEDD',
          50: '#FDFBF7',
          100: '#FBF6EE',
          500: '#C79A45',
          600: '#B38634',
        },
        cream: {
          DEFAULT: '#F8F6F1',
          card: '#FAF8F5',
          dark: '#EFECE6',
        },
        slate: {
          DEFAULT: '#334155',
          muted: '#64748B',
        },
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
