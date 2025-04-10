import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), svgr(), tsconfigPaths()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      // Ensure we're using the same React instance
      'react': require.resolve('react'),
      'react-dom': require.resolve('react-dom')
    }
  },
  optimizeDeps: {
    include: ['pdf-annotator-react']
  }
}); 