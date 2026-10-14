<script setup lang="ts">
const props = withDefaults(defineProps<{ percentual: number, rotulo: string, tamanho?: number, espessura?: number, semTexto?: boolean }>(), { tamanho: 88, espessura: 12, semTexto: false })
const { cores, animar } = useTemaDoGrafico()

const opcao = computed(() => opcaoDeAnel(cores.value, animar.value, props.percentual, props.espessura))
</script>

<template>
  <div
    class="relative shrink-0"
    :style="{ width: `${tamanho}px`, height: `${tamanho}px` }"
  >
    <GraficoBase
      :opcao="opcao"
      :altura="tamanho"
      :rotulo="`${percentual}% ${rotulo}`"
    />
    <span
      v-if="!semTexto"
      class="pointer-events-none absolute inset-0 grid place-items-center font-extrabold text-primary"
      :class="tamanho >= 80 ? 'text-stat' : 'text-legenda'"
      aria-hidden="true"
    >{{ percentual }}%</span>
  </div>
</template>
