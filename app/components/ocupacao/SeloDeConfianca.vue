<script setup lang="ts">
import { descreverConfianca, NIVEL_DE_CONFIANCA_PERCENTUAL, rotuloDoNivel, type Confianca } from '#shared/utils/confianca'

const props = withDefaults(defineProps<{ confianca: Confianca, compacto?: boolean, invertido?: boolean }>(), { compacto: false, invertido: false })

const icone = computed(() => ({
  baixa: 'i-lucide-signal-low',
  media: 'i-lucide-signal-medium',
  alta: 'i-lucide-signal-high',
})[props.confianca.nivel])

const descricao = computed(() => descreverConfianca(props.confianca))
const explicacao = computed(() => {
  if (props.confianca.origem === 'pesquisa') return `Intervalo de ${NIVEL_DE_CONFIANCA_PERCENTUAL}% calculado a partir da pesquisa com ${props.confianca.amostra} respondentes. Não é contagem de campo.`
  if (props.confianca.fontes) return `Média ponderada de ${descricao.value}. Relatos de quem verificou o e-mail ou estava perto da rua pesam mais.`
  return `Calculado a partir de ${descricao.value}.`
})
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 text-legenda"
    :class="invertido ? 'text-(--app-texto-no-destaque)' : 'text-muted'"
    :title="explicacao"
  >
    <UIcon
      :name="icone"
      class="size-4 shrink-0"
    />
    <span>
      <span class="font-bold">{{ rotuloDoNivel[confianca.nivel] }}</span><template v-if="!compacto"> · {{ descricao }}</template>
    </span>
    <span class="sr-only">. {{ explicacao }}</span>
  </span>
</template>
