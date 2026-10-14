<script setup lang="ts">
import 'maplibre-gl/dist/maplibre-gl.css'
import type { Map as MapaLibre } from 'maplibre-gl'

const props = withDefaults(defineProps<{
  centro: [number, number]
  zoom?: number
  limites?: [[number, number], [number, number]]
  margem?: number | { top: number, bottom: number, left: number, right: number }
  zoomMaximo?: number
  interativo?: boolean
  rotulo: string
}>(), { zoom: 16, limites: undefined, margem: 56, zoomMaximo: 17, interativo: true })

const emit = defineEmits<{ carregado: [mapa: MapaLibre] }>()

const container = useTemplateRef<HTMLDivElement>('container')
const mapa = shallowRef<MapaLibre>()
const carregando = ref(true)
const colorMode = useColorMode()
provide(chaveDoMapa, mapa)

let geracao = 0
let pendente: MapaLibre | undefined

async function iniciar() {
  const minhaGeracao = ++geracao
  await nextTick()
  await new Promise(resolver => requestAnimationFrame(resolver))
  const { Map, setWorkerUrl } = await import('maplibre-gl')
  setWorkerUrl('/maplibre/maplibre-gl-worker.mjs')
  const cores = lerCoresDoMapa()
  const estilo = await carregarEstilo(cores)
  if (minhaGeracao !== geracao || !container.value) return
  const instancia = new Map({
    container: container.value,
    style: estilo,
    center: props.centro,
    zoom: props.zoom,
    interactive: props.interativo,
    attributionControl: { compact: true },
  })
  pendente = instancia
  const prontoParaDesenhar = () => {
    if (minhaGeracao !== geracao) return
    adicionarPadroes(instancia, cores)
    if (props.limites) instancia.fitBounds(props.limites, { padding: props.margem, duration: 0, maxZoom: props.zoomMaximo })
    pendente = undefined
    mapa.value = instancia
    carregando.value = false
    emit('carregado', instancia)
  }
  if (instancia.isStyleLoaded()) prontoParaDesenhar()
  else instancia.once('style.load', prontoParaDesenhar)
}

function destruir() {
  geracao++
  const instancias = [mapa.value, pendente]
  mapa.value = undefined
  pendente = undefined
  carregando.value = true
  for (const instancia of instancias) instancia?.remove()
}

onMounted(iniciar)

watch(() => colorMode.value, async () => {
  destruir()
  await iniciar()
})

onBeforeUnmount(destruir)
</script>

<template>
  <div class="relative size-full overflow-hidden bg-(--paro-mapa-fundo)">
    <div
      ref="container"
      class="size-full"
      role="region"
      :aria-label="rotulo"
    />
    <div
      v-if="carregando"
      class="absolute inset-0 grid place-items-center text-legenda text-muted"
    >
      Carregando mapa…
    </div>
    <slot v-if="mapa" />
  </div>
</template>
