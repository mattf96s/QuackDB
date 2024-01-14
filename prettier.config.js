/** @type {import("prettier").Options} */
export default {
  printWidth: 80,
  singleAttributePerLine: true,

  // tailwind
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindConfig: "./tailwind.config.js",
  tailwindFunctions: ["clsx", "twMerge", "cn"],

  overrides: [
    {
      files: ["**/*.json"],
      options: {
        useTabs: false,
      },
    },
  ],
}