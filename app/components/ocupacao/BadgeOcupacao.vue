<script setup lang="ts">
import { formatarChance, rotuloDoEstado, type EstadoOcupacao, type FaixaDeChance } from '#shared/utils/ocupacao'

const props = withDefaults(defineProps<{
  estado: EstadoOcupacao
  chance?: FaixaDeChance | null
  invertido?: boolean
}>(), { chance: undefined, invertido: false })

const texto = computed(() => {
  const rotulo = rotuloDoEstado[props.estado]
  return props.chance === undefined ? rotulo : `${formatarChance(props.chance)} · ${rotulo}`
})
</script>

<template>
  <span
    class="inline-flex h-7 items-center gap-2 rounded-badge border px-2.5 text-legenda font-bold whitespace-nowrap"
    :class="invertido ? 'border-(--paro-creme)/35 text-(--paro-creme) [&_svg]:text-(--paro-creme)' : 'border-accented bg-elevated text-highlighted'"
  >
    <PadraoOcupacao
      :estado="estado"
      decorativo
      class="size-3.5 shrink-0"
    />
    {{ texto }}
  </span>
</template>
