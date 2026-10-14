import type { EChartsOption } from 'echarts'
import type { CoresDoGrafico } from '~/composables/useTemaDoGrafico'
import { baseDoGrafico, dicaDoGrafico, FONTE_DO_GRAFICO } from './graficos'

// Gráficos do painel analítico da pesquisa: colunas com trilha, rosa com rótulos externos e ranking numerado.

export interface ItemDoPainel {
  rotulo: string
  percentual: number
  pessoas: number
  destaque?: boolean
  /** Nome curto só para o eixo; o tooltip mostra sempre o nome completo. */
  rotuloCurto?: string
}

// Espaço reservado à esquerda do ranking para o número e o nome, alinhados à esquerda.
const LARGURA_DO_NOME = 196

const SEM_EIXO = { axisLine: { show: false }, axisTick: { show: false }, splitLine: { show: false } }

function textoDaDica(item: ItemDoPainel | undefined): string {
  if (!item) return ''
  return `<b>${item.rotulo}</b><br>${item.percentual}% · ~${item.pessoas} ${item.pessoas === 1 ? 'pessoa' : 'pessoas'}`
}

/** Colunas sobre uma trilha de altura cheia, com o valor logo acima do preenchimento. */
export function opcaoDeColunasComTrilha(cores: CoresDoGrafico, animar: boolean, itens: ItemDoPainel[]): EChartsOption {
  const maior = Math.max(1, ...itens.map(item => item.percentual))
  return {
    baseOption: {
      ...baseDoGrafico(cores, animar),
      grid: { left: 0, right: 0, top: 4, bottom: 0, containLabel: true },
      tooltip: dicaDoGrafico(cores, ({ dataIndex }) => textoDaDica(itens[dataIndex])),
      xAxis: {
        type: 'category',
        data: itens.map(item => item.rotuloCurto ?? item.rotulo),
        ...SEM_EIXO,
        axisLabel: { interval: 0, color: cores.texto, fontSize: 12, margin: 10, width: 88, overflow: 'truncate' },
      },
      yAxis: { type: 'value', show: false, min: 0, max: maior * 1.18 },
      series: [serieDeColunasComTrilha(cores, itens)],
    },
    // Rótulos sempre em uma linha; em cards estreitos (celular) eles inclinam em vez de se sobrepor.
    media: [{ query: { maxWidth: 520 }, option: { xAxis: { axisLabel: { rotate: 35, fontSize: 11 } } } }],
  }
}

function serieDeColunasComTrilha(cores: CoresDoGrafico, itens: ItemDoPainel[]) {
  return {
    type: 'bar' as const,
    barCategoryGap: '24%',
    showBackground: true,
    backgroundStyle: { color: cores.trilha, borderRadius: 6 },
    data: itens.map(item => ({
      value: item.percentual,
      itemStyle: { color: item.destaque ? cores.destaque : cores.barra, borderRadius: [0, 0, 6, 6] },
    })),
    label: { show: true, position: 'top' as const, distance: 6, formatter: '{c}%', fontSize: 13, fontWeight: 800, color: cores.texto },
    emphasis: { itemStyle: { opacity: 0.85 } },
  }
}

/** Rosa (Nightingale) com rótulos nas bordas, ligados à fatia por uma linha da mesma cor. */
export function opcaoDeRosa(cores: CoresDoGrafico, animar: boolean, itens: ItemDoPainel[], tons: string[]): EChartsOption {
  return {
    baseOption: {
      ...baseDoGrafico(cores, animar),
      tooltip: dicaDoGrafico(cores, ({ dataIndex }) => textoDaDica(itens[dataIndex])),
      legend: { show: false },
      series: [serieDaRosa(cores, itens, tons)],
    },
    // Em cards estreitos (celular) os rótulos externos não cabem: a rosa mostra só o % e ganha legenda embaixo.
    media: [{ query: { maxWidth: 420 }, option: varianteEstreitaDaRosa(cores) }],
  }
}

function varianteEstreitaDaRosa(cores: CoresDoGrafico): EChartsOption {
  return {
    legend: {
      show: true,
      bottom: 0,
      icon: 'roundRect',
      itemWidth: 8,
      itemHeight: 8,
      itemGap: 10,
      textStyle: { color: cores.textoFraco, fontSize: 11, fontFamily: FONTE_DO_GRAFICO },
    },
    series: [{
      center: ['50%', '42%'],
      radius: ['8%', '62%'],
      label: { formatter: '{n|{c}%}' },
      labelLine: { length: 6, length2: 8 },
    }],
  }
}

function serieDaRosa(cores: CoresDoGrafico, itens: ItemDoPainel[], tons: string[]) {
  return {
    type: 'pie' as const,
    roseType: 'radius' as const,
    center: ['50%', '54%'],
    radius: ['10%', '58%'],
    startAngle: 120,
    itemStyle: { borderRadius: 6, borderColor: cores.superficie, borderWidth: 2 },
    label: rotuloDaRosa(cores),
    labelLine: { length: 10, length2: 16, smooth: false },
    labelLayout: { hideOverlap: false },
    data: itens.map((item, indice) => ({
      name: item.rotulo,
      value: item.percentual,
      pessoas: item.pessoas,
      itemStyle: { color: tons[indice] ?? cores.neutro },
      labelLine: { lineStyle: { color: tons[indice] ?? cores.neutro, width: 1 } },
    })),
  }
}

function rotuloDaRosa(cores: CoresDoGrafico) {
  return {
    alignTo: 'labelLine' as const,
    overflow: 'none' as const,
    lineHeight: 15,
    formatter: (parametro: unknown) => {
      const { name, value, data } = parametro as { name: string, value: number, data: { pessoas: number } }
      return `{n|${name}}\n{d|${data.pessoas} pessoas · ${value}%}`
    },
    rich: {
      n: { fontSize: 12, fontWeight: 700, color: cores.texto, fontFamily: FONTE_DO_GRAFICO },
      d: { fontSize: 11, color: cores.textoFraco, fontFamily: FONTE_DO_GRAFICO },
    },
  }
}

/** Ranking horizontal numerado (01, 02…), com trilha e o valor logo após a barra. */
export function opcaoDeRanking(cores: CoresDoGrafico, animar: boolean, itens: ItemDoPainel[]): EChartsOption {
  const maior = Math.max(1, ...itens.map(item => item.percentual))
  return {
    baseOption: {
      ...baseDoGrafico(cores, animar),
      grid: { left: LARGURA_DO_NOME, right: 0, top: 0, bottom: 0 },
      tooltip: dicaDoGrafico(cores, ({ dataIndex }) => textoDaDica(itens[dataIndex])),
      xAxis: { type: 'value', show: false, min: 0, max: maior * 1.28 },
      yAxis: { type: 'category', inverse: true, data: itens.map(item => item.rotulo), ...SEM_EIXO, axisLabel: rotuloDoRanking(cores) },
      series: [serieDoRanking(cores, itens)],
    },
    // Em cards estreitos o nome sobe para cima da barra, liberando a largura toda para ela.
    media: [{
      query: { maxWidth: 420 },
      option: {
        grid: { left: 0 },
        yAxis: { axisLabel: { inside: true, verticalAlign: 'bottom', margin: 0, padding: [0, 0, 12, 0] } },
        series: [{ barMaxWidth: 10 }],
      },
    }],
  }
}

function serieDoRanking(cores: CoresDoGrafico, itens: ItemDoPainel[]) {
  return {
    type: 'bar' as const,
    barWidth: '46%',
    barMaxWidth: 16,
    showBackground: true,
    backgroundStyle: { color: cores.trilha, borderRadius: 4 },
    data: itens.map(item => ({ value: item.percentual, itemStyle: { color: item.destaque ? cores.destaque : cores.barra, borderRadius: 4 } })),
    label: { show: true, position: 'right' as const, distance: 8, formatter: '{c}%', fontSize: 12, fontWeight: 800, color: cores.texto },
    emphasis: { itemStyle: { opacity: 0.85 } },
  }
}

function rotuloDoRanking(cores: CoresDoGrafico) {
  return {
    align: 'left' as const,
    margin: LARGURA_DO_NOME,
    formatter: (valor: string, indice: number) => {
      const curto = valor.length > 24 ? `${valor.slice(0, 23).trimEnd()}…` : valor
      return `{i|${String(indice + 1).padStart(2, '0')}}  {n|${curto}}`
    },
    rich: {
      i: { fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 12, color: cores.textoFraco },
      n: { fontFamily: FONTE_DO_GRAFICO, fontSize: 13, color: cores.texto },
    },
  }
}
