<script setup lang="ts">
import type { Vaga } from '#shared/types/vaga'

const rota = useRoute()
const id = computed(() => String(rota.params.id))
const { data: vaga, error } = await useFetch<Vaga>(() => `/api/vagas/${id.value}`, { key: `vaga-${id.value}` })
const { lerPonto } = usePontoDaVaga()
const { areaAtual } = useAreaAtual()
const ponto = ref<[number, number] | null>(null)

if (error.value || !vaga.value) throw createError({ statusCode: 404, statusMessage: 'Vaga não encontrada neste aparelho', fatal: true })

useSeoMeta({ title: () => `${vaga.value ? formatarDataCurta(vaga.value.chegada) : 'Vaga'} · Parô` })

onMounted(() => {
  ponto.value = lerPonto(id.value)
})

const tempo = useTempoNaVaga(() => vaga.value?.chegada, () => vaga.value?.saida)
</script>

<template>
  <div
    v-if="vaga"
    class="flex flex-col gap-5 lg:mx-auto lg:max-w-xl lg:p-8"
  >
    <CabecalhoDeTarefa
      :titulo="formatarDataCurta(vaga.chegada)"
      voltar-para="/vaga"
    />
    <div class="h-44 overflow-hidden rounded-card ring-1 ring-default">
      <MapaDaVaga
        :trajeto="vaga.trajeto"
        :ponto="ponto"
        :rotulo-do-carro="`Você parou aqui · ${formatarHora(vaga.chegada)}`"
        :rota="false"
      />
    </div>
    <div>
      <h2 class="text-stat font-bold text-highlighted">
        {{ vaga.nomeDaRua }}
      </h2>
      <p class="text-legenda text-muted">
        perto da {{ areaAtual?.nomeDaReferencia ?? 'ESAMC' }}
      </p>
    </div>
    <UCard :ui="{ body: 'flex flex-col gap-2 p-4 sm:p-4' }">
      <EtiquetaDeSecao texto="Linha do tempo" />
      <LinhaDoTempoDeVagas :vagas="[vaga]" />
    </UCard>
    <UCard :ui="{ body: 'px-4 py-1 sm:px-4 sm:py-1' }">
      <dl class="divide-y divide-default">
        <LinhaDeInformacao
          rotulo="Chegada"
          :valor="formatarHora(vaga.chegada)"
        />
        <LinhaDeInformacao
          rotulo="Saída"
          :valor="formatarHora(vaga.saida)"
        />
        <LinhaDeInformacao
          rotulo="Tempo na vaga"
          :valor="tempo"
        />
        <LinhaDeInformacao rotulo="Chance ao chegar">
          <BadgeOcupacao
            :estado="vaga.estadoNaChegada"
            :chance="vaga.chanceNaChegada"
          />
        </LinhaDeInformacao>
      </dl>
    </UCard>
    <p
      v-if="vaga.previsaoAjudou !== null"
      class="flex items-center gap-3 rounded-alerta bg-muted px-4 py-3 text-corpo text-highlighted"
    >
      <UIcon
        :name="vaga.previsaoAjudou ? 'i-lucide-thumbs-up' : 'i-lucide-thumbs-down'"
        class="size-5 text-primary"
      />
      Você disse que a previsão {{ vaga.previsaoAjudou ? 'ajudou' : 'não ajudou' }}
    </p>
    <UButton
      :to="`/ruas/${vaga.ruaId}`"
      block
      size="xl"
      color="neutral"
      variant="outline"
      icon="i-lucide-map"
      class="h-13 text-destaque"
    >
      Ver rua no mapa
    </UButton>
  </div>
</template>
