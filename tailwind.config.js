/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // ✅ 다크모드 class 기반 활성화
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
