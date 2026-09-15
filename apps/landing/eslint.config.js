import nextConfig from "eslint-config-next";

export default [
  {
    ignores: [".next/**", "dist/**", "node_modules/**"],
  },
  ...nextConfig,
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    rules: {
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/incompatible-library": "off",
    },
  },
];
