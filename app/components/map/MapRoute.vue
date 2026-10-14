<script setup lang="ts">
import type { GeoJSONSource } from 'maplibre-gl'
import type { Feature, LineString } from 'geojson'

const props = withDefaults(defineProps<{
  pontos: [number, number][]
  tipo?: 'solida' | 'pontilhada'
}>(), { tipo: 'solida' })

const mapa = inject(chaveDoMapa)
const id = `rota-${useId()}`

const linha = computed<Feature<LineString>>(() => ({
  type: 'Feature',
  properties: {},
  geometry: { type: 'LineString', coordinates: props.pontos },
}))

onMounted(() => {
  const instancia = mapa?.value
  if (!instancia) return
  instancia.addSource(id, { type: 'geojson', data: linha.value })
  instancia.addLayer({
    id,
    type: 'line',
    source: id,
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': lerCoresDoMapa().acao,
      'line-width': props.tipo === 'solida' ? 4 : 4,
      ...(props.tipo === 'pontilhada' && { 'line-dasharray': [0.1, 2] }),
    },
  })
})

watch(linha, dados => mapa?.value?.getSource<GeoJSONSource>(id)?.setData(dados))

onBeforeUnmount(() => {
  const instancia = mapa?.value
  if (!instancia?.getStyle()) return
  if (instancia.getLayer(id)) instancia.removeLayer(id)
  if (instancia.getSource(id)) instancia.removeSource(id)
})
</script>

<template>
  <span hidden />
</template>
