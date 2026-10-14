import { preferenciasPadrao, type Preferencias, type TemaPreferido } from '#shared/types/preferencias'

const modoDoTema: Record<TemaPreferido, 'light' | 'dark' | 'system'> = {
  claro: 'light',
  escuro: 'dark',
  sistema: 'system',
}

export function usePreferencias() {
  const preferencias = useState<Preferencias>('preferencias', () => preferenciasPadrao)
  const colorMode = useColorMode()
  const toast = useToast()

  async function salvar(mudancas: Partial<Preferencias>): Promise<boolean> {
    const anterior = preferencias.value
    preferencias.value = { ...anterior, ...mudancas }
    try {
      preferencias.value = await $fetch<Preferencias>('/api/preferencias', { method: 'PATCH', body: mudancas })
      return true
    }
    catch {
      preferencias.value = anterior
      toast.add({ title: 'Não foi possível salvar', description: 'Confira a conexão e tente de novo.', color: 'error' })
      return false
    }
  }

  function aplicarTema(tema: TemaPreferido) {
    colorMode.preference = modoDoTema[tema]
  }

  async function escolherTema(tema: TemaPreferido) {
    aplicarTema(tema)
    if (preferencias.value.consentimento) await salvar({ tema })
    else preferencias.value = { ...preferencias.value, tema }
  }

  function alternarTema() {
    return escolherTema(colorMode.value === 'dark' ? 'claro' : 'escuro')
  }

  return { preferencias, salvar, escolherTema, alternarTema }
}
