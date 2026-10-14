<script setup lang="ts">
import type { ItemDoPainel } from '~/utils/graficosDoPainel'

const props = defineProps<{ tipo: 'colunas' | 'rosa' | 'ranking', itens: ItemDoPainel[], rotulo: string }>()
const { cores, animar } = useTemaDoGrafico()

// Escala do melhor para o pior: azul forte, azul claro, neutro, escuro e invertido.
const tons = computed(() => {
  const c = cores.value
  return [c.destaque, c.barra, c.neutro, c.escuro, c.fundoInvertido, c.pedra]
})

const opcao = computed(() => {
  if (props.tipo === 'rosa') return opcaoDeRosa(cores.value, animar.value, props.itens, tons.value)
  if (props.tipo === 'ranking') return opcaoDeRanking(cores.value, animar.value, props.itens)
  return opcaoDeColunasComTrilha(cores.value, animar.value, props.itens)
})

const descricao = computed(() => `${props.rotulo}. ${props.itens.map(item => `${item.rotulo}: ${item.percentual}%`).join(', ')}`)
</script>

<template>
  <GraficoBase
    :opcao="opcao"
    :rotulo="descricao"
  />
</template>
