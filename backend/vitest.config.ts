import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.aws-sam/**'],
  },
})
