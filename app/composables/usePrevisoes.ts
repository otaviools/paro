import type { PrevisaoRua } from '#shared/types/previsao'

export function usePrevisoes(horario: MaybeRefOrGetter<string | undefined>) {
  const { areaId } = useAreaAtual()
  return useAsyncData<PrevisaoRua[]>(
    () => `previsoes-${areaId.value}-${toValue(horario) ?? 'agora'}`,
    () => (areaId.value ? $fetch<PrevisaoRua[]>('/api/ruas', { query: { area: areaId.value, horario: toValue(horario) } }) : Promise.resolve([])),
    { default: () => [], watch: [areaId, () => toValue(horario)] },
  )
}

export function useMelhorChance(previsoes: Ref<PrevisaoRua[]>) {
  return computed(() => previsoes.value.find(previsao => previsao.chance !== null))
}
