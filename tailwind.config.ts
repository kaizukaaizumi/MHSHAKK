import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      colors: {
        'white': '#ffffff',
        'green-gray': '#202F1D',
        'med-green': '#3B7237',
        'hover-green': '#88AF37',
        'light-green': '#9ac73e',
        'dark-blue': '#2C6191',
        'med-blue': '#50AEC6'
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        tyler: ['"Raleway"', 'sans-serif']
      },
    },
  },
  plugins: [
    require("daisyui"),
  ]
} satisfies Config;