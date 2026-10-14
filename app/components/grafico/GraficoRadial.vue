<script setup lang="ts">
import type { Opcao } from '#shared/types/pesquisa'

const props = defineProps<{ opcoes: Opcao[], rotulosCurtos?: Record<string, string> }>()
const { cores, animar } = useTemaDoGrafico()

const opcao = computed(() => opcaoDeBarrasRadiais(cores.value, animar.value, {
  rotulos: props.opcoes.map(opcao => props.rotulosCurtos?.[opcao.opcao] ?? opcao.opcao),
  descricoes: props.opcoes.map(opcao => opcao.opcao),
  valores: props.opcoes.map(opcao => opcao.percentual),
}))

const descricao = computed(() => props.opcoes.map(opcao => `${opcao.percentual}% ${opcao.opcao}`).join(', '))
</script>

<template>
  <GraficoBase
    :opcao="opcao"
    :rotulo="descricao"
  />
</template>
