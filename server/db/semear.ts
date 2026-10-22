import type { Banco } from './conexao'
import { areas, avaliacoes, codigosDeVerificacao, dispositivos, estimativasDaPesquisa, medicoes, pessoas, relatos, resultadosDaPesquisa, ruas, sugestoesDeRua, vagas } from './schema'
import { gerarMedicoesDeDemonstracao } from './dados/medicoes'
import { calcularEstimativasDaPesquisa } from './estimativas'
import { chancesDeDemonstracao, VAGAS_DE_DEMONSTRACAO } from './dados/demonstracao'
import { resultadosDoSeed } from './dados/pesquisa'
import { referenciaEsamc, ruasDoSeed, type RuaDoSeed } from './dados/ruas'

export interface OpcoesDoSeed {
  demonstracao?: boolean
  hoje?: Date
}

export async function semear(banco: Banco, { demonstracao = false, hoje = new Date() }: OpcoesDoSeed = {}): Promise<void> {
  await limpar(banco)
  const areaId = await criarAreas(banco)
  for (const rua of ruasDoSeed) {
    const ruaId = await criarRua(banco, areaId, rua, demonstracao ? VAGAS_DE_DEMONSTRACAO : null)
    if (demonstracao) await criarMedicoesDeDemonstracao(banco, ruaId, rua.nome, hoje)
  }
  await criarResultadosDaPesquisa(banco)
  await calcularEstimativasDaPesquisa(banco)
}

async function limpar(banco: Banco): Promise<void> {
  await banco.delete(relatos)
  await banco.delete(codigosDeVerificacao)
  await banco.delete(vagas)
  await banco.delete(dispositivos)
  await banco.delete(pessoas)
  await banco.delete(estimativasDaPesquisa)
  await banco.delete(medicoes)
  await banco.delete(ruas)
  await banco.delete(areas)
  await banco.delete(avaliacoes)
  await banco.delete(sugestoesDeRua)
  await banco.delete(resultadosDaPesquisa)
}

async function criarAreas(banco: Banco): Promise<string> {
  const [martins] = await banco.insert(areas).values([
    { nome: 'Martins', cidade: 'Uberlândia', nomeDaReferencia: 'ESAMC', referencia: { type: 'Point', coordinates: referenciaEsamc } },
    { nome: 'Centro', cidade: 'Uberlândia', nomeDaReferencia: 'Praça Tubal Vilela', referencia: { type: 'Point', coordinates: [-48.2772, -18.9186] } },
    { nome: 'Fundinho', cidade: 'Uberlândia', nomeDaReferencia: 'Praça Clarimundo Carneiro', referencia: { type: 'Point', coordinates: [-48.2744, -18.9227] } },
  ]).returning({ id: areas.id })
  if (!martins) throw new Error('Não foi possível criar a área Martins.')
  return martins.id
}

async function criarRua(banco: Banco, areaId: string, rua: RuaDoSeed, capacidade: number | null): Promise<string> {
  const [criada] = await banco.insert(ruas).values({
    areaId,
    nome: rua.nome,
    trajeto: { type: 'LineString', coordinates: rua.trajeto },
    destino: { type: 'Point', coordinates: rua.destino },
    distanciaDaReferenciaM: rua.distanciaM,
    capacidade,
  }).returning({ id: ruas.id })
  if (!criada) throw new Error(`Não foi possível criar a rua ${rua.nome}.`)
  return criada.id
}

async function criarMedicoesDeDemonstracao(banco: Banco, ruaId: string, nome: string, hoje: Date): Promise<void> {
  const linhas = gerarMedicoesDeDemonstracao(chancesDeDemonstracao[nome] ?? [], hoje)
    .map(medicao => ({ ...medicao, ruaId, fonte: 'campo' as const }))
  if (linhas.length) await banco.insert(medicoes).values(linhas)
}

async function criarResultadosDaPesquisa(banco: Banco): Promise<void> {
  const linhas = resultadosDoSeed.flatMap(resultado =>
    resultado.opcoes.map(([opcao, percentual], ordem) => ({
      pergunta: resultado.pergunta,
      grupo: resultado.grupo,
      base: resultado.base,
      ordem,
      opcao,
      percentual,
    })),
  )
  await banco.insert(resultadosDaPesquisa).values(linhas)
}
