<script setup lang="ts">
import type { Vaga } from '#shared/types/vaga'

useSeoMeta({ title: 'Saída registrada · Parô' })

const rota = useRoute()
const id = computed(() => String(rota.query.id ?? ''))
const { data: vaga } = await useFetch<Vaga>(() => `/api/vagas/${id.value}`, { key: `vaga-${id.value}` })
const respondido = ref<boolean | null>(vaga.value?.previsaoAjudou ?? null)

if (!vaga.value) await navigateTo('/vaga', { replace: true })

const tempo = useTempoNaVaga(() => vaga.value?.chegada, () => vaga.value?.saida)

async function responder(ajudou: boolean) {
  respondido.value = ajudou
  await $fetch('/api/feedback', { method: 'POST', body: { ajudou, vagaId: id.value } }).catch(() => null)
}
</script>

<template>
  <div
    v-if="vaga"
    class="flex flex-col gap-6 lg:mx-auto lg:max-w-xl lg:p-8"
  >
    <div class="flex flex-col items-center gap-3 pt-6 text-center">
      <span class="grid size-26 place-items-center rounded-full bg-accented">
        <UIcon
          name="i-lucide-circle-check"
          class="size-12 text-primary"
        />
      </span>
      <h1 class="mt-4 text-titulo font-bold text-highlighted">
        Saída registrada às {{ formatarHora(vaga.saida) }}
      </h1>
      <p class="max-w-80 text-corpo text-muted">
        Obrigado. {{ vaga.avisarAoSair ? `Sua saída entra na previsão de quem chega à ${vaga.nomeDaRua}.` : 'Sua vaga foi encerrada.' }}
      </p>
    </div>
    <UCard :ui="{ body: 'px-4 py-1 sm:px-4 sm:py-1' }">
      <dl class="divide-y divide-default">
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
        <LinhaDeInformacao
          rotulo="Horário de chegada"
          :valor="formatarHora(vaga.chegada)"
        />
      </dl>
    </UCard>
    <FeedbackPrevisao
      :respondido="respondido"
      @responder="responder"
    />
    <UButton
      to="/"
      block
      size="xl"
      class="h-14 text-botao"
    >
      Voltar ao início
    </UButton>
    <UButton
      to="/vaga"
      variant="link"
      class="mx-auto text-destaque"
    >
      Ver histórico
    </UButton>
  </div>
</template>
