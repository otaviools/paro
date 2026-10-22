<script setup lang="ts">
import { notaDaBase, PERGUNTA_ROTINA } from '#shared/utils/pesquisa'
import type {
  GrupoDeRespostas,
  LinhaDaPesquisa,
  ResumoDaPesquisa,
} from '#shared/types/pesquisa'
import type { ItemDoPainel } from '~/utils/graficosDoPainel'

useSeoMeta({ title: 'Parô | Pesquisa' })

const { data: pesquisa } = await usePesquisa()

const GRUPOS = ['Todos', 'Motoristas', 'Não motoristas']
const grupo = ref('Todos')

// Perguntas sem recorte por grupo usam o total ("Todos").
function respostas(numero: number): GrupoDeRespostas | undefined {
  const pergunta = pesquisa.value?.perguntas.find(
    item => item.pergunta === numero,
  )
  return (
    pergunta?.grupos.find(item => item.grupo === grupo.value)
    ?? pergunta?.grupos[0]
  )
}

function soma(numero: number, opcoes: string[]): number {
  return (respostas(numero)?.opcoes ?? [])
    .filter(opcao => opcoes.includes(opcao.opcao))
    .reduce((total, opcao) => total + opcao.percentual, 0)
}

// Rótulos de eixo em uma linha: opções longas ganham um nome curto (o tooltip mantém o completo).
const ROTULOS_CURTOS: Record<string, string> = {
  'Carona, aplicativo ou táxi': 'Carona ou app',
}

function itens(numero: number, destaque?: string): ItemDoPainel[] {
  const dados = respostas(numero)
  return (dados?.opcoes ?? []).map(opcao => ({
    rotulo: opcao.opcao,
    percentual: opcao.percentual,
    pessoas: Math.round((opcao.percentual * (dados?.base ?? 0)) / 100),
    destaque: opcao.opcao === destaque,
    rotuloCurto: ROTULOS_CURTOS[opcao.opcao],
  }))
}

const base = computed(() =>
  grupo.value === 'Todos'
    ? (pesquisa.value?.respostasValidas ?? 0)
    : (respostas(6)?.base ?? 0),
)
const imprevisivel = computed(() =>
  Number.parseInt(pesquisa.value?.indicadores[1]?.valor ?? '0'),
)

// Só as perguntas 5 e 6 têm recorte por grupo; os demais KPIs mostram o total e ganham a marca "total".
const recortado = computed(() => grupo.value !== 'Todos')

const kpis = computed(() => [
  {
    valor: String(base.value),
    rotulo: 'Respostas',
    guia: 'Pessoas que aceitaram o termo e responderam. Muda com o filtro de grupo.',
    destaque: true,
  },
  {
    valor: `${soma(1, ['Carro próprio'])}%`,
    rotulo: 'Vão de carro',
    total: recortado.value,
    guia: 'Chegam à região de carro próprio.',
  },
  {
    valor: `${soma(2, ['18h30–19h59'])}%`,
    rotulo: 'Pico 18h30–19h59',
    total: recortado.value,
    guia: 'Chegam entre 18h30 e 19h59, a faixa mais disputada.',
  },
  {
    valor: `${soma(3, ['10 a 20 min', '20 a 30 min', 'mais de 30 min'])}%`,
    rotulo: 'Busca +10 min',
    total: recortado.value,
    guia: 'Levam mais de 10 minutos para achar vaga.',
  },
  {
    valor: `${imprevisivel.value}%`,
    rotulo: 'Vaga imprevisível',
    total: recortado.value,
    guia: 'Acham pouco previsível conseguir vaga (base: 85 motoristas e caronas).',
  },
  {
    valor: `${soma(5, ['Mais ruim que bom', 'Ruim'])}%`,
    rotulo: 'Trecho a pé ruim',
    guia: 'Avaliam o trecho a pé como ruim ou mais ruim que bom. Muda com o filtro de grupo.',
  },
  {
    valor: `${soma(6, ['Sim', 'Talvez'])}%`,
    rotulo: 'Usariam o Parô',
    guia: 'Responderam sim ou talvez. Muda com o filtro de grupo.',
  },
  {
    valor: `${soma(PERGUNTA_ROTINA, ['fazem sempre ou quase sempre o mesmo trajeto'])}%`,
    rotulo: 'Mesmo trajeto',
    total: recortado.value,
    guia: 'Fazem sempre ou quase sempre o mesmo caminho até a região.',
  },
])

const abasDeDistribuicao = [
  { label: 'Horário de chegada', value: '2' },
  { label: 'Tempo de busca', value: '3' },
  { label: 'Como chegam', value: '1' },
]
const distribuicao = ref('2')
const destaquesDaDistribuicao: Record<string, string> = {
  1: 'Carro próprio',
  2: '18h30–19h59',
  3: '5 a 10 min',
}

const abasDeRanking = [
  { label: 'Ruas citadas', value: '4' },
  { label: 'Como ajudariam', value: '8' },
]
const ranking = ref('4')

const linhas = computed<LinhaDaPesquisa[]>(() =>
  (pesquisa.value?.perguntas ?? []).flatMap((pergunta) => {
    const dados = respostas(pergunta.pergunta)
    return (dados?.opcoes ?? []).map(opcao => ({
      numero: pergunta.pergunta,
      pergunta: pergunta.titulo,
      grupo: dados?.grupo ?? 'Todos',
      resposta: opcao.opcao,
      percentual: opcao.percentual,
      pessoas: Math.round((opcao.percentual * (dados?.base ?? 0)) / 100),
      base: dados?.base ?? 0,
    }))
  }),
)

function exportarResumo() {
  if (!pesquisa.value) return
  const blob = new Blob(
    [`${String.fromCharCode(0xfeff)}${montarCsv(pesquisa.value)}`],
    { type: 'text/csv;charset=utf-8' },
  )
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'paro-resumo-da-pesquisa.csv'
  link.click()
  URL.revokeObjectURL(link.href)
}

function montarCsv(resumo: ResumoDaPesquisa): string {
  const linhasDoCsv = resumo.perguntas.flatMap(pergunta =>
    pergunta.grupos.flatMap(dados =>
      dados.opcoes.map(opcao => [
        pergunta.titulo,
        dados.grupo,
        dados.base,
        opcao.opcao,
        opcao.percentual,
      ]),
    ),
  )
  return [['pergunta', 'grupo', 'base', 'opcao', 'percentual'], ...linhasDoCsv]
    .map(colunas =>
      colunas
        .map(valor => `"${String(valor).replace(/"/g, '""')}"`)
        .join(';'),
    )
    .join('\n')
}
</script>

<template>
  <div v-if="pesquisa">
    <CabecalhoPainel titulo="Pesquisa">
      <USelect
        v-model="grupo"
        :items="GRUPOS"
        icon="i-lucide-users"
        aria-label="Filtrar por grupo"
        variant="soft"
        class="h-10 w-52"
        :ui="{
          base: 'bg-(--app-campo) hover:bg-(--app-campo)/80 focus:bg-(--app-campo)',
        }"
      />
      <UPopover
        arrow
        :content="{ side: 'bottom', align: 'end' }"
      >
        <UButton
          color="neutral"
          variant="soft"
          icon="i-lucide-info"
          class="h-10 bg-(--app-campo) text-muted hover:bg-(--app-campo)/80"
        >
          Sobre a base
        </UButton>
        <template #content>
          <p class="max-w-80 p-3 text-legenda text-highlighted">
            {{ notaDaBase }}
          </p>
        </template>
      </UPopover>
      <UTooltip
        text="Exportar resumo (CSV)"
        arrow
      >
        <UButton
          icon="i-lucide-download"
          square
          color="neutral"
          variant="soft"
          class="size-10 justify-center bg-(--app-campo) hover:bg-(--app-campo)/80"
          aria-label="Exportar resumo (CSV)"
          @click="exportarResumo"
        />
      </UTooltip>
    </CabecalhoPainel>

    <div
      class="flex flex-col gap-3 lg:grid lg:min-h-0 lg:flex-1 lg:grid-cols-12 lg:grid-rows-[auto_minmax(0,1fr)_minmax(0,1fr)] lg:gap-4 lg:p-6"
    >
      <CabecalhoMobile
        titulo="Pesquisa"
        :subtitulo="`${pesquisa.respostasValidas} respostas válidas`"
        :tema="false"
      />
      <USelect
        v-model="grupo"
        :items="GRUPOS"
        icon="i-lucide-users"
        aria-label="Filtrar por grupo"
        class="h-11 w-full lg:hidden"
      />

      <div
        class="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:col-span-12 lg:grid-cols-8"
      >
        <KpiDaPesquisa
          v-for="kpi in kpis"
          :key="kpi.rotulo"
          v-bind="kpi"
        />
      </div>

      <CardDoPainel
        titulo="Distribuição"
        guia="Cada coluna mostra o % de respondentes em uma opção; a trilha ao fundo vai até o maior valor. A coluna azul forte é o destaque da pergunta. Passe o mouse para ver a quantidade estimada de pessoas."
        :meta="respostas(Number(distribuicao))?.grupo"
        class="lg:col-span-7"
      >
        <template #acoes>
          <UTabs
            v-model="distribuicao"
            :items="abasDeDistribuicao"
            :content="false"
            size="xs"
            variant="pill"
          />
        </template>
        <GraficoDoPainel
          tipo="colunas"
          :itens="
            itens(Number(distribuicao), destaquesDaDistribuicao[distribuicao])
          "
          :rotulo="
            abasDeDistribuicao.find((aba) => aba.value === distribuicao)
              ?.label ?? ''
          "
        />
      </CardDoPainel>

      <CardDoPainel
        titulo="Trecho a pé"
        guia="Como avaliam o trecho a pé até o destino. Na rosa, o raio da fatia cresce com o percentual; os rótulos mostram pessoas estimadas e %. Muda com o filtro de grupo."
        :meta="respostas(5)?.grupo"
        class="lg:col-span-5"
      >
        <GraficoDoPainel
          tipo="rosa"
          :itens="itens(5)"
          rotulo="Avaliação do trecho a pé"
        />
      </CardDoPainel>

      <CardDoPainel
        titulo="Ranking"
        guia="Opções ordenadas pela mais citada. Nestas perguntas cada pessoa podia marcar mais de uma opção, então a soma passa de 100%."
        :meta="respostas(Number(ranking))?.grupo"
        class="lg:col-span-5"
      >
        <template #acoes>
          <UTabs
            v-model="ranking"
            :items="abasDeRanking"
            :content="false"
            size="xs"
            variant="pill"
          />
        </template>
        <GraficoDoPainel
          tipo="ranking"
          :itens="
            itens(
              Number(ranking),
              ranking === '4'
                ? 'Av. Vasconcelos Costa'
                : 'Localização só quando eu ligar',
            )
          "
          :rotulo="
            abasDeRanking.find((aba) => aba.value === ranking)?.label ?? ''
          "
        />
      </CardDoPainel>

      <CardDoPainel
        titulo="Tabela de dados"
        guia="Todas as respostas, uma linha por opção. Pessoas é uma estimativa (% × base, arredondado). Perguntas sem recorte por grupo mostram o total."
        :meta="`${linhas.length} linhas`"
        class="lg:col-span-7"
      >
        <TabelaDaPesquisa :linhas="linhas" />
      </CardDoPainel>

      <p class="text-nota text-muted lg:hidden">
        {{ notaDaBase }}
      </p>
      <UButton
        color="neutral"
        variant="outline"
        icon="i-lucide-download"
        block
        class="h-12 lg:hidden"
        @click="exportarResumo"
      >
        Exportar resumo
      </UButton>
    </div>
  </div>
</template>
