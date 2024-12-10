/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,svelte}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', '"Noto Sans TC"', 'sans-serif'], // 使用 Inter 和 Noto Sans TC
        mono: ['"Roboto Mono"', 'monospace'], // 使用 Roboto Mono
      },
    },
  },
  plugins: [],
};
