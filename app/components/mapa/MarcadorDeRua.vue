<script setup lang="ts">
import type { EstadoOcupacao } from '#shared/utils/ocupacao'
import { rotuloDoEstado } from '#shared/utils/ocupacao'

defineProps<{
  nome: string
  estado: EstadoOcupacao
  chance: string
  selecionado: boolean
}>()
defineEmits<{ selecionar: [] }>()
</script>

<template>
  <button
    type="button"
    class="flex items-center gap-1.5 rounded-badge px-2 py-1 text-legenda font-bold shadow-sm ring-1 transition"
    :class="
      selecionado
        ? 'bg-primary text-inverted ring-primary [&_svg]:text-inverted'
        : 'bg-(--paro-mapa-marcador) text-highlighted ring-default dark:bg-default dark:ring-0'
    "
    :aria-label="`${nome}: ${estado === 'sem_dado' ? 'Sem dado' : `${chance} de chance`}, ${rotuloDoEstado[estado]}`"
    @pointerdown.stop
    @touchstart.stop
    @mousedown.stop
    @click.stop="$emit('selecionar')"
  >
    <PadraoOcupacao
      :estado="estado"
      decorativo
      class="size-3.5"
    />
    {{ estado === "sem_dado" ? "Sem dado" : chance }}
  </button>
</template>
