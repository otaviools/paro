import type { RespostaDoRelato } from '#shared/utils/relato'
import type { RelatoRegistrado } from '#shared/types/relato'

export function useRelato() {
  const { localizar, permitida } = useLocalizacao()
  const toast = useToast()

  async function enviarRelato(ruaId: string, resposta: RespostaDoRelato, posicao?: [number, number] | null): Promise<RelatoRegistrado | null> {
    if (!resposta.estado && !resposta.tempo) return null
    const atual = posicao ?? (permitida.value ? await localizar(true) : null)
    try {
      const registrado = await $fetch<RelatoRegistrado>('/api/relatos', { method: 'POST', body: { ruaId, ...resposta, posicao: atual } })
      await refreshNuxtData()
      return registrado
    }
    catch (erro) {
      toast.add({ title: 'Não foi possível enviar o relato', description: mensagemDoErro(erro), color: 'error' })
      return null
    }
  }

  return { enviarRelato }
}
