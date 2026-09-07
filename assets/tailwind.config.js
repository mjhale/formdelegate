/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}', // Note the addition of the `app` directory.
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',

    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'scale-increase-fast': 'scaleIncrease 0.15s linear 1',
      },
      transitionDuration: {
        fast: '120ms',
        control: '160ms',
        drawer: '220ms',
      },
      transitionTimingFunction: {
        drawer: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      backgroundImage: {
        sidebar:
          'radial-gradient( 150% 66% at -26% 100%, rgba(255, 255, 255, 0.12) 0 34%, transparent 34.5% ), radial-gradient( 130% 62% at 4% 84%, rgba(255, 255, 255, 0.07) 0 39%, transparent 39.5% ), linear-gradient( 155deg, #bf453d 0%, #a33a34 54%, #8d302b 100% )',
        workspace:
          'linear-gradient(90deg, rgba(191, 69, 61, 0.022) 1px, transparent 1px), linear-gradient(rgba(191, 69, 61, 0.018) 1px, transparent 1px)',
        'nav-pattern': `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 1600 500'%3E%3Cg stroke='%23000' stroke-width='66.7' stroke-opacity='0.01' %3E%3Ccircle fill='%23f76e64' cx='0' cy='0' r='1800'/%3E%3Ccircle fill='%23f0695f' cx='0' cy='0' r='1700'/%3E%3Ccircle fill='%23e9645a' cx='0' cy='0' r='1600'/%3E%3Ccircle fill='%23e35f56' cx='0' cy='0' r='1500'/%3E%3Ccircle fill='%23dc5a51' cx='0' cy='0' r='1400'/%3E%3Ccircle fill='%23d5554c' cx='0' cy='0' r='1300'/%3E%3Ccircle fill='%23cf5048' cx='0' cy='0' r='1200'/%3E%3Ccircle fill='%23c84b43' cx='0' cy='0' r='1100'/%3E%3Ccircle fill='%23c1463e' cx='0' cy='0' r='1000'/%3E%3Ccircle fill='%23bb413a' cx='0' cy='0' r='900'/%3E%3Ccircle fill='%23b43c36' cx='0' cy='0' r='800'/%3E%3Ccircle fill='%23ae3731' cx='0' cy='0' r='700'/%3E%3Ccircle fill='%23a7322d' cx='0' cy='0' r='600'/%3E%3Ccircle fill='%23a12d29' cx='0' cy='0' r='500'/%3E%3Ccircle fill='%239a2824' cx='0' cy='0' r='400'/%3E%3Ccircle fill='%23942320' cx='0' cy='0' r='300'/%3E%3Ccircle fill='%238d1e1c' cx='0' cy='0' r='200'/%3E%3Ccircle fill='%23871818' cx='0' cy='0' r='100'/%3E%3C/g%3E%3C/svg%3E")`,
      },
      colors: {
        brand: {
          DEFAULT: '#bf453d',
          deep: '#8d302b',
          dark: '#6f2421',
          soft: '#fff4f1',
        },
        canvas: '#fbf6ea',
        surface: '#fffefb',
        muted: '#6d6f78',
        line: {
          DEFAULT: '#ded8cb',
          strong: '#d7cfc2',
          subtle: '#e5ded3',
        },
        carnation: {
          100: '#f87c73',
          200: '#f76e64',
          400: '#bf453d',
        },
      },
      fontFamily: {
        brand: ['var(--font-lato)', 'Lato', 'sans-serif'],
        // 'sans': ['-apple-system', 'BlinkMacSystemFont', "Segoe UI", 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', "Fira Sans", "Droid Sans", "Helvetica Neue", 'Arial', 'sans-serif', "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"],
        // body: ['var(--font-lato)'],
      },
      keyframes: {
        scaleIncrease: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.25)' },
        },
      },
      boxShadow: {
        button: '0 1px 1px rgba(51, 34, 24, 0.04)',
        'button-hover': '0 3px 10px rgba(61, 38, 26, 0.07)',
        'button-primary': '0 2px 5px rgba(117, 31, 27, 0.18)',
        input: 'inset 0 1px 1px rgba(58, 38, 25, 0.02)',
        'input-focus': '0 0 0 3px rgba(191, 69, 61, 0.13)',
        'nav-active':
          'inset 3px 0 0 #fff0d8, inset 0 1px 0 rgba(255, 255, 255, 0.08)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
