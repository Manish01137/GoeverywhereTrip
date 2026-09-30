/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sky: {
          brand:  '#0EA5E9',
          dark:   '#0284C7',
          light:  '#E0F2FE',
          xlight: '#F0F9FF',
        },
        deep: {
          DEFAULT: '#0C4A6E',
          dark:    '#083344',
        },
        accent: '#F97316',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card:  '0 4px 24px rgba(14,165,233,0.10)',
        hover: '0 8px 40px rgba(14,165,233,0.22)',
        glow:  '0 0 0 3px rgba(14,165,233,0.25)',
      },
      borderRadius: {
        card: '1rem',
        pill: '999px',
      },
    },
  },
  plugins: [],
}
