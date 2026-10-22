import type { EstacionamentoDetectado } from '#shared/utils/estacionamento'

const CHAVE_DO_SILENCIO = 'paro-silencio-estacionamento'
const SILENCIO_MS = 30 * 60 * 1000

export function useDeteccaoDeVaga() {
  const pergunta = useState<EstacionamentoDetectado | null>('pergunta-de-vaga', () => null)

  function silenciar() {
    try {
      localStorage.setItem(CHAVE_DO_SILENCIO, String(Date.now() + SILENCIO_MS))
    }
    catch {
      return
    }
    finally {
      pergunta.value = null
    }
  }

  function dispensar() {
    pergunta.value = null
  }

  return { pergunta, silenciar, dispensar }
}

export function silenciado(): boolean {
  try {
    return Number(localStorage.getItem(CHAVE_DO_SILENCIO) ?? 0) > Date.now()
  }
  catch {
    return false
  }
}
