import { and, desc, eq, gte, inArray, isNotNull, isNull, or } from 'drizzle-orm'
import { dispositivos, ruas, vagas } from '../db/schema'
import { diaDaSemanaAtual, faixaDeTrintaMinutosAtual, horaLocal } from '../../shared/utils/horario'
import type { RotinaNaRegiao, Vaga } from '../../shared/types/vaga'

const UM_DIA_EM_MS = 24 * 60 * 60 * 1000
const SEMANAS_DA_ROTINA = 4

export function vagaDoDono(dispositivoId: string) {
  const pessoaDoAparelho = useDb().select({ pessoaId: dispositivos.pessoaId }).from(dispositivos).where(eq(dispositivos.id, dispositivoId))
  const aparelhosDaPessoa = useDb()
    .select({ id: dispositivos.id })
    .from(dispositivos)
    .where(or(eq(dispositivos.id, dispositivoId), inArray(dispositivos.pessoaId, pessoaDoAparelho)))
  return inArray(vagas.dispositivoId, aparelhosDaPessoa)
}

export async function listarVagas(dispositivoId: string, filtro: 'ativa' | 'encerradas' | 'todas', vagaId?: string): Promise<Vaga[]> {
  const linhas = await useDb()
    .select({ vaga: vagas, nomeDaRua: ruas.nome, trajeto: ruas.trajeto })
    .from(vagas)
    .innerJoin(ruas, eq(ruas.id, vagas.ruaId))
    .where(and(vagaDoDono(dispositivoId), condicaoDoFiltro(filtro), vagaId ? eq(vagas.id, vagaId) : undefined))
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
    .where(and(vagaDoDono(dispositivoId), gte(vagas.chegada, desde), isNotNull(vagas.saida)))
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
