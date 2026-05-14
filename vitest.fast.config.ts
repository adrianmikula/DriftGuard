import { defineConfig } from 'vitest/config';
import path from 'path';

// Fast test loop configuration for AI agents
// These tests should complete in <10s and provide quick feedback
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      // Core engine unit tests (fast, mocked dependencies)
      'packages/core-engine/src/__tests__/rules/**/*.test.ts',
      'packages/core-engine/src/__tests__/config/**/*.test.ts',
      // Language package unit tests (fast, stub implementations)
      'packages/language-python/src/__tests__/**/*.test.ts',
      'packages/language-typescript/src/__tests__/rules/**/*.test.ts',
      'packages/language-typescript/src/__tests__/analyzer/**/*.test.ts',
    ],
    exclude: [
      'node_modules/',
      'packages/*/dist/',
      'packages/*/node_modules/',
      // Exclude integration tests and slow tests
      'packages/core-engine/src/__tests__/graph/**/*.test.ts',
      'packages/core-engine/src/__tests__/scanner/**/*.test.ts',
      'packages/vscode-extension/src/__tests__/**/*.test.ts',
    ],
    testTimeout: 10000, // 10s timeout per test
  },
  resolve: {
    alias: {
      '@driftguard/core-engine': path.resolve(__dirname, 'packages/core-engine/src'),
      '@driftguard/language-typescript': path.resolve(__dirname, 'packages/language-typescript/src'),
      '@driftguard/language-python': path.resolve(__dirname, 'packages/language-python/src'),
    },
  },
});
