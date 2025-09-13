/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // Adjust this based on your project structure
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    // Add any other directories where you use Tailwind classes
  ],
  theme: {
    extend: {
       colors: {
        primary: {
          DEFAULT: 'var(--primary-color)',
          light: 'var(--primary-light)',
          dark: 'var(--primary-dark)',

        },
        secondary: {
          DEFAULT: 'var(--secondary-color)',
          light: 'var(--secondary-light)',
          dark: 'var(--secondary-dark)',
        },
        tertiary: {
          DEFAULT: 'var(--tertiary-color)',
          light: 'var(--tertiary-light)',
          dark: 'var(--tertiary-dark)',
        },
      },
    },
  },
  plugins: [],
};