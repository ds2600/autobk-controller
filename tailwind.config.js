/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js}",
    "./node_modules/flowbite/**/*.js",
    "./node_modules/flowbite/lib/esm/**/*.js",
    "./node_modules/flowbite/lib/esm/**/*.d.ts",
    "./node_modules/flowbite/lib/cjs/**/*.js",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('flowbite/plugin'),
    require('@tailwindcss/typography'),
  ],
}