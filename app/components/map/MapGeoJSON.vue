<script setup lang="ts">
import type { FeatureCollection, LineString } from 'geojson'
import type { GeoJSONSource, MapLayerMouseEvent } from 'maplibre-gl'
import type { PropriedadesDaRua } from '#shared/types/previsao'

const props = defineProps<{
  dados: FeatureCollection<LineString, PropriedadesDaRua>
  selecionada?: string
}>()

const emit = defineEmits<{ selecionar: [ruaId: string, ponto: [number, number]] }>()

const mapa = inject(chaveDoMapa)
const FONTE = 'ruas'
const camadasClicaveis = ['ruas-contorno', 'ruas-contorno-sem-dado']

function adicionarCamadas() {
  const instancia = mapa?.value
  if (!instancia) return
  const cores = lerCoresDoMapa()
  instancia.addSource(FONTE, { type: 'geojson', data: props.dados })
  // Pontas arredondadas em todas as camadas. Com 'round' cada traço do tracejado ganha
  // meia largura de linha em cada ponta, por isso o tracejado de "sem dado" usa [0.1, 1.6]
  // (traço visível ≈ 1,1 e vão ≈ 0,6, o mesmo ritmo do [1, 0.7] com ponta reta).
  const comum = { source: FONTE, layout: { 'line-cap': 'round' as const, 'line-join': 'round' as const } }
  instancia.addLayer({ ...comum, id: 'ruas-selecionada', type: 'line', filter: ['==', ['get', 'ruaId'], props.selecionada ?? ''], paint: { 'line-color': cores.acao, 'line-width': 20, 'line-opacity': 0.35 } })
  instancia.addLayer({ ...comum, id: 'ruas-contorno', type: 'line', filter: ['!=', ['get', 'estado'], 'sem_dado'], paint: { 'line-color': cores.traco, 'line-width': 12 } })
  instancia.addLayer({ ...comum, id: 'ruas-contorno-sem-dado', type: 'line', filter: ['==', ['get', 'estado'], 'sem_dado'], paint: { 'line-color': cores.traco, 'line-width': 12, 'line-dasharray': [0.1, 1.6] } })
  instancia.addLayer({ ...comum, id: 'ruas-miolo-vazio', type: 'line', filter: ['==', ['get', 'estado'], 'sem_dado'], paint: { 'line-color': cores.fundoDoPadrao, 'line-width': 8 } })
  instancia.addLayer({ ...comum, id: 'ruas-miolo-hachura', type: 'line', filter: ['in', ['get', 'estado'], ['literal', ['apertado', 'lotado']]], paint: { 'line-width': 9, 'line-pattern': ['match', ['get', 'estado'], 'apertado', 'padrao-apertado', 'padrao-lotado'] } })
}

function aoClicar(evento: MapLayerMouseEvent) {
  const ruaId = evento.features?.[0]?.properties?.ruaId
  if (typeof ruaId === 'string') emit('selecionar', ruaId, [evento.lngLat.lng, evento.lngLat.lat])
}

function mudarCursor(cursor: string) {
  const canvas = mapa?.value?.getCanvas()
  if (canvas) canvas.style.cursor = cursor
}

onMounted(() => {
  adicionarCamadas()
  for (const camada of camadasClicaveis) {
    mapa?.value?.on('click', camada, aoClicar)
    mapa?.value?.on('mouseenter', camada, () => mudarCursor('pointer'))
    mapa?.value?.on('mouseleave', camada, () => mudarCursor(''))
  }
})

watch(() => props.dados, (dados) => {
  mapa?.value?.getSource<GeoJSONSource>(FONTE)?.setData(dados)
})

watch(() => props.selecionada, (ruaId) => {
  mapa?.value?.setFilter('ruas-selecionada', ['==', ['get', 'ruaId'], ruaId ?? ''])
})
</script>

<template>
  <span hidden />
</template>
