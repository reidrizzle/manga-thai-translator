/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        manga: {
          bg: "#0a0d14",
          surface: "#111726",
          card: "#182032",
          border: "#243048",
          primary: "#6366f1",
          primaryHover: "#4f46e5",
          accent: "#ec4899",
          cyan: "#06b6d4",
          gold: "#f59e0b",
        },
      },
      fontFamily: {
        sans: ['var(--font-prompt)', 'var(--font-kanit)', 'var(--font-sarabun)', 'system-ui', 'sans-serif'],
        comic: ['var(--font-prompt)', 'var(--font-mitr)', 'sans-serif'],
        manga: ['var(--font-prompt)', 'sans-serif'],
        thai: ['var(--font-sarabun)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
