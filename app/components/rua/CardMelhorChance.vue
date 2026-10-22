<script setup lang="ts">
import { formatarChance } from '#shared/utils/ocupacao'
import type { PrevisaoRua } from '#shared/types/previsao'

withDefaults(
  defineProps<{
    previsao: PrevisaoRua
    etiqueta: string
    grande?: boolean
  }>(),
  { grande: false },
)
</script>

<template>
  <section
    class="superficie-destaque destaque-com-borda relative flex flex-col overflow-hidden rounded-card"
    :class="grande ? 'gap-2 p-5' : 'gap-3 p-5 lg:p-7'"
  >
    <div class="flex items-start justify-between gap-4">
      <p class="etiqueta text-(--paro-azul)">
        {{ etiqueta }}
      </p>
    </div>
    <p
      class="font-extrabold tracking-tight"
      :class="grande ? 'text-hero' : 'text-percentual'"
    >
      {{ formatarChance(previsao.chance) }}
    </p>
    <div
      class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
    >
      <div class="flex flex-col gap-3">
        <p class="max-w-72 text-corpo font-medium">
          {{ previsao.nome
          }}<span v-if="grande">, a {{ previsao.distanciaM }} m da ESAMC</span>
        </p>
        <div class="flex flex-wrap items-center gap-4">
          <BadgeOcupacao
            :estado="previsao.estado"
            invertido
          />
          <span
            class="flex items-center gap-1.5 text-legenda text-(--app-texto-no-destaque)"
          >
            <UIcon
              name="i-lucide-clock"
              class="size-4"
            />
            {{ origemDaChance(previsao) }}
          </span>
        </div>
        <SeloDeConfianca
          v-if="previsao.confianca"
          :confianca="previsao.confianca"
          invertido
        />
      </div>
      <slot name="acao" />
    </div>
    <div
      v-if="!grande"
      class="flex items-center justify-between pt-1"
    >
      <slot name="link" />
    </div>
  </section>
</template>
