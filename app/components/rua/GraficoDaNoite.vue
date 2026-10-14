<script setup lang="ts">
import type { PontoDaNoite } from "#shared/types/previsao";

const props = withDefaults(
  defineProps<{ pontos: PontoDaNoite[]; altura?: number }>(),
  { altura: 184 },
);
const { cores, animar } = useTemaDoGrafico();

const rotulos = computed(() =>
  props.pontos.map((ponto) => (ponto.agora ? "agora" : ponto.rotulo)),
);
const descricao = computed(() =>
  props.pontos
    .map((ponto, indice) => `${rotulos.value[indice]}: ${ponto.chance}%`)
    .join(", "),
);

const opcao = computed(() =>
  opcaoDeColunas(cores.value, animar.value, {
    rotulos: rotulos.value,
    valores: props.pontos.map((ponto) => ponto.chance),
    destaques: props.pontos.map((ponto) => ponto.agora),
    eixo: "Chance de vaga",
    sufixoDaDica: " de chance",
  }),
);
</script>

<template>
  <figure class="flex flex-col gap-2">
    <GraficoBase
      :opcao="opcao"
      :altura="altura"
      :rotulo="`Chance de vaga por horário. ${descricao}`"
    />
  </figure>
</template>
