import { defineConfig, devices } from '@playwright/test'

const PORTA = 3100
const canal = process.env.PLAYWRIGHT_CANAL ? { channel: process.env.PLAYWRIGHT_CANAL } : {}

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  workers: 2,
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORTA}`,
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    trace: 'retain-on-failure',
    ...canal,
  },
  projects: [
    { name: 'celular', use: { ...devices['Desktop Chrome'], viewport: { width: 393, height: 852 }, hasTouch: true } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1024 } } },
  ],
  webServer: {
    command: 'node .output/server/index.mjs',
    port: PORTA,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      PORT: String(PORTA),
      NUXT_DATABASE_URL: 'pglite://memoria',
      NUXT_SESSION_PASSWORD: 'senha-de-teste-com-mais-de-32-caracteres',
    },
  },
})
