<script setup lang="ts">
import type { Opcao } from '#shared/types/pesquisa'

const props = defineProps<{ opcoes: Opcao[], destaque: string | null }>()
const { cores, animar } = useTemaDoGrafico()

const indiceDestaque = computed(() => Math.max(0, props.opcoes.findIndex(opcao => opcao.opcao === props.destaque)))

const tons = computed(() => {
  const c = cores.value
  const restantes = [c.segmento, c.ceu, c.neutro, c.pedra, c.escuro]
  let proximo = 0
  return props.opcoes.map((_opcao, indice) => (indice === indiceDestaque.value ? c.destaque : restantes[proximo++ % restantes.length] ?? c.neutro))
})

const opcao = computed(() => opcaoDeRosca(cores.value, animar.value, {
  rotulos: props.opcoes.map(opcao => opcao.opcao),
  valores: props.opcoes.map(opcao => opcao.percentual),
  tons: tons.value,
}))

const descricao = computed(() => props.opcoes.map(opcao => `${opcao.opcao}: ${opcao.percentual}%`).join(', '))
</script>

<template>
  <GraficoBase
    :opcao="opcao"
    :rotulo="descricao"
  />
</template>
