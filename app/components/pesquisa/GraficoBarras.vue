<script setup lang="ts">
import type { Opcao } from '#shared/types/pesquisa'

const props = defineProps<{ opcoes: Opcao[], destaque: string | null }>()
const { cores, animar } = useTemaDoGrafico()

const descricao = computed(() => props.opcoes.map(opcao => `${opcao.opcao}: ${opcao.percentual}%`).join(', '))
const opcao = computed(() => opcaoDeBarras(cores.value, animar.value, {
  rotulos: props.opcoes.map(opcao => opcao.opcao),
  valores: props.opcoes.map(opcao => opcao.percentual),
  destaques: props.opcoes.map(opcao => opcao.opcao === props.destaque),
}))
</script>

<template>
  <GraficoBase
    :opcao="opcao"
    :rotulo="descricao"
  />
</template>
