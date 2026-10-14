import type { PainelDaVaga, Vaga } from '#shared/types/vaga'

export interface NovaVaga {
  ruaId: string
  chegada?: string
  saidaPrevista: string | null
  avisarAoSair: boolean
  ponto: [number, number] | null
}

export function useVaga() {
  const painel = useFetch<PainelDaVaga>('/api/vagas/atual', {
    key: 'vaga-atual',
    default: () => ({ atual: null, rotina: { chegada: null, saida: null, diasPorSemana: 0 } }),
  })
  const vagaAtual = computed(() => painel.data.value.atual)
  const { lerPonto, salvarPonto, apagarPontos } = usePontoDaVaga()
  const executar = useAcaoDaVaga()

  async function registrar(nova: NovaVaga): Promise<Vaga | null> {
    const { ponto, ...corpo } = nova
    const vaga = await executar(() => $fetch<Vaga>('/api/vagas', { method: 'POST', body: corpo }), 'Não foi possível registrar a vaga')
    if (vaga && ponto) salvarPonto(vaga.id, ponto)
    return vaga
  }

  function editar(id: string, mudancas: { saidaPrevista?: string | null, avisarAoSair?: boolean }) {
    return executar(() => $fetch<Vaga>(`/api/vagas/${id}`, { method: 'PATCH', body: mudancas }), 'Não foi possível salvar')
  }

  function sair(id: string) {
    return executar(() => $fetch<Vaga>(`/api/vagas/${id}/saida`, { method: 'POST' }), 'Não foi possível registrar a saída')
  }

  async function apagarHistorico() {
    const resultado = await executar(() => $fetch<{ apagadas: number }>('/api/vagas/historico', { method: 'DELETE' }), 'Não foi possível apagar o histórico')
    if (resultado) apagarPontos()
    return resultado
  }

  return { painel, vagaAtual, registrar, editar, sair, apagarHistorico, lerPonto }
}

function useAcaoDaVaga() {
  const toast = useToast()
  return async function executar<T>(acao: () => Promise<T>, falha: string): Promise<T | null> {
    try {
      const resultado = await acao()
      await Promise.all([refreshNuxtData('vaga-atual'), refreshNuxtData('historico')])
      return resultado
    }
    catch (erro) {
      toast.add({ title: falha, description: mensagemDoErro(erro), color: 'error' })
      return null
    }
  }
}

export function useHistorico() {
  return useFetch<Vaga[]>('/api/vagas/historico', { key: 'historico', default: () => [] })
}

export function mensagemDoErro(erro: unknown): string {
  const dados = (erro as { data?: { message?: string, statusMessage?: string } }).data
  return dados?.message ?? dados?.statusMessage ?? 'Confira a conexão e tente de novo.'
}
