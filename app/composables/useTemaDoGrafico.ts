import { usePreferredReducedMotion } from '@vueuse/core'

export interface CoresDoGrafico {
  destaque: string
  barra: string
  segmento: string
  ceu: string
  neutro: string
  pedra: string
  escuro: string
  trilha: string
  texto: string
  textoFraco: string
  textoInvertido: string
  fundoInvertido: string
  superficie: string
  borda: string
  grade: string
}

const variaveis: Record<keyof CoresDoGrafico, string> = {
  destaque: '--app-grafico-destaque',
  barra: '--app-grafico-barra',
  segmento: '--app-grafico-segmento',
  ceu: '--app-grafico-ceu',
  neutro: '--app-grafico-neutro',
  pedra: '--app-grafico-pedra',
  escuro: '--app-grafico-escuro',
  trilha: '--app-grafico-trilha',
  texto: '--ui-text-highlighted',
  textoFraco: '--ui-text-muted',
  textoInvertido: '--ui-text-inverted',
  fundoInvertido: '--ui-bg-inverted',
  superficie: '--ui-bg-elevated',
  borda: '--ui-border',
  grade: '--ui-border-muted',
}

// Valores do tema claro, usados no servidor e antes da leitura das variáveis CSS.
const coresPadrao: CoresDoGrafico = {
  destaque: '#2F5DB3',
  barra: '#8CB0EE',
  segmento: '#8CB0EE',
  ceu: '#C3D2D7',
  neutro: '#D9D3C0',
  pedra: '#8F8A7E',
  escuro: '#615F59',
  trilha: '#F3ECD4',
  texto: '#32312C',
  textoFraco: '#615F59',
  textoInvertido: '#FFF9E3',
  fundoInvertido: '#32312C',
  superficie: '#FFF9E3',
  borda: 'rgb(50 49 44 / 0.15)',
  grade: 'rgb(50 49 44 / 0.10)',
}

function lerCores(): CoresDoGrafico {
  const estilo = getComputedStyle(document.documentElement)
  const entradas = Object.entries(variaveis).map(([chave, variavel]) => [
    chave,
    estilo.getPropertyValue(variavel).trim() || coresPadrao[chave as keyof CoresDoGrafico],
  ])
  return Object.fromEntries(entradas) as CoresDoGrafico
}

export function useTemaDoGrafico() {
  const colorMode = useColorMode()
  const movimento = usePreferredReducedMotion()
  const cores = shallowRef<CoresDoGrafico>(coresPadrao)

  onMounted(() => {
    cores.value = lerCores()
    watch(() => colorMode.value, () => requestAnimationFrame(() => {
      cores.value = lerCores()
    }))
  })

  const animar = computed(() => movimento.value !== 'reduce')

  return { cores, animar }
}
