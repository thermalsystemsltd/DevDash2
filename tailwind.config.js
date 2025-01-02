/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      height: {
        '6.5': '1.625rem',
      },
      width: {
        '6.5': '1.625rem',
      },
    },
  },
  plugins: [],
};
