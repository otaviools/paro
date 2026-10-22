import type { Area, BairroDaPosicao } from '#shared/types/area'

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

  const bairro = useState<BairroDaPosicao | null>('bairro-atual', () => null)

  const partesDoLocal = computed(() => {
    if (bairro.value) return { lugar: bairro.value.bairro, cidade: bairro.value.cidade }
    return areaAtual.value ? { lugar: areaAtual.value.nome, cidade: areaAtual.value.cidade } : { lugar: 'Escolher local', cidade: '' }
  })

  const nomeDoLocal = computed(() => [partesDoLocal.value.lugar, partesDoLocal.value.cidade].filter(Boolean).join(', '))

  function escolherArea(id: string) {
    escolhida.value = id
  }

  return { areas, areaAtual, areaId, nomeDoLocal, partesDoLocal, escolherArea }
}
