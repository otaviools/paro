import { useNow } from '@vueuse/core'

export function useAgora() {
  return useNow({ interval: 30000 })
}

export function useTempoNaVaga(chegada: MaybeRefOrGetter<string | null | undefined>, saida?: MaybeRefOrGetter<string | null | undefined>) {
  const agora = useAgora()
  return computed(() => {
    const inicio = toValue(chegada)
    if (!inicio) return '—'
    return formatarDuracao(minutosEntre(inicio, toValue(saida) ?? agora.value))
  })
}
