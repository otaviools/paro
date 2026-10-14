<script setup lang="ts">
import { estadosDeOcupacao, rotuloDoEstado } from '#shared/utils/ocupacao'
</script>

<template>
  <ul
    class="flex flex-wrap items-center gap-x-4 gap-y-2 text-legenda font-medium text-highlighted"
    aria-label="Legenda de ocupação"
  >
    <li
      v-for="estado in estadosDeOcupacao"
      :key="estado"
      class="flex items-center gap-1.5"
    >
      <PadraoOcupacao
        :estado="estado"
        decorativo
        class="size-3.5"
      />
      {{ rotuloDoEstado[estado] }}
    </li>
  </ul>
</template>
