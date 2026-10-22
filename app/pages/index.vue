<script setup lang="ts">
useSeoMeta({ title: 'Parô | Visão Geral' })

const { horario } = useHorario()
const { areaAtual } = useAreaAtual()
const { data: previsoes } = await usePrevisoes(horario)
const { data: previsoesDeAgora } = await usePrevisoes(undefined)
const { data: mapa } = await useMapaDaArea(horario)
const { vagaAtual, editar } = useVaga()
const { data: pesquisa } = await usePesquisa()
const { posicao, localizar } = useLocalizacao()
const telaGrande = useTelaGrande()

const melhor = useMelhorChance(previsoes)
const melhorAgora = useMelhorChance(previsoesDeAgora)
const ruaEscolhida = ref<string>()
const selecionada = computed(
  () =>
    previsoes.value.find(previsao => previsao.ruaId === ruaEscolhida.value)
    ?? melhor.value,
)
const { data: noite } = await useNoiteDaRua(
  () => selecionada.value?.ruaId,
  horario,
)

const referencia = computed(() => areaAtual.value?.nomeDaReferencia ?? 'ESAMC')
const feedback = useState<boolean | null>('feedback-de-hoje', () => null)

async function responderFeedback(ajudou: boolean) {
  feedback.value = ajudou
  await $fetch('/api/feedback', { method: 'POST', body: { ajudou } }).catch(
    () => null,
  )
}

async function avisar(ligado: boolean) {
  if (vagaAtual.value)
    await editar(vagaAtual.value.id, { avisarAoSair: ligado })
}

function irParaSaida() {
  return navigateTo('/vaga?sair=1')
}
</script>

<template>
  <div>
    <CabecalhoPainel
      titulo="Visão Geral"
      horario
      busca
    />
    <InicioCelular
      :melhor="melhorAgora"
      :vaga="vagaAtual"
      :saudacao="saudacao()"
      :referencia="referencia"
      :feedback="feedback"
      @feedback="responderFeedback"
      @avisar="avisar"
      @sair="irParaSaida"
    />
    <PainelDesktop
      :mapa="mapa"
      :previsoes="previsoes"
      :melhor="melhor"
      :selecionada="selecionada"
      :noite="noite"
      :vaga="vagaAtual"
      :pesquisa="pesquisa"
      :posicao="posicao"
      :referencia="referencia"
      :tela-grande="telaGrande"
      @selecionar="ruaEscolhida = $event"
      @sair="irParaSaida"
      @localizar="localizar"
    />
  </div>
</template>
