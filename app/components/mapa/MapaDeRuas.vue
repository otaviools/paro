<script setup lang="ts">
import type { MapaDaArea } from '#shared/types/previsao'

const props = withDefaults(defineProps<{
  mapa: MapaDaArea
  selecionada?: string
  posicao?: [number, number] | null
  popup?: boolean
  controles?: boolean
  enquadramento?: 'area' | 'rotulos'
}>(), { selecionada: undefined, posicao: null, popup: true, controles: true, enquadramento: 'area' })

const emit = defineEmits<{ selecionar: [ruaId: string | undefined], localizar: [] }>()

const ruaDoPopup = ref<string>()

const rotulos = computed(() => props.mapa.ruas.features.map(feature => ({
  ...feature.properties,
  posicao: pontoMedio(feature.geometry),
})))

const popupAberto = computed(() => rotulos.value.find(rotulo => rotulo.ruaId === ruaDoPopup.value))

const RAIO_DO_ENQUADRAMENTO_M = 600

const centro = computed(() => props.mapa.referencia.coordinates as [number, number])

// 'rotulos' aproxima o mapa até caber só os percentuais das ruas no entorno da
// referência; ruas mais distantes continuam no mapa, mas fora do enquadramento inicial.
const RAIO_DOS_ROTULOS_M = 400
const MARGEM_DOS_ROTULOS = { top: 72, bottom: 40, left: 72, right: 104 }
// No celular a tela é estreita: margens menores, só o bastante para os rótulos e os controles.
const MARGEM_DOS_ROTULOS_NO_CELULAR = { top: 56, bottom: 28, left: 48, right: 88 }
const telaGrande = useTelaGrande()

const limites = computed(() => props.enquadramento === 'rotulos'
  ? limitesDosPontos([
      centro.value,
      ...rotulos.value
        .filter(rotulo => distanciaEmMetros(centro.value, rotulo.posicao) < RAIO_DOS_ROTULOS_M)
        .map(rotulo => rotulo.posicao),
    ])
  : limitesDosPontos([
      centro.value,
      ...props.mapa.ruas.features
        .filter(feature => distanciaEmMetros(centro.value, pontoMedio(feature.geometry)) < RAIO_DO_ENQUADRAMENTO_M)
        .flatMap(feature => feature.geometry.coordinates as [number, number][]),
    ]))

function selecionar(ruaId: string) {
  ruaDoPopup.value = props.popup ? ruaId : undefined
  emit('selecionar', ruaId)
}
</script>

<template>
  <MapView
    :centro="centro"
    :limites="limites"
    :margem="enquadramento === 'rotulos' ? (telaGrande ? MARGEM_DOS_ROTULOS : MARGEM_DOS_ROTULOS_NO_CELULAR) : 56"
    :zoom-maximo="enquadramento === 'rotulos' ? 18 : 17"
    rotulo="Mapa das ruas medidas com a chance de vaga de cada uma"
  >
    <MapGeoJSON
      :dados="mapa.ruas"
      :selecionada="selecionada ?? ruaDoPopup"
      @selecionar="selecionar"
    />
    <MapMarker :posicao="centro">
      <span class="block rounded-badge bg-(--paro-superficie-ativa) px-3 py-2 text-nota font-bold text-highlighted ring-1 ring-default">
        {{ mapa.nomeDaReferencia }}
      </span>
    </MapMarker>
    <MapMarker
      v-for="rotulo in rotulos"
      :key="rotulo.ruaId"
      :posicao="rotulo.posicao"
      ancora="bottom"
      :deslocamento="[0, -10]"
    >
      <MarcadorDeRua
        v-bind="rotulo"
        :selecionado="(selecionada ?? ruaDoPopup) === rotulo.ruaId"
        @selecionar="selecionar(rotulo.ruaId)"
      />
    </MapMarker>
    <MapMarker
      v-if="popupAberto"
      :key="`popup-${popupAberto.ruaId}`"
      :posicao="popupAberto.posicao"
      ancora="bottom"
      :deslocamento="[0, -48]"
    >
      <PopupDeRua
        :rua="popupAberto"
        @fechar="ruaDoPopup = undefined"
      />
    </MapMarker>
    <MapMarker
      v-if="posicao"
      :posicao="posicao"
    >
      <span
        class="block size-9 rounded-full bg-primary/20 p-2"
        aria-label="Sua posição"
      >
        <span class="block size-full rounded-full bg-primary ring-2 ring-(--paro-mapa-anel)" />
      </span>
    </MapMarker>
    <MapControls
      v-if="controles"
      @localizar="emit('localizar')"
    />
    <slot />
  </MapView>
</template>
