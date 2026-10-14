<script setup lang="ts">
import { rotuloDoEstado, type EstadoOcupacao } from '#shared/utils/ocupacao'

const props = withDefaults(defineProps<{ estado: EstadoOcupacao, decorativo?: boolean }>(), { decorativo: false })
const id = useId()

const preenchimento = computed(() => ({
  livre: 'currentColor',
  apertado: `url(#${id}-diagonal)`,
  lotado: `url(#${id}-densa)`,
  sem_dado: 'none',
})[props.estado])
</script>

<template>
  <svg
    viewBox="0 0 36 36"
    :role="decorativo ? undefined : 'img'"
    :aria-label="decorativo ? undefined : rotuloDoEstado[estado]"
    :aria-hidden="decorativo ? 'true' : undefined"
    class="text-highlighted"
  >
    <defs>
      <pattern
        :id="`${id}-diagonal`"
        width="3.54"
        height="3.54"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <line
          x1="0"
          y1="0"
          x2="0"
          y2="3.54"
          stroke="currentColor"
          stroke-width="1.2"
        />
      </pattern>
      <pattern
        :id="`${id}-densa`"
        width="1.98"
        height="1.98"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <line
          x1="0"
          y1="0"
          x2="0"
          y2="1.98"
          stroke="currentColor"
          stroke-width="1.2"
        />
      </pattern>
    </defs>
    <rect
      x="1"
      y="1"
      width="34"
      height="34"
      rx="8"
      :fill="preenchimento"
      stroke="currentColor"
      :stroke-width="estado === 'sem_dado' ? 1.5 : 1.2"
      :stroke-dasharray="estado === 'sem_dado' ? '4 3' : undefined"
    />
  </svg>
</template>
