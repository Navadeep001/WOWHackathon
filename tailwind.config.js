/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // Enable class-based dark mode
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand colors extracted from the logo
        brand: {
          navy:    '#0A1628',   // deep navy — dark backgrounds
          royal:   '#1B4FD8',   // royal blue — primary actions
          cyan:    '#3B9EFF',   // bright cyan — accents / hover states
          light:   '#EEF4FF',   // very light blue — light mode surface
        },
      },
    },
  },
  plugins: [],
};
