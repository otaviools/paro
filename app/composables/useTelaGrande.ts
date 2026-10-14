import { useMediaQuery } from '@vueuse/core'

export function useTelaGrande() {
  return useMediaQuery('(min-width: 1024px)', { ssrWidth: 393 })
}
