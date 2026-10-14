<script setup lang="ts">
import type { Opcao } from '#shared/types/pesquisa'

const props = defineProps<{ opcoes: Opcao[], destaque: string | null }>()
const { cores, animar } = useTemaDoGrafico()

// Colunas estreitas: o rótulo vai em até duas linhas, quebrando no travessão ou no espaço do meio.
function quebrarEmDuasLinhas(texto: string): string {
  if (texto.includes('–')) return texto.replace('–', '–\n')
  const palavras = texto.split(' ')
  if (texto.length <= 6 || palavras.length < 2) return texto
  const meio = Math.ceil(palavras.length / 2)
  return `${palavras.slice(0, meio).join(' ')}\n${palavras.slice(meio).join(' ')}`
}

const descricao = computed(() => props.opcoes.map(opcao => `${opcao.opcao}: ${opcao.percentual}%`).join(', '))
const opcao = computed(() => opcaoDeColunas(cores.value, animar.value, {
  rotulos: props.opcoes.map(opcao => quebrarEmDuasLinhas(opcao.opcao)),
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
