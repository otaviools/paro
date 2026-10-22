<script setup lang="ts">
import type { LineString } from 'geojson'

const props = withDefaults(defineProps<{
  trajeto: LineString
  ponto: [number, number] | null
  rotuloDoCarro: string
  posicao?: [number, number] | null
  rota?: boolean
  controles?: boolean
  caminho?: [number, number][]
}>(), { posicao: null, rota: true, controles: false, caminho: undefined })

defineEmits<{ localizar: [] }>()

const pontoDoCarro = computed<[number, number]>(() => props.ponto ?? pontoMedio(props.trajeto))
const limites = computed(() => limitesDosPontos([pontoDoCarro.value, ...(props.posicao ? [props.posicao] : [])]))
// Quem usa o mapa passa o caminho pelas ruas; sem ele, liga a posição ao carro em linha reta.
const caminho = computed<[number, number][]>(() => props.caminho ?? (props.posicao ? [props.posicao, pontoDoCarro.value] : []))
</script>

<template>
  <MapView
    :centro="pontoDoCarro"
    :limites="posicao ? limites : undefined"
    :zoom="17"
    rotulo="Mapa com a posição da sua vaga"
  >
    <MapRoute
      v-if="rota && caminho.length"
      :pontos="caminho"
      tipo="pontilhada"
      enquadrar
    />
    <MapMarker
      :posicao="pontoDoCarro"
      ancora="bottom"
    >
      <div class="flex flex-col items-center gap-1">
        <span class="grid size-12 place-items-center rounded-full bg-primary text-inverted ring-4 ring-(--paro-mapa-anel)">
          <UIcon
            name="i-lucide-car"
            class="size-6"
          />
        </span>
        <span class="rounded-badge bg-(--paro-mapa-marcador) px-2 py-1 text-nota font-bold text-highlighted ring-1 ring-default">{{ rotuloDoCarro }}</span>
      </div>
    </MapMarker>
    <MapMarker
      v-if="posicao"
      :posicao="posicao"
    >
      <span
        class="block size-8 rounded-full bg-primary/20 p-1.5"
        aria-label="Sua posição"
      >
        <span class="block size-full rounded-full bg-primary ring-2 ring-(--paro-mapa-anel)" />
      </span>
    </MapMarker>
    <MapControls
      v-if="controles"
      :zoom="false"
      :bussola="false"
      @localizar="$emit('localizar')"
    />
  </MapView>
</template>
