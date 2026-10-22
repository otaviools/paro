import type { CodigoEnviado, ContaDoAparelho } from '#shared/types/conta'

const CHAVE_DA_CONTA = 'conta-do-aparelho'
const SEM_CONTA: ContaDoAparelho = { disponivel: false, verificado: false }

/**
 * Conta deste aparelho, buscada uma vez por visita e guardada no estado (o middleware de
 * entrada consulta a cada navegação). No servidor repassa os cookies da requisição.
 */
export async function buscarContaDoAparelho(): Promise<ContaDoAparelho> {
  const estado = useState<ContaDoAparelho | null>(CHAVE_DA_CONTA, () => null)
  if (!estado.value) estado.value = await useRequestFetch()<ContaDoAparelho>('/api/conta').catch(() => SEM_CONTA)
  return estado.value
}

export function useConta() {
  const estado = useState<ContaDoAparelho | null>(CHAVE_DA_CONTA, () => null)
  const conta = useFetch<ContaDoAparelho>('/api/conta', { key: 'conta', default: () => ({ disponivel: false, verificado: false }) })

  function pedirCodigo(email: string): Promise<string | null> {
    return erroDe(() => $fetch<CodigoEnviado>('/api/conta/codigo', { method: 'POST', body: { email } }))
  }

  function verificar(codigo: string): Promise<string | null> {
    return erroDe(async () => {
      estado.value = await $fetch<ContaDoAparelho>('/api/conta/verificar', { method: 'POST', body: { codigo } })
      await conta.refresh()
    })
  }

  async function apagarMeusDados(): Promise<boolean> {
    const erro = await erroDe(() => $fetch<{ apagado: boolean }>('/api/conta', { method: 'DELETE' }))
    if (erro) return false
    estado.value = null
    await refreshNuxtData()
    return true
  }

  return { conta, pedirCodigo, verificar, apagarMeusDados }
}

async function erroDe(acao: () => Promise<unknown>): Promise<string | null> {
  try {
    await acao()
    return null
  }
  catch (erro) {
    return mensagemDoErro(erro)
  }
}
