<script setup lang="ts">
import type { Vaga } from '#shared/types/vaga'

withDefaults(defineProps<{ vaga: Vaga, compacto?: boolean }>(), { compacto: false })
</script>

<template>
  <NuxtLink
    :to="`/vaga/historico/${vaga.id}`"
    class="flex items-center gap-4 py-3.5 outline-primary focus-visible:outline-2"
  >
    <PadraoOcupacao
      v-if="!compacto"
      :estado="vaga.estadoNaChegada"
      class="size-9 shrink-0"
    />
    <div class="min-w-0 flex-1">
      <p class="text-corpo font-bold text-highlighted">
        {{ formatarDataCurta(vaga.chegada) }}
      </p>
      <p class="truncate text-legenda text-muted">
        {{ vaga.nomeDaRua }}<template v-if="!compacto">
          · {{ formatarHora(vaga.chegada) }} → {{ formatarHora(vaga.saida) }}
        </template>
      </p>
    </div>
    <div
      v-if="compacto"
      class="text-right"
    >
      <p class="text-interface font-bold text-highlighted">
        {{ formatarHora(vaga.chegada) }} → {{ formatarHora(vaga.saida) }}
      </p>
      <p class="text-nota text-muted">
        {{ vaga.saida ? formatarDuracao(minutosEntre(vaga.chegada, vaga.saida)) : '' }}
      </p>
    </div>
    <UIcon
      name="i-lucide-chevron-right"
      class="size-5 shrink-0 text-muted"
    />
  </NuxtLink>
</template>
