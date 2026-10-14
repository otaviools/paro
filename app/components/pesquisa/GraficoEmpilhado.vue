<script setup lang="ts">
import type { GrupoDeRespostas } from '#shared/types/pesquisa'
import type { TomDoGrafico } from '~/utils/graficos'

const props = defineProps<{ grupos: GrupoDeRespostas[] }>()
const { cores, animar } = useTemaDoGrafico()

const opcoes = computed(() => props.grupos[0]?.opcoes.map(opcao => opcao.opcao) ?? [])

const tons = computed<TomDoGrafico[]>(() => {
  const c = cores.value
  const destaque = { fundo: c.destaque, texto: c.textoInvertido }
  const segmento = { fundo: c.segmento, texto: c.texto }
  const neutro = { fundo: c.neutro, texto: c.texto }
  const escuro = { fundo: c.escuro, texto: c.textoInvertido }
  const invertido = { fundo: c.fundoInvertido, texto: c.textoInvertido }
  return opcoes.value.length <= 3 ? [destaque, segmento, neutro] : [destaque, segmento, neutro, escuro, invertido]
})

const opcao = computed(() => opcaoDeEmpilhado(cores.value, animar.value, {
  grupos: props.grupos.map(grupo => `${grupo.grupo} (n=${grupo.base})`),
  opcoes: opcoes.value,
  valores: props.grupos.map(grupo => grupo.opcoes.map(opcao => opcao.percentual)),
  tons: tons.value,
}))

const descricao = computed(() => props.grupos
  .map(grupo => `${grupo.grupo}: ${grupo.opcoes.map(opcao => `${opcao.opcao} ${opcao.percentual}%`).join(', ')}`)
  .join('. '))
</script>

<template>
  <GraficoBase
    :opcao="opcao"
    :rotulo="descricao"
  />
</template>
