<script setup lang="ts">
import { estadosDeOcupacao } from '#shared/utils/ocupacao'
import type { PontoDaNoite, PrevisaoRua } from '#shared/types/previsao'

if (!import.meta.dev) throw createError({ statusCode: 404, statusMessage: 'Página não encontrada', fatal: true })

useSeoMeta({ title: 'Catálogo · Parô', robots: 'noindex' })

const exemplo: PrevisaoRua = {
  ruaId: 'exemplo',
  nome: 'Av. Belo Horizonte',
  distanciaM: 150,
  estado: 'apertado',
  chance: { min: 25, max: 35 },
  medidoEm: '2026-10-06T22:00:00.000Z',
  temMedicao: true,
  confianca: { origem: 'campo', nivel: 'media', amostra: 4, margem: 6 },
  relatoRecente: null,
}

const noite: PontoDaNoite[] = [
  { faixa: '17:00', rotulo: '17h', chance: 55, agora: false, origem: 'campo' },
  { faixa: '18:00', rotulo: '18h', chance: 40, agora: false, origem: 'campo' },
  { faixa: '19:00', rotulo: '19h', chance: 30, agora: true, origem: 'campo' },
  { faixa: '20:00', rotulo: '20h', chance: 35, agora: false, origem: 'campo' },
  { faixa: '21:00', rotulo: '21h', chance: 50, agora: false, origem: 'campo' },
  { faixa: '22:00', rotulo: '22h', chance: 70, agora: false, origem: 'campo' },
]
</script>

<template>
  <div class="flex flex-col gap-8 lg:p-8">
    <CabecalhoMobile
      titulo="Catálogo"
      subtitulo="Só em desenvolvimento"
      :ajustes="false"
    />
    <CabecalhoPainel
      titulo="Catálogo"
      subtitulo="Componentes da marca no código. Só em desenvolvimento."
    />
    <section class="flex flex-col gap-3">
      <EtiquetaDeSecao texto="Marca" />
      <LogoParo class="w-32" />
    </section>
    <section class="flex flex-col gap-3">
      <EtiquetaDeSecao texto="Padrões de ocupação" />
      <div class="flex flex-wrap gap-6">
        <div
          v-for="estado in estadosDeOcupacao"
          :key="estado"
          class="flex flex-col items-center gap-2"
        >
          <PadraoOcupacao
            :estado="estado"
            class="size-12"
          />
          <BadgeOcupacao :estado="estado" />
        </div>
      </div>
      <LegendaOcupacao />
    </section>
    <section class="grid gap-4 lg:grid-cols-2">
      <div class="flex flex-col gap-3">
        <EtiquetaDeSecao texto="Card de rua" />
        <ListaDeRuas
          :previsoes="[exemplo, { ...exemplo, ruaId: 'b', nome: 'R. Alexandre Marquez', estado: 'sem_dado', chance: null, medidoEm: null }]"
          :links="false"
        />
        <CardMelhorChance
          :previsao="{ ...exemplo, estado: 'livre', chance: { min: 60, max: 70 } }"
          etiqueta="Entorno da ESAMC · agora"
        />
      </div>
      <UCard>
        <EtiquetaDeSecao
          texto="Gráfico da noite"
          class="mb-4"
        />
        <GraficoDaNoite :pontos="noite" />
      </UCard>
    </section>
    <section class="flex flex-col gap-3">
      <EtiquetaDeSecao texto="Botões e controles" />
      <div class="flex flex-wrap items-center gap-3">
        <UButton
          size="xl"
          class="h-14 text-botao"
        >
          Principal
        </UButton>
        <UButton
          color="neutral"
          variant="soft"
          size="xl"
          class="h-14"
        >
          Soft
        </UButton>
        <UButton
          color="neutral"
          variant="outline"
          size="xl"
          class="h-13"
        >
          Contorno
        </UButton>
        <BotaoTema />
        <AbasDeHorario mostrar-dia />
      </div>
    </section>
  </div>
</template>
