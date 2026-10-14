<script setup lang="ts">
import { formatarChance, leituraDoEstado } from '#shared/utils/ocupacao'
import type { DetalheRua, PontoDaNoite } from '#shared/types/previsao'

withDefaults(defineProps<{ detalhe: DetalheRua, noite: PontoDaNoite[], completo?: boolean, momento?: string }>(), { completo: false, momento: 'agora' })
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="flex flex-col gap-2">
      <h2 class="text-stat font-bold text-highlighted">
        {{ detalhe.previsao.nome }}
      </h2>
      <div class="flex flex-wrap items-center gap-3">
        <BadgeOcupacao :estado="detalhe.previsao.estado" />
        <span class="flex items-center gap-1.5 text-legenda text-muted">
          <UIcon
            name="i-lucide-clock"
            class="size-4"
          />
          medido às {{ formatarHora(detalhe.previsao.medidoEm) }}
        </span>
      </div>
    </div>
    <div>
      <p class="text-percentual font-extrabold tracking-tight text-highlighted lg:text-hero">
        {{ formatarChance(detalhe.previsao.chance) }}
      </p>
      <p class="text-corpo text-muted">
        de chance {{ momento }} · {{ leituraDoEstado[detalhe.previsao.estado] }}
      </p>
    </div>
    <USeparator v-if="completo" />
    <section class="flex flex-col gap-3">
      <h3 class="etiqueta text-primary">
        Chance ao longo da noite
      </h3>
      <GraficoDaNoite :pontos="noite" />
    </section>
    <template v-if="completo">
      <USeparator />
      <section
        v-if="detalhe.citacao"
        class="flex flex-col gap-2"
      >
        <h3 class="etiqueta text-primary">
          Na pesquisa
        </h3>
        <p class="flex items-center gap-4">
          <GraficoAnel
            :percentual="detalhe.citacao.percentual"
            rotulo="dos respondentes costumam conseguir vaga nesta rua"
            :tamanho="72"
          />
          <span class="text-legenda text-highlighted">dos {{ detalhe.citacao.base }} respondentes costumam conseguir vaga nesta rua</span>
        </p>
      </section>
      <section
        v-if="detalhe.alternativa"
        class="flex flex-col gap-3"
      >
        <h3 class="etiqueta text-primary">
          Alternativa {{ momento }}
        </h3>
        <UCard :ui="{ root: 'rounded-lista', body: 'px-4 py-0 sm:px-4 sm:py-0' }">
          <CardRua
            :previsao="detalhe.alternativa"
            :to="`/ruas/${detalhe.alternativa.ruaId}`"
            seta
          />
        </UCard>
      </section>
    </template>
    <div class="grid grid-cols-[1.1fr_1fr] gap-3">
      <UButton
        :to="`/ruas/${detalhe.previsao.ruaId}/rota`"
        size="xl"
        icon="i-lucide-navigation"
        class="h-13 justify-center text-destaque"
      >
        Como chegar
      </UButton>
      <UButton
        :to="detalhe.alternativa ? `/ruas/${detalhe.alternativa.ruaId}` : '/ruas'"
        size="xl"
        color="neutral"
        variant="outline"
        :icon="completo ? 'i-lucide-shuffle' : 'i-lucide-search'"
        class="h-13 justify-center text-destaque"
      >
        Alternativas
      </UButton>
    </div>
  </div>
</template>
