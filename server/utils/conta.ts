import { createHmac, randomInt, timingSafeEqual } from 'node:crypto'
import { and, desc, eq, gt } from 'drizzle-orm'
import { codigosDeVerificacao, dispositivos, pessoas } from '../db/schema'
import { TAMANHO_DO_CODIGO } from '../../shared/types/conta'

const TAMANHO_MINIMO_DO_PEPPER = 32
const PEPPER_DE_EXEMPLO = 'SUA_CHAVE_AQUI'
export const MINUTOS_DE_VALIDADE_DO_CODIGO = 10

export function verificacaoDisponivel(): boolean {
  const pepper = useRuntimeConfig().emailPepper
  return pepper.length >= TAMANHO_MINIMO_DO_PEPPER && pepper !== PEPPER_DE_EXEMPLO
}

export function exigirVerificacaoDisponivel(): void {
  if (verificacaoDisponivel()) return
  throw createError({ statusCode: 503, statusMessage: 'Verificação de e-mail desligada. Defina NUXT_EMAIL_PEPPER no .env com 32 caracteres ou mais.' })
}

export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function hashDoEmail(email: string): string {
  return assinar(normalizarEmail(email))
}

export function hashDoCodigo(codigoId: string, codigo: string): string {
  return assinar(`${codigoId}:${codigo}`)
}

export function gerarCodigo(): string {
  return String(randomInt(0, 10 ** TAMANHO_DO_CODIGO)).padStart(TAMANHO_DO_CODIGO, '0')
}

export function codigoConfere(esperado: string, recebido: string): boolean {
  const a = Buffer.from(esperado, 'hex')
  const b = Buffer.from(recebido, 'hex')
  return a.length === b.length && timingSafeEqual(a, b)
}

export function mascararEmail(email: string): string {
  const [usuario = '', dominio = ''] = normalizarEmail(email).split('@')
  return `${usuario.slice(0, 2)}${'*'.repeat(Math.max(0, usuario.length - 2))}@${dominio}`
}

export async function codigoQueConfere(dispositivoId: string, codigo: string) {
  const validos = await useDb()
    .select()
    .from(codigosDeVerificacao)
    .where(and(eq(codigosDeVerificacao.dispositivoId, dispositivoId), gt(codigosDeVerificacao.expiraEm, new Date())))
    .orderBy(desc(codigosDeVerificacao.criadoEm))
  return validos.find(valido => codigoConfere(valido.codigoHash, hashDoCodigo(valido.id, codigo))) ?? null
}

export async function ligarPessoaAoDispositivo(emailHash: string, dispositivoId: string): Promise<void> {
  await useDb().insert(pessoas).values({ emailHash }).onConflictDoNothing({ target: pessoas.emailHash })
  const [pessoa] = await useDb().select({ id: pessoas.id }).from(pessoas).where(eq(pessoas.emailHash, emailHash))
  if (!pessoa) throw createError({ statusCode: 500, statusMessage: 'Não foi possível verificar o e-mail. Tente de novo.' })
  await useDb().update(dispositivos).set({ pessoaId: pessoa.id }).where(eq(dispositivos.id, dispositivoId))
  await useDb().delete(codigosDeVerificacao).where(eq(codigosDeVerificacao.dispositivoId, dispositivoId))
}

export async function pessoaDoDispositivo(dispositivoId: string): Promise<{ id: string, reputacao: number } | null> {
  const [linha] = await useDb()
    .select({ id: pessoas.id, reputacao: pessoas.reputacao })
    .from(dispositivos)
    .innerJoin(pessoas, eq(pessoas.id, dispositivos.pessoaId))
    .where(eq(dispositivos.id, dispositivoId))
  return linha ?? null
}

function assinar(texto: string): string {
  return createHmac('sha256', useRuntimeConfig().emailPepper).update(texto).digest('hex')
}
