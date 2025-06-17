import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [react(), svgr(), tsconfigPaths(), dts()],
  resolve: {
    dedupe: ['react', 'react-dom']
  },
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'PdfAnnotatorReact',
      fileName: 'index',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'pdfjs-dist', 'pdf-lib'],
    },
    outDir: 'dist',
    sourcemap: true,
  },
}); 