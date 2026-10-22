<script setup lang="ts">
const rota = useRoute()
const ruaId = computed(() => String(rota.params.id))

const tela = useTelaDeRuas(ruaId)
const { ordem, previsoes, tabela, aPartirDeVoce } = tela
const [, , { data: detalhe, error }, { data: noite }] = await tela.carregar()
const { data: mapa } = await useMapaDaArea(tela.horario)
const { rotuloDoMomento } = useHorario()
const telaGrande = useTelaGrande()

if (error.value)
  throw createError({
    statusCode: 404,
    statusMessage: 'Rua não encontrada',
    fatal: true,
  })

useSeoMeta({ title: () => `${detalhe.value?.previsao.nome ?? 'Rua'} · Parô` })

const temPrevisao = computed(() => Boolean(detalhe.value?.previsao.chance))
const maisPerto = computed(() =>
  previsoes.data.value.find(previsao => previsao.chance !== null),
)
const referencia = computed(
  () => (mapa.value?.referencia.coordinates ?? [0, 0]) as [number, number],
)

const mapaDaRua = computed(() => {
  if (!mapa.value || !detalhe.value) return null
  return {
    ...mapa.value,
    ruas: {
      ...mapa.value.ruas,
      features: mapa.value.ruas.features.filter(
        feature => feature.properties.ruaId === ruaId.value,
      ),
    },
  }
})

// Rota pelas ruas da referência (ESAMC) até a rua, sem nenhum dado da pessoa.
const destinoDaRua = computed<[number, number] | null>(() => {
  if (!detalhe.value) return null
  return (
    detalhe.value.destino
    ?? verticeMaisProximo(referencia.value, detalhe.value.trajeto)
  )
})
const { pontos: caminho } = useRota(referencia, destinoDaRua, 'carro')
</script>

<template>
  <div>
    <CabecalhoPainel titulo="Ruas" />
    <div
      v-if="detalhe"
      class="-mx-6 -mt-12 flex flex-col lg:hidden"
    >
      <template v-if="temPrevisao">
        <div class="relative h-64">
          <MapaDeRuas
            v-if="mapaDaRua && !telaGrande"
            :mapa="mapaDaRua"
            :selecionada="ruaId"
            :popup="false"
            :controles="false"
          >
            <MapRoute
              :pontos="caminho"
              enquadrar
            />
          </MapaDeRuas>
          <div class="absolute top-12 left-6 z-10 flex items-center gap-3">
            <CabecalhoDeTarefa
              titulo="Mapa"
              discreto
              voltar-para="/mapa"
            />
          </div>
        </div>
        <div
          class="relative -mt-6 rounded-t-[24px] bg-default px-6 pt-3 pb-6 shadow-[0_-8px_24px_rgb(0_0_0/0.06)]"
        >
          <span
            class="mx-auto mb-4 block h-1 w-10 rounded-full bg-accented"
            aria-hidden="true"
          />
          <PainelDaRua
            :detalhe="detalhe"
            :noite="noite"
            :momento="rotuloDoMomento"
          />
        </div>
      </template>
      <div
        v-else
        class="flex flex-col gap-5 px-6 pt-12"
      >
        <CabecalhoMobile local />
        <SemDadoDaRua
          :previsao="detalhe.previsao"
          :faixa="detalhe.faixa"
          :mais-perto="maisPerto"
        />
      </div>
    </div>
    <RuasDesktop
      v-model:ordem="ordem"
      :linhas="tabela.linhas.value"
      :selecionada="ruaId"
      :detalhe="detalhe"
      :noite="noite"
      :contraste="tabela.contraste.value"
      :base="tabela.base.value"
      :a-partir-de-voce="aPartirDeVoce"
      @selecionar="navigateTo(`/ruas/${$event}`, { replace: true })"
    />
  </div>
</template>
