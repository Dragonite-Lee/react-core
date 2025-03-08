import { defineConfig } from 'vite';
import babel from 'vite-plugin-babel';
import path from 'path';

export default defineConfig({
  plugins: [
    babel({
      filter: /\.[jt]sx$/, // .ts, .tsx, .js, .jsx 대상
      babelConfig: {
        presets: ['@babel/preset-typescript'],
        plugins: [
          [
            '@babel/plugin-transform-react-jsx',
            {
              runtime: 'classic',
              pragma: 'createElement',
            },
          ],
        ],
      },
    }),
    {
      name: 'inject-createElement',
      enforce: 'pre',
      transform(code, id) {
        if (id.endsWith('.tsx') || id.endsWith('.jsx')) {
          return {
            code: `import createElement from './createElement';\n${code}`,
            map: null,
          };
        }
      },
    },
  ],
  build: {
    minify: false,
    rollupOptions: {
      input: 'src/main.ts',
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        manualChunks: undefined,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});