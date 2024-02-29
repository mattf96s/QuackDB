export default {
  plugins: {
    "tailwindcss/nesting": {},
    tailwindcss: {},
    autoprefixer: {},
    cssnano:
      import.meta.env?.MODE === "production"
        ? {
          preset: "default",
        }
        : false,
  },
};
