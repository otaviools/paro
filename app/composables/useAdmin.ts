import type { AcertoDaPrevisao, Contagem, LinhaDeCalibracao, ResumoDaRua, SessaoDeAdmin } from '#shared/types/admin'

export interface LinhaDaGrade {
  faixa: string
  vagasTotais: number | null
  vagasOcupadas: number | null
}

export function useSessaoDeAdmin() {
  const sessao = useFetch<SessaoDeAdmin>('/api/admin/sessao', { key: 'sessao-admin', default: () => ({ admin: false, configurado: false }) })

  async function entrar(senha: string): Promise<string | null> {
    try {
      await $fetch('/api/admin/entrar', { method: 'POST', body: { senha } })
      await sessao.refresh()
      return null
    }
    catch (erro) {
      return mensagemDoErro(erro)
    }
  }

  async function sair() {
    await $fetch('/api/admin/sair', { method: 'POST' })
    await sessao.refresh()
  }

  return { sessao, entrar, sair }
}

export function useResumoDasContagens() {
  return useFetch<ResumoDaRua[]>('/api/admin/resumo', { key: 'resumo-admin', default: () => [], immediate: false })
}

export function useAcertoDaPrevisao() {
  return useFetch<AcertoDaPrevisao[]>('/api/admin/acerto', { key: 'acerto-admin', default: () => [], immediate: false })
}

export function useCalibracao() {
  return useFetch<LinhaDeCalibracao[]>('/api/admin/calibracao', { key: 'calibracao-admin', default: () => [], immediate: false })
}

export function salvarCapacidade(ruaId: string, capacidade: number | null): Promise<{ capacidade: number | null }> {
  return $fetch<{ capacidade: number | null }>(`/api/admin/ruas/${ruaId}`, { method: 'PATCH', body: { capacidade } })
}

export function carregarContagens(ruaId: string, data: string): Promise<Contagem[]> {
  return $fetch<Contagem[]>('/api/admin/contagens', { query: { ruaId, data } })
}

export function salvarContagens(ruaId: string, data: string, contagens: Contagem[]): Promise<{ gravadas: number }> {
  return $fetch<{ gravadas: number }>('/api/admin/contagens', { method: 'PUT', body: { ruaId, data, contagens } })
}

export function linhasVazias(capacidade: number | null = null): LinhaDaGrade[] {
  return faixasDeContagem.map(faixa => ({ faixa, vagasTotais: capacidade, vagasOcupadas: null }))
}

export function preencherLinhas(contagens: Contagem[], capacidade: number | null = null): LinhaDaGrade[] {
  return linhasVazias(capacidade).map(linha => contagens.find(contagem => contagem.faixa === linha.faixa) ?? linha)
}

export function contagensDasLinhas(linhas: LinhaDaGrade[]): Contagem[] {
  return linhas.flatMap(linha =>
    linha.vagasTotais !== null && linha.vagasOcupadas !== null
      ? [{ faixa: linha.faixa, vagasTotais: linha.vagasTotais, vagasOcupadas: linha.vagasOcupadas }]
      : [],
  )
}

export function problemaDaLinha(linha: LinhaDaGrade): string | null {
  const totais = linha.vagasTotais
  const ocupadas = linha.vagasOcupadas
  if (ocupadas === null) return null
  if (totais === null) return 'Preencha as vagas totais'
  if (totais < 1) return 'Totais precisa ser 1 ou mais'
  if (ocupadas < 0 || ocupadas > totais) return 'Ocupadas entre 0 e o total'
  return null
}

export function hojeEmSaoPaulo(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date())
}
