import type { ModoDaRota, RotaPelasRuas } from '#shared/types/rota'

/**
 * Rota pelas ruas entre dois pontos (via /api/rota). Enquanto carrega, ou se o serviço de
 * rotas não responder, `pontos` é a linha reta entre origem e destino e `pelasRuas` fica falso,
 * para a tela não afirmar tempo ou distância de rota que não foi calculada.
 */
export function useRota(origem: MaybeRefOrGetter<[number, number] | null>, destino: MaybeRefOrGetter<[number, number] | null>, modo: ModoDaRota) {
  const consulta = computed(() => {
    const de = toValue(origem)
    const para = toValue(destino)
    return de && para ? { origem: de.join(','), destino: para.join(','), modo } : null
  })

  const { data } = useFetch<RotaPelasRuas | null>('/api/rota', {
    query: computed(() => consulta.value ?? {}),
    immediate: Boolean(consulta.value),
    watch: [consulta],
    default: () => null,
    lazy: true,
    server: false,
  })

  const pelasRuas = computed(() => Boolean(consulta.value && data.value))
  const pontos = computed<[number, number][]>(() => {
    if (data.value && consulta.value) return data.value.pontos
    const de = toValue(origem)
    const para = toValue(destino)
    return de && para ? [de, para] : []
  })

  return {
    pontos,
    pelasRuas,
    distanciaM: computed(() => (pelasRuas.value ? data.value?.distanciaM ?? null : null)),
    duracaoMin: computed(() => (pelasRuas.value ? data.value?.duracaoMin ?? null : null)),
  }
}
