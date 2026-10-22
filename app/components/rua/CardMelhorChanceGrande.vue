<script setup lang="ts">
import { formatarChance } from '#shared/utils/ocupacao'
import type { PrevisaoRua } from '#shared/types/previsao'

defineProps<{ previsao: PrevisaoRua, etiqueta: string, referencia: string }>()
</script>

<template>
  <section
    class="superficie-destaque destaque-com-borda relative isolate flex flex-col overflow-hidden rounded-card p-6"
  >
    <div
      class="pointer-events-none absolute inset-y-0 right-0 -z-10 hidden w-[470px] max-w-[58%] lg:block"
      aria-hidden="true"
    >
      <img
        src="/fundos/mapa-melhor-chance.svg"
        alt=""
        class="size-full object-cover object-left"
      >
      <div
        class="absolute inset-0 bg-linear-to-r from-(--app-fundo-destaque) via-(--paro-asfalto)/55 via-45% to-(--paro-asfalto)/25"
      />
      <span
        class="absolute top-[86px] left-[180px] size-14 rounded-full border border-(--paro-azul)/8 bg-(--paro-azul)/7"
      />
      <svg
        viewBox="0 0 24 24"
        class="absolute top-[78px] left-[190px] size-9"
      >
        <path
          d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"
          fill="var(--paro-azul)"
        />
        <circle
          cx="12"
          cy="10"
          r="3"
          fill="var(--paro-asfalto)"
        />
      </svg>
      <span
        class="absolute top-[53px] left-[246px] flex w-11 flex-col items-center gap-1 text-nota font-semibold text-(--paro-asfalto-fraco)"
      >
        <UIcon
          name="i-lucide-graduation-cap"
          class="size-[18px]"
        />
        {{ referencia }}
      </span>
    </div>

    <div class="flex items-start justify-between gap-4">
      <p class="etiqueta flex items-center gap-2 text-(--paro-azul)">
        <UIcon
          name="i-lucide-locate-fixed"
          class="size-4"
        />
        {{ etiqueta }}
      </p>
    </div>

    <p class="mt-2 text-hero font-extrabold tracking-tight text-(--paro-creme)">
      {{ formatarChance(previsao.chance) }}
    </p>

    <p
      class="mt-3.5 flex items-center gap-2.5 text-corpo font-medium text-(--paro-creme)"
    >
      <UIcon
        name="i-lucide-map-pin"
        class="size-[18px] text-(--paro-azul)"
      />
      {{ previsao.nome }}, a {{ previsao.distanciaM }} m da {{ referencia }}
    </p>

    <div class="mt-auto flex items-end justify-between gap-4 pt-6">
      <div class="flex flex-col gap-3">
        <div class="flex items-center gap-4">
          <BadgeOcupacao
            :estado="previsao.estado"
            invertido
          />
          <span
            class="h-5 w-px bg-(--paro-creme)/15"
            aria-hidden="true"
          />
          <span
            class="flex items-center gap-1.5 text-legenda font-medium text-(--paro-asfalto-fraco)"
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
          compacto
          invertido
          class="text-(--paro-asfalto-fraco)! [&_.font-bold]:font-medium"
        />
      </div>
      <slot name="acao" />
    </div>
  </section>
</template>
