/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#f0f9f4',
          100: '#dcf0e6',
          200: '#bbe1cf',
          300: '#8dcaaf',
          400: '#59ad89',
          500: '#369169',
          600: '#267455',
          700: '#1f5d44',
          800: '#1b4a37',
          900: '#183d2f',
          950: '#0c2219',
        },
        sand: {
          50:  '#faf8f3',
          100: '#f2ede0',
          200: '#e5d9bf',
          300: '#d4c098',
          400: '#c2a472',
          500: '#b48e58',
          600: '#9a754a',
          700: '#7e5d3e',
          800: '#674d37',
          900: '#574130',
        }
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.06)',
        'card-md': '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.07)',
        'card-lg': '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.08)',
      }
    },
  },
  plugins: [],
}
