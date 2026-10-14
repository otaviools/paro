<script setup lang="ts">
import type { Marker } from 'maplibre-gl'

const props = withDefaults(defineProps<{
  posicao: [number, number]
  arrastavel?: boolean
  ancora?: 'center' | 'bottom' | 'top' | 'left' | 'right'
  deslocamento?: [number, number]
}>(), { arrastavel: false, ancora: 'center', deslocamento: () => [0, 0] })

const emit = defineEmits<{ moveu: [posicao: [number, number]] }>()

const mapa = inject(chaveDoMapa)
const elemento = import.meta.client ? document.createElement('div') : null
let marcador: Marker | undefined
let desmontado = false

onMounted(async () => {
  const { Marker } = await import('maplibre-gl')
  if (desmontado || !elemento || !mapa?.value) return
  marcador = new Marker({ element: elemento, draggable: props.arrastavel, anchor: props.ancora, offset: props.deslocamento })
    .setLngLat(props.posicao)
    .addTo(mapa.value)
  marcador.on('dragend', () => {
    const lngLat = marcador?.getLngLat()
    if (lngLat) emit('moveu', [lngLat.lng, lngLat.lat])
  })
})

watch(() => props.posicao, posicao => marcador?.setLngLat(posicao))

onBeforeUnmount(() => {
  desmontado = true
  marcador?.remove()
})
</script>

<template>
  <Teleport
    v-if="elemento"
    :to="elemento"
  >
    <slot />
  </Teleport>
</template>
