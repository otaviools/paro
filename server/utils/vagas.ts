import { and, desc, eq, gte, isNotNull, isNull } from 'drizzle-orm'
import { ruas, vagas } from '../db/schema'
import { diaDaSemanaAtual, faixaDeTrintaMinutosAtual, horaLocal } from '../../shared/utils/horario'
import type { RotinaNaRegiao, Vaga } from '../../shared/types/vaga'

const UM_DIA_EM_MS = 24 * 60 * 60 * 1000
const SEMANAS_DA_ROTINA = 4

export async function listarVagas(dispositivoId: string, filtro: 'ativa' | 'encerradas' | 'todas', vagaId?: string): Promise<Vaga[]> {
  const linhas = await useDb()
    .select({ vaga: vagas, nomeDaRua: ruas.nome, trajeto: ruas.trajeto })
    .from(vagas)
    .innerJoin(ruas, eq(ruas.id, vagas.ruaId))
    .where(and(eq(vagas.dispositivoId, dispositivoId), condicaoDoFiltro(filtro), vagaId ? eq(vagas.id, vagaId) : undefined))
    .orderBy(desc(vagas.chegada))
  return Promise.all(linhas.map(montarVaga))
}

export async function buscarVaga(dispositivoId: string, vagaId: string): Promise<Vaga> {
  const [vaga] = await listarVagas(dispositivoId, 'todas', vagaId)
  if (!vaga) throw createError({ statusCode: 404, statusMessage: 'Vaga não encontrada neste aparelho.' })
  return vaga
}

export async function rotinaNaRegiao(dispositivoId: string): Promise<RotinaNaRegiao> {
  const desde = new Date(Date.now() - SEMANAS_DA_ROTINA * 7 * UM_DIA_EM_MS)
  const linhas = await useDb()
    .select({ chegada: vagas.chegada, saida: vagas.saida })
    .from(vagas)
    .where(and(eq(vagas.dispositivoId, dispositivoId), gte(vagas.chegada, desde), isNotNull(vagas.saida)))
  const dias = new Set(linhas.map(linha => linha.chegada.toISOString().slice(0, 10)))
  return {
    chegada: horarioMedio(linhas.map(linha => linha.chegada)),
    saida: horarioMedio(linhas.flatMap(linha => (linha.saida ? [linha.saida] : []))),
    diasPorSemana: Math.round(dias.size / SEMANAS_DA_ROTINA),
  }
}

function condicaoDoFiltro(filtro: 'ativa' | 'encerradas' | 'todas') {
  if (filtro === 'ativa') return isNull(vagas.saida)
  if (filtro === 'encerradas') return isNotNull(vagas.saida)
  return undefined
}

type LinhaDeVaga = { vaga: typeof vagas.$inferSelect, nomeDaRua: string, trajeto: Vaga['trajeto'] }

async function montarVaga({ vaga, nomeDaRua, trajeto }: LinhaDeVaga): Promise<Vaga> {
  const previsao = await previsaoDaRua(vaga.ruaId, diaDaSemanaAtual(vaga.chegada), faixaDeTrintaMinutosAtual(vaga.chegada))
  return {
    id: vaga.id,
    ruaId: vaga.ruaId,
    nomeDaRua,
    trajeto,
    chegada: vaga.chegada.toISOString(),
    saidaPrevista: vaga.saidaPrevista?.toISOString() ?? null,
    saida: vaga.saida?.toISOString() ?? null,
    previsaoAjudou: vaga.previsaoAjudou,
    avisarAoSair: vaga.avisarAoSair,
    estadoNaChegada: previsao?.estado ?? 'sem_dado',
    chanceNaChegada: previsao?.chance ?? null,
  }
}

function horarioMedio(datas: Date[]): string | null {
  if (datas.length === 0) return null
  const minutos = datas.map((data) => {
    const [hora = 0, minuto = 0] = horaLocal(data).split(':').map(Number)
    return hora * 60 + minuto
  })
  const media = Math.round(minutos.reduce((soma, valor) => soma + valor, 0) / minutos.length)
  return `${String(Math.floor(media / 60)).padStart(2, '0')}:${String(media % 60).padStart(2, '0')}`
}
