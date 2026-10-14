import { hojePorExtenso, horariosDasAbas, rotuloDaFaixa } from '#shared/utils/horario'

export const AGORA = 'agora'

export function useHorario() {
  const selecionado = useState<string>('horario', () => AGORA)

  const horario = computed<string | undefined>(() => (selecionado.value === AGORA ? undefined : selecionado.value))

  const abas = computed(() => [
    { label: 'Agora', value: AGORA },
    ...horariosDasAbas.map(faixa => ({ label: rotuloDaFaixa(faixa), value: faixa })),
  ])

  const rotuloDoMomento = computed(() => (horario.value ? `às ${rotuloDaFaixa(horario.value)}` : 'agora'))

  const hoje = computed(() => hojePorExtenso())

  return { selecionado, horario, abas, rotuloDoMomento, hoje }
}
