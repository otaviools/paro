import type { BairroDaPosicao } from '#shared/types/area'

const DISTANCIA_PARA_ATUALIZAR_M = 150

export function useBairroAtual() {
  const bairro = useState<BairroDaPosicao | null>('bairro-atual', () => null)
  const consultadoEm = useState<[number, number] | null>('bairro-consultado-em', () => null)
  const { areas, escolherArea } = useAreaAtual()

  async function atualizarBairro(posicao: [number, number]) {
    if (consultadoEm.value && distanciaEmMetros(consultadoEm.value, posicao) < DISTANCIA_PARA_ATUALIZAR_M) return
    consultadoEm.value = posicao
    const [lng, lat] = posicao
    const encontrado = await $fetch<BairroDaPosicao | null>('/api/bairro', { query: { lat, lng } }).catch(() => null)
    if (!encontrado) return
    bairro.value = encontrado
    const area = areas.value.find(item => item.ruasMedidas > 0 && mesmoNome(item.nome, encontrado.bairro))
    if (area) escolherArea(area.id)
  }

  return { bairro, atualizarBairro }
}

function mesmoNome(a: string, b: string): boolean {
  const normalizar = (texto: string) => texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
  return normalizar(a) === normalizar(b)
}
