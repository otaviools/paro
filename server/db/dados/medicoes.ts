import { VAGAS_DE_DEMONSTRACAO } from './demonstracao'

export interface MedicaoDoSeed {
  diaSemana: number
  faixaInicio: string
  vagasTotais: number
  vagasOcupadas: number
  medidoEm: Date
}

const HORA_INICIAL = 17
const DIAS_MEDIDOS = [1, 2, 3, 4, 5, 6]
const DESVIOS_POR_SEMANA = [-0.05, -0.025, 0.025, 0.05]
const UM_DIA_EM_MS = 24 * 60 * 60 * 1000
const DIFERENCA_DE_SAO_PAULO_EM_HORAS = 3

export function gerarMedicoesDeDemonstracao(chancePorHora: (number | null)[], hoje: Date): MedicaoDoSeed[] {
  return DIAS_MEDIDOS.flatMap(diaSemana =>
    faixasComChance(chancePorHora).flatMap(({ faixa, chance }) =>
      DESVIOS_POR_SEMANA.map((desvio, semana) =>
        montarMedicao(chance + desvio, diaSemana, faixa, dataDaMedicao(hoje, diaSemana, semana, faixa)),
      ),
    ),
  )
}

function faixasComChance(chancePorHora: (number | null)[]): { faixa: string, chance: number }[] {
  return chancePorHora.flatMap((chance, indice) => {
    if (chance === null) return []
    const proxima = chancePorHora[indice + 1] ?? chance
    const hora = String(HORA_INICIAL + indice).padStart(2, '0')
    return [
      { faixa: `${hora}:00`, chance },
      { faixa: `${hora}:30`, chance: arredondarParaVaga((chance + proxima) / 2) },
    ]
  })
}

function montarMedicao(chance: number, diaSemana: number, faixaInicio: string, medidoEm: Date): MedicaoDoSeed {
  const livres = Math.round(VAGAS_DE_DEMONSTRACAO * Math.min(1, Math.max(0, chance)))
  return { diaSemana, faixaInicio, vagasTotais: VAGAS_DE_DEMONSTRACAO, vagasOcupadas: VAGAS_DE_DEMONSTRACAO - livres, medidoEm }
}

function dataDaMedicao(hoje: Date, diaSemana: number, semana: number, faixa: string): Date {
  const [hora = 0, minuto = 0] = faixa.split(':').map(Number)
  const diasAtras = ((hoje.getUTCDay() - diaSemana + 7) % 7 || 7) + semana * 7
  const data = new Date(hoje.getTime() - diasAtras * UM_DIA_EM_MS)
  data.setUTCHours(hora + DIFERENCA_DE_SAO_PAULO_EM_HORAS, minuto, 0, 0)
  return data
}

function arredondarParaVaga(valor: number): number {
  return Math.round(valor * VAGAS_DE_DEMONSTRACAO) / VAGAS_DE_DEMONSTRACAO
}
