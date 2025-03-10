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
              development: true,
              importSource: "custom-jsx",
            },
          ],
        ],
      },
    }),
    // {
    //   name: "inject-createElement",
    //   enforce: "pre",
    //   transform(code, id) {
    //     if (id.endsWith(".tsx") || id.endsWith(".jsx")) {
    //       return {
    //         code: `import createElement from './createElement';\n${code}`,
    //         map: null,
    //       };
    //     }
    //   },
    // },
  ],
  build: {
    minify: false,
    sourcemap: true,
  },
  resolve: {
    alias: {
      "custom-jsx": path.resolve(__dirname, "src/custom-jsx"),
    },
  },
});
