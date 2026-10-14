<script setup lang="ts">
useSeoMeta({ title: 'Mapa · Parô' })

const { horario } = useHorario()
const { data: mapa } = await useMapaDaArea(horario)
const { data: previsoes } = await usePrevisoes(horario)
const { posicao, localizar } = useLocalizacao()
const { areaAtual } = useAreaAtual()
const telaGrande = useTelaGrande()

const melhor = useMelhorChance(previsoes)
const medidoEm = computed(() => previsoes.value.find(previsao => previsao.medidoEm)?.medidoEm)
const subtitulo = computed(() => `${medidoEm.value ? `medido às ${formatarHora(medidoEm.value)} · ` : ''}entorno da ${areaAtual.value?.nomeDaReferencia ?? 'ESAMC'}`)
</script>

<template>
  <div class="flex flex-col">
    <CabecalhoPainel
      titulo="Mapa"
      :subtitulo="subtitulo"
      horario
      busca
    />
    <div class="flex flex-col gap-4 lg:hidden">
      <CabecalhoMobile
        titulo="Mapa"
        :subtitulo="subtitulo"
        :tema="false"
      />
      <AbasDeHorario />
    </div>
    <div class="-mx-6 mt-4 h-[430px] lg:mx-6 lg:mt-6 lg:h-auto lg:min-h-0 lg:flex-1 lg:overflow-hidden lg:rounded-card lg:ring-1 lg:ring-default">
      <MapaDeRuas
        v-if="mapa"
        :mapa="mapa"
        :posicao="posicao"
        :enquadramento="telaGrande ? 'area' : 'rotulos'"
        @localizar="localizar"
      />
    </div>
    <div class="flex shrink-0 flex-col gap-4 pt-4 lg:px-6 lg:pb-6">
      <LegendaOcupacao />
      <USeparator class="lg:hidden" />
      <section
        v-if="melhor"
        class="flex flex-col gap-1 lg:hidden"
      >
        <div class="flex items-baseline justify-between">
          <h2 class="etiqueta text-primary">
            Melhor chance {{ horario ? `às ${horario.replace(':', 'h')}` : 'agora' }}
          </h2>
          <ULink
            to="/ruas"
            class="text-legenda font-bold text-primary"
          >
            Ver todas
          </ULink>
        </div>
        <CardRua
          :previsao="melhor"
          :to="`/ruas/${melhor.ruaId}`"
          seta
        />
      </section>
    </div>
  </div>
</template>
