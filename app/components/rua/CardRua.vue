<script setup lang="ts">
import { formatarChance, leituraDoEstado, rotuloDoEstado } from '#shared/utils/ocupacao'
import type { PrevisaoRua } from '#shared/types/previsao'
import { NuxtLink } from '#components'

withDefaults(defineProps<{
  previsao: PrevisaoRua
  detalhe?: 'distancia' | 'leitura'
  to?: string
  seta?: boolean
  destaque?: string
}>(), { detalhe: 'distancia', to: undefined, seta: false, destaque: undefined })
</script>

<template>
  <component
    :is="to ? NuxtLink : 'div'"
    :to="to"
    class="flex items-center gap-4 py-3.5"
    :class="to ? 'rounded-lista outline-primary focus-visible:outline-2' : ''"
  >
    <PadraoOcupacao
      :estado="previsao.estado"
      class="size-9 shrink-0"
    />
    <div class="min-w-0 flex-1">
      <p class="truncate text-corpo font-bold text-highlighted">
        <slot name="nome">
          {{ previsao.nome }}
        </slot>
      </p>
      <p class="truncate text-legenda font-medium text-muted">
        {{ rotuloDoEstado[previsao.estado] }} · {{ detalhe === 'leitura' ? leituraDoEstado[previsao.estado] : `a ${previsao.distanciaM} m` }}
      </p>
    </div>
    <div class="text-right">
      <p class="text-card font-extrabold text-highlighted">
        {{ formatarChance(previsao.chance) }}
      </p>
      <p class="text-nota text-muted">
        {{ previsao.medidoEm ? `medido às ${formatarHora(previsao.medidoEm)}` : 'chance' }}
      </p>
    </div>
    <UIcon
      v-if="seta"
      name="i-lucide-chevron-right"
      class="size-5 shrink-0 text-muted"
    />
  </component>
</template>
