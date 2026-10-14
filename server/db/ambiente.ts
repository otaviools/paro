import { existsSync } from 'node:fs'

export function carregarAmbiente(): string {
  if (existsSync('.env')) process.loadEnvFile('.env')
  return process.env.NUXT_DATABASE_URL ?? ''
}
