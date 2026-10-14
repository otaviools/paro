import type { Banco } from './conexao'
import { areas, avaliacoes, dispositivos, medicoes, resultadosDaPesquisa, ruas, sugestoesDeRua, vagas } from './schema'
import { gerarMedicoes } from './dados/medicoes'
import { resultadosDoSeed } from './dados/pesquisa'
import { referenciaEsamc, ruasDoSeed, type RuaDoSeed } from './dados/ruas'

export async function semear(banco: Banco, hoje = new Date()): Promise<void> {
  await limpar(banco)
  const areaId = await criarAreas(banco)
  for (const rua of ruasDoSeed) await criarRua(banco, areaId, rua, hoje)
  await criarResultadosDaPesquisa(banco)
}

async function limpar(banco: Banco): Promise<void> {
  await banco.delete(vagas)
  await banco.delete(dispositivos)
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

async function criarRua(banco: Banco, areaId: string, rua: RuaDoSeed, hoje: Date): Promise<void> {
  const [criada] = await banco.insert(ruas).values({
    areaId,
    nome: rua.nome,
    trajeto: { type: 'LineString', coordinates: rua.trajeto },
    distanciaDaReferenciaM: rua.distanciaM,
  }).returning({ id: ruas.id })
  if (!criada) throw new Error(`Não foi possível criar a rua ${rua.nome}.`)
  const linhas = gerarMedicoes(rua, hoje).map(medicao => ({ ...medicao, ruaId: criada.id, fonte: 'campo' as const }))
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
