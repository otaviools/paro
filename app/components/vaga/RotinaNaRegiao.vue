<script setup lang="ts">
import type { RotinaNaRegiao } from '#shared/types/vaga'

withDefaults(defineProps<{ rotina: RotinaNaRegiao, caixas?: boolean }>(), { caixas: true })
</script>

<template>
  <dl class="grid grid-cols-3 gap-3">
    <div
      class="flex flex-col gap-1"
      :class="caixas ? 'rounded-alerta bg-muted p-4' : ''"
    >
      <dd class="text-stat font-extrabold text-highlighted">
        {{ rotina.chegada ?? '—' }}
      </dd>
      <dt class="text-nota text-muted">
        chegada
      </dt>
    </div>
    <div
      class="flex flex-col gap-1"
      :class="caixas ? 'rounded-alerta bg-muted p-4' : ''"
    >
      <dd class="text-stat font-extrabold text-highlighted">
        {{ rotina.saida ?? '—' }}
      </dd>
      <dt class="text-nota text-muted">
        saída
      </dt>
    </div>
    <div
      class="flex flex-col gap-1"
      :class="caixas ? 'rounded-alerta bg-muted p-4' : ''"
    >
      <dd class="text-stat font-extrabold text-highlighted">
        {{ rotina.diasPorSemana }} {{ rotina.diasPorSemana === 1 ? 'dia' : 'dias' }}
      </dd>
      <dt class="text-nota text-muted">
        por semana
      </dt>
    </div>
  </dl>
</template>
