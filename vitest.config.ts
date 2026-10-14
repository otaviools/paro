import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

const pastaShared = fileURLToPath(new URL('./shared', import.meta.url))

export default defineConfig({
  test: {
    projects: [
      {
        resolve: { alias: { '#shared': pastaShared } },
        test: { name: 'unidade', include: ['tests/unit/**/*.test.ts'], environment: 'node' },
      },
      await defineVitestProject({
        test: { name: 'componentes', include: ['tests/nuxt/**/*.test.ts'], environment: 'nuxt' },
      }),
      {
        test: {
          name: 'api',
          include: ['tests/api/**/*.test.ts'],
          environment: 'node',
          testTimeout: 60_000,
          hookTimeout: 600_000,
        },
      },
    ],
  },
})
