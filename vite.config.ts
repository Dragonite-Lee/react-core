import { defineConfig } from "vite";
import babel from "vite-plugin-babel";
import path from "path";

export default defineConfig({
  plugins: [
    babel({
      filter: /\.[jt]sx$/, // .ts, .tsx, .js, .jsx 대상
      babelConfig: {
        presets: ["@babel/preset-typescript"],
        plugins: [
          [
            "@babel/plugin-transform-react-jsx",
            {
              runtime: "automatic",
              //   pragma: 'createElement',
              development: false,
              importSource: "custom-jsx",
            },
          ],
        ],
      },
    }),
  ],
  build: {
    minify: true,
    sourcemap: true,
  },
  resolve: {
    alias: {
      "custom-jsx": path.resolve(__dirname, "src/custom-jsx"),
    },
  },
});
