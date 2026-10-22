<script setup lang="ts">
import type {
  MapaDaArea,
  PontoDaNoite,
  PrevisaoRua,
} from '#shared/types/previsao'
import type { ResumoDaPesquisa } from '#shared/types/pesquisa'
import type { Vaga } from '#shared/types/vaga'

const props = defineProps<{
  mapa: MapaDaArea | null
  previsoes: PrevisaoRua[]
  melhor: PrevisaoRua | undefined
  selecionada: PrevisaoRua | undefined
  noite: PontoDaNoite[]
  vaga: Vaga | null
  pesquisa: ResumoDaPesquisa | null
  posicao: [number, number] | null
  referencia: string
  telaGrande: boolean
}>()

defineEmits<{
  selecionar: [ruaId: string | undefined]
  sair: []
  localizar: []
}>()

const ruasPorPerto = computed(() =>
  props.previsoes.filter(previsao => previsao.temMedicao).slice(0, 5),
)
const indicadores = computed(() => props.pesquisa?.indicadores ?? [])
</script>

<template>
  <!--
    Guia de layout: 12 colunas com 16 px entre elas e 3 linhas que ocupam a altura que sobra da tela.
    Toda borda de card cai numa linha do guia:
      colunas 1–6  → mapa (linhas 1–2) e "Chance ao longo da noite" (linha 3)
      colunas 7–12 → "Melhor chance" (linha 1) e "Ruas por perto" (linha 2)
      linha 3      → "Minha vaga" (colunas 7–9) e "Da pesquisa" (colunas 10–12)
    O mapa termina junto com "Ruas por perto", e a linha 3 tem a mesma altura nos três cards.
    Sem medição não há "Melhor chance" nem gráfico da noite: "Ruas por perto" sobe para a linha 1
    e o mapa desce até a linha 3, para nenhuma linha vazia deixar bordas desencontradas.
    Todos os cards usam 20 px de respiro interno, para os textos começarem no mesmo recuo.
  -->
  <div
    class="hidden min-h-0 flex-1 grid-cols-12 grid-rows-[auto_minmax(0,1fr)_auto] gap-4 p-6 lg:grid"
  >
    <div
      class="col-span-6 col-start-1 row-start-1 min-h-60 overflow-hidden rounded-card ring-1 ring-default dark:ring-0"
      :class="selecionada ? 'row-span-2' : 'row-span-3'"
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
      class="col-span-6 col-start-1 row-start-3"
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
        <BadgeOcupacao
          :estado="selecionada.estado"
          class="dark:bg-default"
        />
      </div>
      <GraficoDaNoite
        :pontos="noite"
        :altura="176"
      />
    </UCard>

    <CardMelhorChanceGrande
      v-if="melhor"
      :previsao="melhor"
      :referencia="referencia"
      etiqueta="Melhor chance agora"
      class="col-span-6 col-center-7 row-start-1"
    >
      <template #acao>
        <UButton
          :to="`/ruas/${melhor.ruaId}/rota`"
          size="xl"
          icon="i-lucide-navigation"
          trailing-icon="i-lucide-chevron-right"
          class="h-12 w-50 shrink-0 gap-2.5 bg-(--paro-azul) text-corpo text-(--paro-asfalto) hover:bg-(--paro-azul)/90"
        >
          Como chegar
        </UButton>
      </template>
    </CardMelhorChanceGrande>

    <UCard
      class="col-span-6 col-start-7 min-h-0"
      :class="melhor ? 'row-start-2' : 'row-span-2 row-start-1'"
      :ui="{ body: 'flex h-full min-h-0 flex-col gap-2 p-5 sm:p-5' }"
    >
      <div class="flex items-start justify-between">
        <h2 class="text-card font-bold text-highlighted">
          Ruas por perto
        </h2>
        <ULink
          to="/ruas"
          class="flex items-center gap-1 text-legenda font-bold text-primary"
        >
          Ver todas <UIcon
            name="i-lucide-arrow-right"
            class="size-4"
          />
        </ULink>
      </div>
      <LegendaOcupacao />
      <ul
        class="-mr-2 min-h-0 flex-1 divide-y divide-default overflow-y-auto pr-2"
      >
        <li
          v-for="previsao in ruasPorPerto"
          :key="previsao.ruaId"
        >
          <CardRua
            :previsao="previsao"
            :to="`/ruas/${previsao.ruaId}`"
            seta
          />
        </li>
      </ul>
    </UCard>

    <div
      class="col-span-6 col-start-7 row-start-3 grid grid-cols-subgrid gap-4"
    >
      <UCard
        class="col-span-3"
        :ui="{ body: 'flex h-full flex-col gap-3 p-5 sm:p-5' }"
      >
        <div class="flex items-center justify-between">
          <h2 class="etiqueta text-muted">
            Minha vaga
          </h2>
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
            <p class="text-legenda text-muted">
              perto da {{ referencia }}
            </p>
          </div>
          <dl class="grid grid-cols-2 gap-2">
            <div>
              <dd class="text-stat font-extrabold">
                {{ formatarHora(vaga.chegada) }}
              </dd>
              <dt class="text-nota text-muted">
                desde
              </dt>
            </div>
            <div>
              <dd class="text-stat font-extrabold">
                {{
                  vaga.saidaPrevista
                    ? formatarHoraCompacta(vaga.saidaPrevista)
                    : "—"
                }}
              </dd>
              <dt class="text-nota text-muted">
                saída prevista
              </dt>
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
          <p class="text-legenda text-muted">
            Nenhuma vaga registrada agora.
          </p>
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

      <UCard
        class="col-span-3"
        :ui="{ body: 'flex h-full flex-col gap-3 p-5 sm:p-5' }"
      >
        <h2 class="etiqueta text-muted">
          Pesquisa
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
            <span
              class="text-legenda text-highlighted first-letter:uppercase"
            >{{ indicador.rotulo }}</span>
          </li>
        </ul>
        <ULink
          to="/pesquisa"
          class="mt-auto flex items-center gap-1 text-interface font-bold text-primary"
        >
          Ver pesquisa <UIcon
            name="i-lucide-arrow-right"
            class="size-4"
          />
        </ULink>
      </UCard>
    </div>
  </div>
</template>
