/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        deepspace: '#0A0E14',
        surface: '#0E1319',
        border: '#1C2128',
        cyan: '#00F5FF',
        mint: '#00D9A3',
        amber: '#FFB800',
        coral: '#FF4757',
        text: {
          primary: '#E6EDF3',
          secondary: '#8B949E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display': ['64px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'h1': ['48px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'h2': ['36px', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'h3': ['24px', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
      },
      maxWidth: {
        'container': '1280px',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'count-up': 'count-up 800ms ease-out',
      },
    },
  },
  plugins: [],
}
