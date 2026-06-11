/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Couleur d'accent reprise de l'application d'origine (cyan / turquoise).
        primaire: {
          DEFAULT: '#16a9bd',
          fonce: '#0f8294',
          clair: '#d4f1f5',
        },
      },
    },
  },
  plugins: [],
};
