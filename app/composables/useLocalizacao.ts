export function useLocalizacao() {
  const { preferencias } = usePreferencias()
  const posicao = useState<[number, number] | null>('posicao', () => null)
  const buscando = ref(false)
  const toast = useToast()

  const permitida = computed(() => preferencias.value.localizacaoAoLigar || preferencias.value.localizacaoContinua)

  async function localizar(silencioso = false): Promise<[number, number] | null> {
    if (!permitida.value) {
      if (silencioso) return null
      toast.add({ title: 'Localização desligada', description: 'Ligue a opção em Ajustes para usar sua posição.', color: 'neutral' })
      return null
    }
    buscando.value = true
    const encontrada = await lerPosicaoDoAparelho()
    buscando.value = false
    if (!encontrada && !silencioso) toast.add({ title: 'Não conseguimos sua localização', description: 'Confira a permissão do navegador.', color: 'error' })
    posicao.value = encontrada ?? posicao.value
    return encontrada
  }

  return { posicao, buscando, permitida, localizar }
}

function lerPosicaoDoAparelho(): Promise<[number, number] | null> {
  if (!navigator.geolocation) return Promise.resolve(null)
  return new Promise((resolver) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolver([coords.longitude, coords.latitude]),
      () => resolver(null),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  })
}
