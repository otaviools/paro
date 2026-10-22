type FalhaDeLocalizacao = 'inseguro' | 'sem_suporte' | 'negada' | 'indisponivel'

type Leitura = { posicao: [number, number] } | { falha: FalhaDeLocalizacao }

const ERRO_PERMISSAO_NEGADA = 1
const CINCO_MINUTOS_MS = 5 * 60 * 1000

const avisoDaFalha: Record<FalhaDeLocalizacao, { title: string, description: string }> = {
  inseguro: { title: 'Localização indisponível neste endereço', description: 'O navegador só libera a localização em https ou em localhost.' },
  sem_suporte: { title: 'Localização indisponível', description: 'Este navegador não oferece localização.' },
  negada: { title: 'Localização bloqueada pelo navegador', description: 'Toque no cadeado ao lado do endereço do site e permita a localização.' },
  indisponivel: { title: 'Não conseguimos sua localização', description: 'Confira se o GPS ou a localização do aparelho estão ligados e tente de novo.' },
}

export function useLocalizacao() {
  const { preferencias } = usePreferencias()
  const posicao = useState<[number, number] | null>('posicao', () => null)
  const buscando = ref(false)
  const toast = useToast()
  const { atualizarBairro } = useBairroAtual()

  const permitida = computed(() => preferencias.value.localizacaoAoLigar || preferencias.value.localizacaoContinua)

  async function lerAgora(silencioso: boolean): Promise<[number, number] | null> {
    buscando.value = true
    const leitura = await lerPosicaoDoAparelho()
    buscando.value = false
    if ('falha' in leitura) {
      if (!silencioso) toast.add({ ...avisoDaFalha[leitura.falha], color: 'error' })
      return null
    }
    posicao.value = leitura.posicao
    atualizarBairro(leitura.posicao)
    return leitura.posicao
  }

  function localizar(silencioso = false): Promise<[number, number] | null> {
    if (permitida.value) return lerAgora(silencioso)
    if (!silencioso) toast.add({ title: 'Localização desligada', description: 'Ligue a opção em Ajustes para usar sua posição.', color: 'neutral' })
    return Promise.resolve(null)
  }

  async function pedirPermissao(): Promise<boolean> {
    return (await lerAgora(false)) !== null
  }

  return { posicao, buscando, permitida, localizar, pedirPermissao }
}

async function lerPosicaoDoAparelho(): Promise<Leitura> {
  if (!window.isSecureContext) return { falha: 'inseguro' }
  if (!navigator.geolocation) return { falha: 'sem_suporte' }
  const precisa = await tentarLer({ enableHighAccuracy: true, timeout: 10000 })
  if ('posicao' in precisa || precisa.falha === 'negada') return precisa
  return tentarLer({ enableHighAccuracy: false, timeout: 15000, maximumAge: CINCO_MINUTOS_MS })
}

function tentarLer(opcoes: PositionOptions): Promise<Leitura> {
  return new Promise((resolver) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolver({ posicao: [coords.longitude, coords.latitude] }),
      erro => resolver({ falha: erro.code === ERRO_PERMISSAO_NEGADA ? 'negada' : 'indisponivel' }),
      opcoes,
    )
  })
}
