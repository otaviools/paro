const CHAVE = 'paro-pontos-das-vagas'

type PontosSalvos = Record<string, [number, number]>

export function usePontoDaVaga() {
  function lerTodos(): PontosSalvos {
    if (import.meta.server) return {}
    try {
      return JSON.parse(localStorage.getItem(CHAVE) ?? '{}') as PontosSalvos
    }
    catch {
      return {}
    }
  }

  function gravar(pontos: PontosSalvos) {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(pontos))
    }
    catch {
      return
    }
  }

  function lerPonto(vagaId: string): [number, number] | null {
    return lerTodos()[vagaId] ?? null
  }

  function salvarPonto(vagaId: string, ponto: [number, number]) {
    gravar({ ...lerTodos(), [vagaId]: ponto })
  }

  function apagarPontos() {
    gravar({})
  }

  return { lerPonto, salvarPonto, apagarPontos }
}
