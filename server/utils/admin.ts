import { createHash, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'

const TAMANHO_MINIMO_DA_SENHA = 12
const SENHA_DE_EXEMPLO = 'SUA_SENHA_DE_ADMIN_AQUI'

export function adminConfigurado(): boolean {
  const senha = useRuntimeConfig().adminPassword
  return senha.length >= TAMANHO_MINIMO_DA_SENHA && senha !== SENHA_DE_EXEMPLO
}

export function senhaDeAdminConfere(tentativa: string): boolean {
  if (!adminConfigurado()) return false
  return timingSafeEqual(resumo(tentativa), resumo(useRuntimeConfig().adminPassword))
}

export async function ehAdmin(event: H3Event): Promise<boolean> {
  const sessao = await getUserSession(event)
  return sessao.secure?.admin === true && adminConfigurado()
}

export async function exigirAdmin(event: H3Event): Promise<void> {
  if (await ehAdmin(event)) return
  throw createError({ statusCode: 401, statusMessage: 'Entre na área de admin para continuar.' })
}

function resumo(texto: string): Buffer {
  return createHash('sha256').update(texto).digest()
}
