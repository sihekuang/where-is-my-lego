import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

// Next 16 removed `next lint`; the replacement is the ESLint CLI driven by this
// flat config. eslint-config-next now ships native flat-config arrays, so they
// are spread directly (no FlatCompat bridge needed).
const eslintConfig = [
  {
    ignores: [".next/**", "node_modules/**", ".generated/**", "next-env.d.ts"],
  },
  ...nextCoreWebVitals,
  ...nextTypeScript,
];

export default eslintConfig;
