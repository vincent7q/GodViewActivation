import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1024,
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
