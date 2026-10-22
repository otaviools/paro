<script setup lang="ts">
import { usePreferredReducedMotion } from '@vueuse/core'
import type { GeoJSONSource } from 'maplibre-gl'
import type { Feature, LineString } from 'geojson'

const props = withDefaults(defineProps<{
  pontos: [number, number][]
  tipo?: 'solida' | 'pontilhada'
  /** Reenquadra o mapa no traçado sempre que ele muda (a rota pelas ruas chega depois do mapa). */
  enquadrar?: boolean
}>(), { tipo: 'solida', enquadrar: false })

const MARGEM_DO_ENQUADRAMENTO = 64
const movimento = usePreferredReducedMotion()

function enquadrarNoTracado() {
  const instancia = mapa?.value
  if (!props.enquadrar || !instancia || props.pontos.length < 2) return
  instancia.fitBounds(limitesDosPontos(props.pontos), {
    padding: MARGEM_DO_ENQUADRAMENTO,
    maxZoom: 17,
    duration: movimento.value === 'reduce' ? 0 : 600,
  })
}

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
  enquadrarNoTracado()
})

watch(linha, (dados) => {
  mapa?.value?.getSource<GeoJSONSource>(id)?.setData(dados)
  enquadrarNoTracado()
})

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
