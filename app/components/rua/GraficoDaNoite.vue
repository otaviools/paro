<script setup lang="ts">
import type { PontoDaNoite } from '#shared/types/previsao'

const props = withDefaults(
  defineProps<{ pontos: PontoDaNoite[], altura?: number }>(),
  { altura: 184 },
)
const { cores, animar } = useTemaDoGrafico()

const rotulos = computed(() =>
  props.pontos.map(ponto => (ponto.agora ? 'agora' : ponto.rotulo)),
)
const descricao = computed(() =>
  props.pontos
    .map((ponto, indice) => `${rotulos.value[indice]}: ${ponto.chance}%`)
    .join(', '),
)

const legenda = computed(() => {
  const origens = new Set(props.pontos.map(ponto => ponto.origem))
  if (origens.has('combinada'))
    return 'Horários com relatos de usuários combinam relatos, contagens de campo e pesquisa. Não é garantia.'
  if (origens.has('pesquisa') && origens.has('campo'))
    return 'Horários sem contagem de campo usam a estimativa da pesquisa. Não é garantia.'
  if (origens.has('pesquisa'))
    return 'Estimativa da pesquisa, igual em todos os horários até haver contagem de campo. Não é garantia.'
  return 'Previsão com base em contagens de campo. Não é garantia.'
})

const opcao = computed(() =>
  opcaoDeColunas(cores.value, animar.value, {
    rotulos: rotulos.value,
    valores: props.pontos.map(ponto => ponto.chance),
    destaques: props.pontos.map(ponto => ponto.agora),
    eixo: 'Chance de vaga',
    sufixoDaDica: ' de chance',
    corPorValor: true,
  }),
)
</script>

<template>
  <figure class="flex flex-col gap-2">
    <GraficoBase
      :opcao="opcao"
      :altura="altura"
      :rotulo="`Chance de vaga por horário. ${descricao}`"
    />
    <figcaption class="text-nota text-muted">
      {{ legenda }}
    </figcaption>
  </figure>
</template>
