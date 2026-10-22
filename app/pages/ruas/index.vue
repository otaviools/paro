<script setup lang="ts">
useSeoMeta({ title: 'Parô | Ruas' })

const tela = useTelaDeRuas(undefined)
const { ordem, ordenadas, tabela, selecionada, medidoEm, aPartirDeVoce } = tela
const [, , { data: detalhe }, { data: noite }] = await tela.carregar()
const { areaAtual } = useAreaAtual()

const opcoesDeOrdem = [
  { label: 'Maior chance', value: 'chance' },
  { label: 'Mais perto', value: 'distancia' },
]
</script>

<template>
  <div>
    <CabecalhoPainel titulo="Ruas" />
    <div class="flex flex-col gap-5 lg:hidden">
      <CabecalhoDeTarefa
        titulo="Ruas por perto"
        voltar-para="/mapa"
      />
      <AbasDeHorario />
      <div class="flex items-center justify-between gap-3">
        <USelect
          v-model="ordem"
          :items="opcoesDeOrdem"
          icon="i-lucide-arrow-down-up"
          size="lg"
          class="w-48"
          aria-label="Ordenar ruas"
        />
        <p
          v-if="medidoEm"
          class="text-nota text-muted"
        >
          medido às {{ formatarHora(medidoEm) }}
        </p>
      </div>
      <p
        v-if="ordem === 'distancia'"
        class="-mt-2 text-nota text-muted"
        aria-live="polite"
      >
        {{
          aPartirDeVoce
            ? "Distância a partir de você"
            : `Distância a partir da ${areaAtual?.nomeDaReferencia ?? "ESAMC"}`
        }}
      </p>
      <ListaDeRuas :previsoes="ordenadas" />
      <LegendaOcupacao />
      <p class="text-nota text-muted">
        Faixas estimadas a partir de medições de campo. Previsão, não garantia.
      </p>
    </div>
    <RuasDesktop
      v-model:ordem="ordem"
      :linhas="tabela.linhas.value"
      :selecionada="selecionada"
      :detalhe="detalhe"
      :noite="noite"
      :contraste="tabela.contraste.value"
      :base="tabela.base.value"
      :a-partir-de-voce="aPartirDeVoce"
      @selecionar="navigateTo(`/ruas/${$event}`)"
    />
  </div>
</template>
