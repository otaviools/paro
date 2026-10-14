import type { Area } from '#shared/types/area'

export function useAreaAtual() {
  const areas = useState<Area[]>('areas', () => [])
  const { preferencias } = usePreferencias()
  const escolhida = useCookie<string | null>('paro-area', { default: () => null, maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })

  const areaAtual = computed<Area | undefined>(() => {
    const desejada = escolhida.value ?? preferencias.value.areaPadraoId
    return areas.value.find(area => area.id === desejada && area.ruasMedidas > 0)
      ?? areas.value.find(area => area.ruasMedidas > 0)
  })

  const areaId = computed(() => areaAtual.value?.id)

  const nomeDoLocal = computed(() => (areaAtual.value ? `${areaAtual.value.nome}, ${areaAtual.value.cidade}` : 'Escolher local'))

  function escolherArea(id: string) {
    escolhida.value = id
  }

  return { areas, areaAtual, areaId, nomeDoLocal, escolherArea }
}
