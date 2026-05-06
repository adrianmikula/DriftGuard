import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['packages/*/src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'packages/*/dist/',
        'packages/*/node_modules/',
        '**/*.test.ts',
        '**/*.config.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@driftguard/core-engine': path.resolve(__dirname, 'packages/core-engine/src'),
      '@driftguard/language-typescript': path.resolve(__dirname, 'packages/language-typescript/src'),
      '@driftguard/language-python': path.resolve(__dirname, 'packages/language-python/src'),
    },
  },
});
