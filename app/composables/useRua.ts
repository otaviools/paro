import { refDebounced } from '@vueuse/core'
import type { DetalheRua, MapaDaArea, PontoDaNoite, ResultadoDaBusca } from '#shared/types/previsao'

export function useDetalheRua(ruaId: MaybeRefOrGetter<string | undefined>, horario: MaybeRefOrGetter<string | undefined>) {
  return useAsyncData<DetalheRua | null>(
    () => `rua-${toValue(ruaId)}-${toValue(horario) ?? 'agora'}`,
    () => {
      const id = toValue(ruaId)
      return id ? $fetch<DetalheRua>(`/api/ruas/${id}`, { query: { horario: toValue(horario) } }) : Promise.resolve(null)
    },
    { default: () => null, watch: [() => toValue(ruaId), () => toValue(horario)] },
  )
}

export function useNoiteDaRua(ruaId: MaybeRefOrGetter<string | undefined>, horario: MaybeRefOrGetter<string | undefined>) {
  return useAsyncData<PontoDaNoite[]>(
    () => `noite-${toValue(ruaId)}-${toValue(horario) ?? 'agora'}`,
    () => {
      const id = toValue(ruaId)
      return id ? $fetch<PontoDaNoite[]>(`/api/ruas/${id}/noite`, { query: { horario: toValue(horario) } }) : Promise.resolve([])
    },
    { default: () => [], watch: [() => toValue(ruaId), () => toValue(horario)] },
  )
}

export function useMapaDaArea(horario: MaybeRefOrGetter<string | undefined>) {
  const { areaId } = useAreaAtual()
  return useAsyncData<MapaDaArea | null>(
    () => `mapa-${areaId.value}-${toValue(horario) ?? 'agora'}`,
    () => (areaId.value ? $fetch<MapaDaArea>('/api/mapa', { query: { area: areaId.value, horario: toValue(horario) } }) : Promise.resolve(null)),
    { default: () => null, watch: [areaId, () => toValue(horario)] },
  )
}

export function useBuscaDeRuas(termo: Ref<string>, horario: MaybeRefOrGetter<string | undefined>) {
  const { areaId } = useAreaAtual()
  const termoAtrasado = refDebounced(termo, 250)
  return useAsyncData<ResultadoDaBusca | null>(
    () => `busca-${areaId.value}-${termoAtrasado.value}-${toValue(horario) ?? 'agora'}`,
    () => {
      const q = termoAtrasado.value.trim()
      if (!q || !areaId.value) return Promise.resolve(null)
      return $fetch<ResultadoDaBusca>('/api/ruas/busca', { query: { q, area: areaId.value, horario: toValue(horario) } })
    },
    { default: () => null, watch: [termoAtrasado, areaId, () => toValue(horario)] },
  )
}
