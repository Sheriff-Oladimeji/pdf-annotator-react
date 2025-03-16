import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import terser from '@rollup/plugin-terser';
import babel from '@rollup/plugin-babel';
import postcss from 'rollup-plugin-postcss';
import { readFileSync } from 'fs';

// Read package.json as a regular JSON file
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
    },
    {
      file: pkg.module,
      format: 'es',
      exports: 'named',
      sourcemap: true,
    },
  ],
  plugins: [
    resolve(),
    commonjs(),
    postcss({
      config: {
        path: './postcss.config.mjs',
      },
      extensions: ['.css'],
      minimize: true,
      inject: {
        insertAt: 'top',
      },
      modules: false,
      extract: false,
    }),
    typescript({
      tsconfig: './tsconfig.json',
      useTsconfigDeclarationDir: true,
    }),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: [
        '@babel/preset-env',
        '@babel/preset-react',
        '@babel/preset-typescript',
      ],
    }),
    terser(),
  ],
  external: ['react', 'react-dom', 'pdfjs-dist', 'pdf-lib'],
};