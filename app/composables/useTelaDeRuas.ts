import type { LineString } from 'geojson'
import type { PrevisaoRua } from '#shared/types/previsao'

export type OrdemDasRuas = 'chance' | 'distancia'

export function useTelaDeRuas(ruaId: MaybeRefOrGetter<string | undefined>) {
  const { horario } = useHorario()
  const ordem = useState<OrdemDasRuas>('ordem-das-ruas', () => 'chance')
  const previsoes = usePrevisoes(horario)
  const pesquisa = usePesquisa()
  const { distancias, aPartirDeVoce } = useDistanciasAteVoce(ordem)
  const ordenadas = computed<PrevisaoRua[]>(() => ordenarRuas(previsoes.data.value, ordem.value, distancias.value))
  const tabela = useTabelaDeRuas(ordenadas, pesquisa.data)
  const selecionada = computed(() => toValue(ruaId) ?? previsoes.data.value.find(previsao => previsao.chance)?.ruaId)
  const detalhe = useDetalheRua(selecionada, horario)
  const noite = useNoiteDaRua(selecionada, horario)
  const medidoEm = computed(() => previsoes.data.value.find(previsao => previsao.medidoEm)?.medidoEm)
  return { horario, ordem, previsoes, ordenadas, tabela, selecionada, detalhe, noite, medidoEm, aPartirDeVoce, carregar: () => Promise.all([previsoes, pesquisa, detalhe, noite]) }
}

function useDistanciasAteVoce(ordem: Ref<OrdemDasRuas>) {
  const { posicao, localizar } = useLocalizacao()
  const { data: mapa } = useMapaDaArea(undefined)

  watch(ordem, (atual) => {
    if (atual === 'distancia') localizar()
  })

  const distancias = computed(() => {
    const atual = posicao.value
    if (!atual || !mapa.value) return null
    return new Map(mapa.value.ruas.features.map(feature => [feature.properties.ruaId, distanciaAteTrajeto(atual, feature.geometry as LineString)]))
  })

  return { distancias, aPartirDeVoce: computed(() => ordem.value === 'distancia' && distancias.value !== null) }
}

function ordenarRuas(previsoes: PrevisaoRua[], ordem: OrdemDasRuas, distancias: Map<string, number> | null): PrevisaoRua[] {
  if (ordem === 'chance') return previsoes
  const comDistancia = previsoes.map(previsao => ({ ...previsao, distanciaM: Math.round(distancias?.get(previsao.ruaId) ?? previsao.distanciaM) }))
  return comDistancia.sort((a, b) => Number(b.temMedicao) - Number(a.temMedicao) || a.distanciaM - b.distanciaM)
}
