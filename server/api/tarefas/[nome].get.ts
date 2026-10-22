import { createHash, timingSafeEqual } from 'node:crypto'
import { z } from 'zod'

const tarefas = {
  'historico-limpar': 'historico:limpar',
  'relatos-anonimizar': 'relatos:anonimizar',
} as const

const parametros = z.object({ nome: z.enum(Object.keys(tarefas) as [keyof typeof tarefas]) })

export default defineEventHandler(async (event) => {
  exigirSegredoDoCron(getHeader(event, 'authorization'))
  const { nome } = await getValidatedRouterParams(event, validarCom(parametros))
  const { result } = await runTask(tarefas[nome])
  return { tarefa: tarefas[nome], resultado: result }
})

function exigirSegredoDoCron(cabecalho: string | undefined): void {
  const segredo = process.env.CRON_SECRET ?? ''
  if (segredo.length >= 16 && cabecalho && iguais(cabecalho, `Bearer ${segredo}`)) return
  throw createError({ statusCode: 401, statusMessage: 'Tarefa liberada só para o cron.' })
}

function iguais(a: string, b: string): boolean {
  const resumo = (texto: string) => createHash('sha256').update(texto).digest()
  return timingSafeEqual(resumo(a), resumo(b))
}
