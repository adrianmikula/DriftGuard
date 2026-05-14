import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['packages/*/src/**/*.test.ts'],
    exclude: [
      'node_modules/',
      'packages/*/dist/',
      'packages/*/node_modules/',
      // Temporarily exclude vscode-extension tests due to vscode type compilation issues
      'packages/vscode-extension/src/**/*.test.ts',
      // Temporarily exclude graph client tests due to neo4j-driver mock issues
      'packages/core-engine/src/__tests__/graph/**/*.test.ts',
      // Temporarily exclude scanner tests (integration-style)
      'packages/core-engine/src/__tests__/scanner/**/*.test.ts',
      '**/*.config.ts',
    ],
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
