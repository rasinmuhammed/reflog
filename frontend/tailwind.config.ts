import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'reflog-black': '#000000',
        'reflog-raisin': '#242424', // Use for dark backgrounds/borders
        'reflog-white': '#FBFAEE', // Use for text
        'reflog-orchid': '#933DC9', // Primary accent
        'reflog-violet': '#53118F', // Secondary/darker accent
        
        'reflog-orchid-dark': '#7d34ad', //  darker orchid
        'reflog-violet-dark': '#420e71', //  darker violet

        // Keep existing variables if needed, or replace them
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
    },
  },
  plugins: [],
}
export default config