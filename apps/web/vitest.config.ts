import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/__tests__/**/*.test.ts'],
    exclude: ['node_modules'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules', 'src/__tests__'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@nality/schema': path.resolve(__dirname, '../../packages/schema'),
    },
  },
});
