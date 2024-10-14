/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      lineHeight: {
        "extra-loose": "3.74rem",
        12: "3rem",
      },
    },
  },
  plugins: [],
};
