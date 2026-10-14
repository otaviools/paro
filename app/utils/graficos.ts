import type { CustomSeriesRenderItemAPI, EChartsOption } from 'echarts'
import type { CoresDoGrafico } from '~/composables/useTemaDoGrafico'

export interface TomDoGrafico {
  fundo: string
  texto: string
}

export interface ItemDaLinhaDoTempo {
  rotulo: string
  inicio: number
  fim: number
  previsto: number | null
  ativa: boolean
}

export interface MarcoDaLinhaDoTempo {
  minutos: number
  rotulo: string
  destaque?: boolean
  alinhamento?: 'left' | 'center' | 'right'
}

interface DadosDeColunas {
  rotulos: string[]
  valores: number[]
  destaques: boolean[]
  eixo?: string
  quebrarRotulo?: number
  sufixoDaDica?: string
}

interface DadosDeBarras {
  rotulos: string[]
  valores: number[]
  destaques: boolean[]
}

interface DadosDeEmpilhado {
  grupos: string[]
  opcoes: string[]
  valores: number[][]
  tons: TomDoGrafico[]
}

interface DadosDaLinhaDoTempo {
  itens: ItemDaLinhaDoTempo[]
  marcos: MarcoDaLinhaDoTempo[]
}

interface DadosDeRosca {
  rotulos: string[]
  valores: number[]
  tons: string[]
  indiceDestaque: number
}

interface DadosDeBarrasRadiais {
  rotulos: string[]
  descricoes: string[]
  valores: number[]
}

type Parametro = { name: string, seriesName: string, value: number, dataIndex: number }

const FONTE = '"Manrope Variable", "Manrope", system-ui, sans-serif'
const SEM_LINHA = { axisLine: { show: false }, axisTick: { show: false } }

function base(cores: CoresDoGrafico, animar: boolean): EChartsOption {
  return {
    animation: animar,
    animationDuration: 500,
    animationEasing: 'cubicOut',
    textStyle: { fontFamily: FONTE, color: cores.texto },
  }
}

function dica(cores: CoresDoGrafico, formatar: (parametro: Parametro) => string): EChartsOption['tooltip'] {
  return {
    trigger: 'item',
    // Com posição em um dos lados, o ECharts desenha a seta do tooltip apontando para o elemento.
    position: 'top',
    backgroundColor: cores.superficie,
    borderColor: cores.borda,
    borderWidth: 1,
    padding: [8, 12],
    textStyle: { fontFamily: FONTE, color: cores.texto, fontSize: 13 },
    extraCssText: 'border-radius:10px;box-shadow:none;',
    formatter: (parametro: unknown) => formatar(parametro as Parametro),
  }
}

function corPorDestaque(cores: CoresDoGrafico, destaques: boolean[]) {
  return (_valor?: string | number, indice?: number) => (destaques[indice ?? -1] ? cores.destaque : cores.texto)
}

/** Colunas verticais com uma coluna em destaque. Eixo Y opcional de 0% a 100%. */
export function opcaoDeColunas(cores: CoresDoGrafico, animar: boolean, dados: DadosDeColunas): EChartsOption {
  const comEixo = Boolean(dados.eixo)
  return {
    ...base(cores, animar),
    grid: { left: 0, right: 0, top: comEixo ? 36 : 24, bottom: 0, containLabel: true },
    tooltip: dica(cores, ({ name, value }) => `<b>${name}</b>: ${value}%${dados.sufixoDaDica ?? ''}`),
    xAxis: eixoXDeColunas(cores, dados),
    yAxis: eixoYDeColunas(cores, dados.eixo),
    series: [serieDeColunas(cores, dados)],
  }
}

function eixoXDeColunas(cores: CoresDoGrafico, dados: DadosDeColunas): EChartsOption['xAxis'] {
  return {
    type: 'category',
    data: dados.rotulos,
    axisTick: { show: false },
    axisLine: { lineStyle: { color: cores.borda } },
    axisLabel: {
      interval: 0,
      color: cores.textoFraco,
      fontSize: 12,
      lineHeight: 15,
      margin: 10,
      width: dados.quebrarRotulo,
      overflow: dados.quebrarRotulo ? 'break' : 'none',
      formatter: (valor: string, indice: number) => (dados.destaques[indice]
        ? valor.split('\n').map(linha => `{destaque|${linha}}`).join('\n')
        : valor),
      rich: { destaque: { color: cores.destaque, fontWeight: 700, fontSize: 12, lineHeight: 15 } },
    },
  }
}

function eixoYDeColunas(cores: CoresDoGrafico, nome: string | undefined): EChartsOption['yAxis'] {
  const comEixo = Boolean(nome)
  return {
    type: 'value',
    show: comEixo,
    min: 0,
    max: comEixo ? 100 : undefined,
    interval: 50,
    name: nome,
    nameLocation: 'end',
    nameGap: 16,
    nameTextStyle: { color: cores.textoFraco, fontSize: 12, align: 'left' },
    axisLabel: { color: cores.textoFraco, fontSize: 12, formatter: '{value}%' },
    splitLine: { show: comEixo, lineStyle: { color: cores.grade, type: 'dashed' } },
  }
}

function serieDeColunas(cores: CoresDoGrafico, dados: DadosDeColunas) {
  return {
    type: 'bar' as const,
    barMaxWidth: 44,
    barMinHeight: 3,
    data: dados.valores.map((valor, indice) => ({
      value: valor,
      itemStyle: { color: dados.destaques[indice] ? cores.destaque : cores.barra, borderRadius: [6, 6, 0, 0] },
      label: { color: dados.destaques[indice] ? cores.destaque : cores.texto },
    })),
    label: { show: true, position: 'top' as const, formatter: '{c}%', fontSize: 13, fontWeight: 700, distance: 6 },
    emphasis: { itemStyle: { opacity: 0.85 } },
  }
}

/** Barras horizontais: rótulo acima da barra, percentual à direita. */
export function opcaoDeBarras(cores: CoresDoGrafico, animar: boolean, dados: DadosDeBarras): EChartsOption {
  return {
    ...base(cores, animar),
    grid: { left: 0, right: 0, top: 0, bottom: 0, containLabel: true },
    tooltip: dica(cores, ({ name, value }) => `<b>${name}</b>: ${value}%`),
    xAxis: { type: 'value', show: false, min: 0, max: Math.max(1, ...dados.valores) },
    yAxis: eixosDeBarras(cores, dados),
    series: [{
      type: 'bar',
      barWidth: 8,
      showBackground: true,
      backgroundStyle: { color: cores.trilha, borderRadius: 4 },
      data: dados.valores.map((valor, indice) => ({
        value: valor,
        itemStyle: { color: dados.destaques[indice] ? cores.destaque : cores.barra, borderRadius: 4 },
      })),
      emphasis: { itemStyle: { opacity: 0.85 } },
    }],
  }
}

function eixosDeBarras(cores: CoresDoGrafico, dados: DadosDeBarras): EChartsOption['yAxis'] {
  const cor = corPorDestaque(cores, dados.destaques)
  return [
    {
      type: 'category',
      inverse: true,
      data: dados.rotulos,
      ...SEM_LINHA,
      axisLabel: { inside: true, align: 'left', verticalAlign: 'bottom', padding: [0, 0, 10, 0], fontSize: 14, color: cor },
    },
    {
      type: 'category',
      inverse: true,
      position: 'right',
      data: dados.valores.map(valor => `${valor}%`),
      ...SEM_LINHA,
      axisLabel: { fontSize: 13, fontWeight: 700, margin: 12, color: cor },
    },
  ]
}

/** Barras 100% empilhadas, uma por grupo de respondentes. */
export function opcaoDeEmpilhado(cores: CoresDoGrafico, animar: boolean, dados: DadosDeEmpilhado): EChartsOption {
  return {
    ...base(cores, animar),
    grid: { left: 0, right: 0, top: 0, bottom: dados.opcoes.length > 3 ? 56 : 28, containLabel: true },
    tooltip: dica(cores, ({ name, seriesName, value }) => `${name}<br><b>${seriesName}</b>: ${value}%`),
    legend: {
      bottom: 0,
      left: 0,
      icon: 'roundRect',
      itemGap: 8,
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { color: cores.textoFraco, fontSize: 11, fontFamily: FONTE },
      inactiveColor: cores.grade,
    },
    xAxis: { type: 'value', show: false, min: 0, max: 100 },
    yAxis: {
      type: 'category',
      inverse: true,
      data: dados.grupos,
      ...SEM_LINHA,
      axisLabel: { fontSize: 12, color: cores.textoFraco, formatter: (valor: string) => valor.replace(/ \(n=\d+\)$/, '') },
    },
    series: dados.opcoes.map((opcao, indice) => segmentoEmpilhado(cores, dados, opcao, indice)),
  }
}

function segmentoEmpilhado(cores: CoresDoGrafico, dados: DadosDeEmpilhado, opcao: string, indice: number) {
  const ultima = dados.opcoes.length - 1
  const tom = dados.tons[indice] ?? { fundo: cores.neutro, texto: cores.texto }
  return {
    type: 'bar' as const,
    name: opcao,
    stack: 'total',
    barMaxWidth: 22,
    barWidth: '55%',
    data: dados.valores.map(linha => linha[indice] ?? 0),
    itemStyle: {
      color: tom.fundo,
      borderColor: cores.superficie,
      borderWidth: 1,
      borderRadius: indice === 0 ? [8, 0, 0, 8] : indice === ultima ? [0, 8, 8, 0] : 0,
    },
    label: {
      show: true,
      position: 'inside' as const,
      fontSize: 12,
      fontWeight: 700,
      color: tom.texto,
      formatter: (parametro: unknown) => {
        const { value } = parametro as Parametro
        return value >= 14 ? `${value}%` : ''
      },
    },
    emphasis: { focus: 'series' as const },
  }
}

/** Rosca de composição (partes de um todo que somam 100%), com legenda à direita e destaque no centro. */
export function opcaoDeRosca(cores: CoresDoGrafico, animar: boolean, dados: DadosDeRosca): EChartsOption {
  return {
    ...base(cores, animar),
    tooltip: dica(cores, ({ name, value }) => `<b>${name}</b>: ${value}%`),
    legend: legendaDaRosca(cores, dados),
    series: [{
      type: 'pie',
      center: ['25%', '50%'],
      radius: ['34%', '54%'],
      padAngle: 1.5,
      startAngle: 90,
      labelLine: { show: false },
      itemStyle: { borderRadius: 4, borderColor: cores.superficie, borderWidth: 1 },
      emphasis: { scale: true, scaleSize: 4, label: { show: false } },
      data: dados.valores.map((valor, indice) => ({
        name: dados.rotulos[indice],
        value: valor,
        itemStyle: { color: dados.tons[indice] ?? cores.neutro },
        label: indice === dados.indiceDestaque ? rotuloCentral(cores, valor) : { show: false },
      })),
    }],
  }
}

function encurtar(texto: string, limite: number): string {
  return texto.length > limite ? `${texto.slice(0, limite - 1).trimEnd()}…` : texto
}

function rotuloCentral(cores: CoresDoGrafico, valor: number) {
  return {
    show: true,
    position: 'center' as const,
    formatter: `{v|${valor}%}`,
    rich: { v: { fontSize: 22, fontWeight: 800, color: cores.destaque, fontFamily: FONTE } },
  }
}

function legendaDaRosca(cores: CoresDoGrafico, dados: DadosDeRosca): EChartsOption['legend'] {
  return {
    orient: 'vertical',
    right: 0,
    top: 'middle',
    icon: 'roundRect',
    itemWidth: 10,
    itemHeight: 10,
    itemGap: 10,
    formatter: (nome: string) => `{n|${encurtar(nome, 11)}}{v|${dados.valores[dados.rotulos.indexOf(nome)] ?? 0}%}`,
    textStyle: {
      rich: {
        n: { width: 72, color: cores.texto, fontSize: 12, fontFamily: FONTE },
        v: { width: 30, align: 'right', color: cores.texto, fontSize: 12, fontWeight: 700, fontFamily: FONTE },
      },
    },
    inactiveColor: cores.grade,
  }
}

/** Barras radiais: cada percentual é um arco de até 270°, com o rótulo no quadrante livre. */
export function opcaoDeBarrasRadiais(cores: CoresDoGrafico, animar: boolean, dados: DadosDeBarrasRadiais): EChartsOption {
  const maximo = 100 / 0.75
  return {
    ...base(cores, animar),
    tooltip: dica(cores, ({ dataIndex, value }) => `<b>${dados.descricoes[dataIndex] ?? ''}</b>: ${value}%`),
    polar: { center: ['60%', '52%'], radius: ['20%', '94%'] },
    angleAxis: { max: maximo, startAngle: 90, show: false },
    radiusAxis: { type: 'category', data: dados.rotulos, show: false },
    series: [
      {
        type: 'bar',
        coordinateSystem: 'polar',
        silent: true,
        barWidth: '62%',
        roundCap: true,
        data: dados.valores.map(() => ({ value: 100, itemStyle: { color: cores.trilha } })),
      },
      {
        type: 'bar',
        coordinateSystem: 'polar',
        barWidth: '62%',
        barGap: '-100%',
        roundCap: true,
        data: dados.valores.map((valor, indice) => ({ value: valor, itemStyle: { color: indice === 0 ? cores.destaque : cores.barra } })),
        label: { show: true, position: 'start', align: 'right', distance: 6, formatter: '{c}% {b}', fontSize: 11, fontWeight: 700, color: cores.texto },
      },
    ],
  }
}

/** Anel de proporção: um percentual sobre a trilha. */
export function opcaoDeAnel(cores: CoresDoGrafico, animar: boolean, percentual: number, espessura = 14): EChartsOption {
  const valor = Math.min(100, Math.max(0, percentual))
  return {
    ...base(cores, animar),
    series: [{
      type: 'pie',
      radius: [`${100 - espessura * 2}%`, '100%'],
      startAngle: 90,
      silent: true,
      label: { show: false },
      labelLine: { show: false },
      data: [
        { value: valor, itemStyle: { color: cores.destaque, borderRadius: valor < 100 ? 8 : 0 } },
        { value: 100 - valor, itemStyle: { color: cores.trilha } },
      ],
    }],
  }
}

export function rotuloDeMinutos(minutos: number): string {
  const hora = Math.floor(minutos / 60) % 24
  const minuto = Math.round(minutos % 60)
  return minuto === 0 ? `${hora}h` : `${hora}h${String(minuto).padStart(2, '0')}`
}

/** Linha do tempo horizontal (chegada → saída) por vaga, com marcos opcionais. */
export function opcaoDeLinhaDoTempo(cores: CoresDoGrafico, animar: boolean, dados: DadosDaLinhaDoTempo): EChartsOption {
  const comMarcos = dados.marcos.length > 0
  return {
    ...base(cores, animar),
    grid: { left: 0, right: 8, top: comMarcos ? 24 : 4, bottom: 0, containLabel: true },
    tooltip: dica(cores, ({ dataIndex }) => dicaDaLinhaDoTempo(dados.itens[dataIndex])),
    xAxis: eixoDeHorario(cores, dados),
    yAxis: {
      type: 'category',
      inverse: true,
      data: dados.itens.map(item => item.rotulo),
      ...SEM_LINHA,
      axisLabel: { color: cores.textoFraco, fontSize: 12, margin: 12 },
    },
    series: [{
      type: 'custom',
      encode: { x: [1, 2], y: 0 },
      data: dados.itens.map((item, indice) => [indice, item.inicio, item.fim, item.previsto ?? item.fim]),
      renderItem: (_parametros, api) => desenharPeriodo(cores, dados.itens, api) as never,
      markLine: comMarcos ? marcosDaLinhaDoTempo(cores, dados.marcos) : undefined,
    }],
  }
}

function dicaDaLinhaDoTempo(item: ItemDaLinhaDoTempo | undefined): string {
  if (!item) return ''
  const fim = item.ativa ? `agora (${rotuloDeMinutos(item.fim)})` : rotuloDeMinutos(item.fim)
  const previsto = item.previsto === null ? '' : `<br>saída prevista ${rotuloDeMinutos(item.previsto)}`
  return `<b>${item.rotulo}</b><br>${rotuloDeMinutos(item.inicio)} → ${fim}${previsto}`
}

function eixoDeHorario(cores: CoresDoGrafico, dados: DadosDaLinhaDoTempo): EChartsOption['xAxis'] {
  const limites = dados.itens
    .flatMap(item => [item.inicio, item.fim, item.previsto ?? item.fim])
    .concat(dados.marcos.map(marco => marco.minutos))
  const minimo = Math.floor((Math.min(...limites) - 15) / 60) * 60
  const maximo = Math.ceil((Math.max(...limites) + 15) / 60) * 60
  return {
    type: 'value',
    min: minimo,
    max: maximo,
    interval: maximo - minimo > 6 * 60 ? 120 : 60,
    ...SEM_LINHA,
    axisLabel: { color: cores.textoFraco, fontSize: 12, formatter: (valor: number) => rotuloDeMinutos(valor) },
    splitLine: { lineStyle: { color: cores.grade, type: 'dashed' } },
  }
}

function desenharPeriodo(cores: CoresDoGrafico, itens: ItemDaLinhaDoTempo[], api: CustomSeriesRenderItemAPI) {
  const indice = Number(api.value(0))
  const ativa = itens[indice]?.ativa ?? false
  const [xInicio = 0, y = 0] = api.coord([Number(api.value(1)), indice])
  const [xFim = 0] = api.coord([Number(api.value(2)), indice])
  const [xPrevisto = 0] = api.coord([Number(api.value(3)), indice])
  const banda = (api.size?.([0, 1]) as number[] | undefined)?.[1] ?? 28
  const altura = Math.min(14, banda * 0.5)
  const raio = altura / 2
  const filhos: object[] = []
  if (ativa && xPrevisto > xFim) {
    filhos.push({
      type: 'rect',
      shape: { x: xInicio, y: y - raio, width: xPrevisto - xInicio, height: altura, r: raio },
      style: { fill: 'transparent', stroke: cores.destaque, lineWidth: 1.2, lineDash: [4, 3] },
    })
  }
  filhos.push(
    { type: 'rect', shape: { x: xInicio, y: y - raio, width: Math.max(altura, xFim - xInicio), height: altura, r: raio }, style: { fill: ativa ? cores.destaque : cores.barra } },
    { type: 'circle', shape: { cx: xInicio + raio, cy: y, r: raio * 0.45 }, style: { fill: ativa ? cores.textoInvertido : cores.superficie } },
  )
  return { type: 'group', children: filhos }
}

function marcosDaLinhaDoTempo(cores: CoresDoGrafico, marcos: MarcoDaLinhaDoTempo[]) {
  return {
    silent: true,
    symbol: 'none',
    animation: false,
    data: marcos.map((marco) => {
      const cor = marco.destaque ? cores.destaque : cores.textoFraco
      return {
        xAxis: marco.minutos,
        lineStyle: { color: cor, type: 'dashed' as const, width: 1 },
        label: {
          formatter: marco.rotulo,
          position: 'start' as const,
          align: marco.alinhamento ?? 'center',
          distance: 6,
          color: cor,
          fontSize: 11,
          fontWeight: 700,
        },
      }
    }),
  }
}

export { base as baseDoGrafico, dica as dicaDoGrafico, FONTE as FONTE_DO_GRAFICO }
