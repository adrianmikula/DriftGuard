"use strict";
const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
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
    }
  }
});
