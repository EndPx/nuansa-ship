import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: '#2A9D8F',
          50: '#E6F5F3',
          100: '#CCEBE7',
          200: '#99D7CF',
          300: '#66C3B7',
          400: '#33AF9F',
          500: '#2A9D8F',
          600: '#227E72',
          700: '#195E56',
          800: '#113F39',
          900: '#081F1D',
        },
        navy: {
          DEFAULT: '#0A1628',
          50: '#E8EAF0',
          100: '#C5CADB',
          200: '#8B95B7',
          300: '#516093',
          400: '#2D3B5E',
          500: '#0A1628',
          600: '#081220',
          700: '#060E18',
          800: '#040A10',
          900: '#020508',
        },
        wood: {
          DEFAULT: '#8B6914',
        },
        stone: {
          DEFAULT: '#6B7280',
        },
      },
    },
  },
  plugins: [],
}

export default config
