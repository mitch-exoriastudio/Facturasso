/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primaire: {
          DEFAULT: '#16a9bd',
          fonce:   '#0f8294',
          clair:   '#d4f1f5',
        },
      },
    },
  },
  plugins: [],
};
