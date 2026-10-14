import type { ResumoDaPesquisa } from '#shared/types/pesquisa'

export function usePesquisa() {
  return useFetch<ResumoDaPesquisa | null>('/api/pesquisa', { key: 'pesquisa', default: () => null })
}
