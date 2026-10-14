<script setup lang="ts">
import type {
  MapaDaArea,
  PontoDaNoite,
  PrevisaoRua,
} from "#shared/types/previsao";
import type { ResumoDaPesquisa } from "#shared/types/pesquisa";
import type { Vaga } from "#shared/types/vaga";

const props = defineProps<{
  mapa: MapaDaArea | null;
  previsoes: PrevisaoRua[];
  melhor: PrevisaoRua | undefined;
  selecionada: PrevisaoRua | undefined;
  noite: PontoDaNoite[];
  vaga: Vaga | null;
  pesquisa: ResumoDaPesquisa | null;
  posicao: [number, number] | null;
  referencia: string;
  telaGrande: boolean;
}>();

defineEmits<{
  selecionar: [ruaId: string | undefined];
  sair: [];
  localizar: [];
}>();

const ruasPorPerto = computed(() =>
  props.previsoes.filter((previsao) => previsao.temMedicao).slice(0, 5),
);
const indicadores = computed(() => props.pesquisa?.indicadores ?? []);
</script>

<template>
  <!--
    Grade de 2 colunas × 3 linhas que ocupa a altura que sobra da tela:
    o mapa (linhas 1–2) termina junto com "Ruas por perto" e o gráfico da noite
    fica na mesma linha dos cards menores.
  -->
  <div
    class="hidden min-h-0 flex-1 grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)_auto] gap-4 p-6 lg:grid"
  >
    <div
      class="row-span-2 min-h-60 overflow-hidden rounded-card ring-1 ring-default"
    >
      <MapaDeRuas
        v-if="telaGrande && mapa"
        :mapa="mapa"
        :selecionada="selecionada?.ruaId"
        :posicao="posicao"
        enquadramento="rotulos"
        @selecionar="$emit('selecionar', $event)"
        @localizar="$emit('localizar')"
      />
    </div>
    <UCard
      v-if="selecionada"
      class="col-start-1 row-start-3"
      :ui="{ body: 'flex h-full flex-col gap-3 p-5 sm:p-5' }"
    >
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-center gap-4">
          <h2 class="text-card font-bold text-highlighted">
            Chance ao longo da noite
          </h2>
          <p class="text-legenda text-muted">
            {{ selecionada.nome }} selecionada no mapa
          </p>
        </div>
        <BadgeOcupacao :estado="selecionada.estado" />
      </div>
      <GraficoDaNoite :pontos="noite" :altura="176" />
    </UCard>

    <CardMelhorChance
      v-if="melhor"
      :previsao="melhor"
      etiqueta="Melhor chance agora"
      grande
      class="col-start-2 row-start-1"
    >
      <template #acao>
        <UButton
          :to="`/ruas/${melhor.ruaId}/rota`"
          size="lg"
          icon="i-lucide-navigation"
          class="h-11 shrink-0 bg-(--paro-azul) text-(--paro-asfalto) hover:bg-(--paro-azul)/90"
        >
          Como chegar
        </UButton>
      </template>
    </CardMelhorChance>

    <UCard
      class="col-start-2 row-start-2 min-h-0"
      :ui="{ body: 'flex h-full min-h-0 flex-col gap-2 p-5 sm:p-5' }"
    >
      <div class="flex items-start justify-between">
        <h2 class="text-card font-bold text-highlighted">Ruas por perto</h2>
        <ULink
          to="/ruas"
          class="flex items-center gap-1 text-legenda font-bold text-primary"
        >
          Ver todas <UIcon name="i-lucide-arrow-right" class="size-4" />
        </ULink>
      </div>
      <LegendaOcupacao />
      <ul
        class="-mr-2 min-h-0 flex-1 divide-y divide-default overflow-y-auto pr-2"
      >
        <li v-for="previsao in ruasPorPerto" :key="previsao.ruaId">
          <CardRua :previsao="previsao" :to="`/ruas/${previsao.ruaId}`" seta />
        </li>
      </ul>
    </UCard>

    <div class="col-start-2 row-start-3 grid grid-cols-2 gap-4">
      <UCard :ui="{ body: 'flex h-full flex-col gap-3 p-5 sm:p-5' }">
        <div class="flex items-center justify-between">
          <h2 class="etiqueta text-muted">Minha vaga</h2>
          <UBadge
            v-if="vaga"
            color="neutral"
            variant="soft"
            class="rounded-full bg-accented"
          >
            <span class="size-2 rounded-full bg-primary" /> Ativa
          </UBadge>
        </div>
        <template v-if="vaga">
          <div>
            <p class="text-card font-bold text-highlighted">
              {{ vaga.nomeDaRua }}
            </p>
            <p class="text-legenda text-muted">perto da {{ referencia }}</p>
          </div>
          <dl class="grid grid-cols-2 gap-2">
            <div>
              <dd class="text-stat font-extrabold">
                {{ formatarHora(vaga.chegada) }}
              </dd>
              <dt class="text-nota text-muted">desde</dt>
            </div>
            <div>
              <dd class="text-stat font-extrabold">
                {{
                  vaga.saidaPrevista
                    ? formatarHoraCompacta(vaga.saidaPrevista)
                    : "—"
                }}
              </dd>
              <dt class="text-nota text-muted">saída prevista</dt>
            </div>
          </dl>
          <UButton
            block
            icon="i-lucide-log-out"
            class="mt-auto h-11"
            @click="$emit('sair')"
          >
            Estou saindo
          </UButton>
        </template>
        <template v-else>
          <p class="text-legenda text-muted">Nenhuma vaga registrada agora.</p>
          <UButton
            to="/vaga/registrar"
            block
            icon="i-lucide-square-parking"
            class="mt-auto h-11"
          >
            Estacionei agora
          </UButton>
        </template>
      </UCard>

      <UCard :ui="{ body: 'flex h-full flex-col gap-3 p-5 sm:p-5' }">
        <h2 class="etiqueta text-muted">
          Da pesquisa · n={{ pesquisa?.respostasValidas ?? 0 }}
        </h2>
        <ul class="flex flex-col gap-2">
          <li
            v-for="indicador in indicadores"
            :key="indicador.rotulo"
            class="flex items-center gap-3"
          >
            <GraficoAnel
              :percentual="Number.parseInt(indicador.valor)"
              :rotulo="indicador.rotulo"
              :tamanho="40"
              :espessura="5"
            />
            <span class="text-legenda text-highlighted">{{
              indicador.rotulo
            }}</span>
          </li>
        </ul>
        <ULink
          to="/pesquisa"
          class="mt-auto flex items-center gap-1 text-interface font-bold text-primary"
        >
          Ver pesquisa <UIcon name="i-lucide-arrow-right" class="size-4" />
        </ULink>
      </UCard>
    </div>
  </div>
</template>
