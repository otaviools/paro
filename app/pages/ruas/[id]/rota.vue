<script setup lang="ts">
definePageMeta({ layout: 'foco' })

const rota = useRoute()
const ruaId = computed(() => String(rota.params.id))
const { horario } = useHorario()
const { data: detalhe } = await useDetalheRua(ruaId, horario)
const { data: mapa } = await useMapaDaArea(horario)
const { posicao, localizar } = useLocalizacao()

useSeoMeta({ title: () => `Como chegar · ${detalhe.value?.previsao.nome ?? 'Rua'} · Parô` })

const origem = computed<[number, number]>(() => posicao.value ?? ((mapa.value?.referencia.coordinates ?? [0, 0]) as [number, number]))
const destino = computed<[number, number]>(() => (detalhe.value ? verticeMaisProximo(origem.value, detalhe.value.trajeto) : origem.value))
const distancia = computed(() => distanciaEmMetros(origem.value, destino.value))
const caminho = computed<[number, number][]>(() => [origem.value, [destino.value[0], origem.value[1]], destino.value])

const mapaDaRua = computed(() => {
  if (!mapa.value) return null
  return { ...mapa.value, ruas: { ...mapa.value.ruas, features: mapa.value.ruas.features.filter(feature => feature.properties.ruaId === ruaId.value) } }
})
</script>

<template>
  <div
    v-if="detalhe"
    class="-mx-6 -mt-12 flex min-h-dvh flex-col lg:mx-auto lg:mt-0 lg:max-w-3xl lg:gap-6 lg:p-8"
  >
    <div class="relative h-[45dvh] lg:h-96 lg:overflow-hidden lg:rounded-card">
      <MapaDeRuas
        v-if="mapaDaRua"
        :mapa="mapaDaRua"
        :selecionada="ruaId"
        :posicao="posicao"
        :popup="false"
        @localizar="localizar"
      >
        <MapRoute :pontos="caminho" />
      </MapaDeRuas>
      <div class="absolute top-12 left-6 z-10 lg:top-4 lg:left-4">
        <CabecalhoDeTarefa
          titulo="Mapa"
          discreto
          :voltar-para="`/ruas/${ruaId}`"
        />
      </div>
    </div>
    <div class="relative -mt-6 flex flex-1 flex-col gap-5 rounded-t-[24px] bg-default px-6 pt-3 pb-8 lg:mt-0 lg:rounded-none lg:px-0">
      <span
        class="mx-auto block h-1 w-10 rounded-full bg-accented lg:hidden"
        aria-hidden="true"
      />
      <div>
        <h1 class="text-stat font-bold text-highlighted">
          Como chegar
        </h1>
        <p class="text-interface text-muted">
          {{ detalhe.previsao.nome }} · {{ formatarDistancia(distancia) }} · cerca de {{ minutosDeCarro(distancia) }} min de carro
        </p>
        <p
          v-if="!posicao"
          class="mt-1 text-nota text-muted"
        >
          Distância a partir da {{ mapa?.nomeDaReferencia ?? 'referência' }}. Toque em localizar para usar sua posição.
        </p>
      </div>
      <AppsDeRota
        :destino="destino"
        modo="carro"
      />
      <UButton
        block
        size="xl"
        color="neutral"
        variant="outline"
        class="h-13 text-destaque"
        @click="navigateTo(`/ruas/${ruaId}`)"
      >
        Cancelar
      </UButton>
    </div>
  </div>
</template>
