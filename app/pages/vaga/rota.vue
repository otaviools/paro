<script setup lang="ts">
definePageMeta({ layout: 'foco' })
useSeoMeta({ title: 'Voltar até o carro · Parô' })

const { painel, vagaAtual, lerPonto } = useVaga()
await painel
const { posicao, localizar } = useLocalizacao()
const { areaAtual } = useAreaAtual()
const ponto = ref<[number, number] | null>(null)

if (!vagaAtual.value) await navigateTo('/vaga', { replace: true })

onMounted(async () => {
  if (vagaAtual.value) ponto.value = lerPonto(vagaAtual.value.id)
  await localizar(true)
})

const destino = computed<[number, number]>(() => ponto.value ?? (vagaAtual.value ? pontoMedio(vagaAtual.value.trajeto) : [0, 0]))
const origem = computed<[number, number]>(() => posicao.value ?? ((areaAtual.value?.referencia.coordinates ?? destino.value) as [number, number]))
const distancia = computed(() => distanciaEmMetros(origem.value, destino.value))
</script>

<template>
  <div
    v-if="vagaAtual"
    class="-mx-6 -mt-12 flex min-h-dvh flex-col lg:mx-auto lg:mt-0 lg:max-w-3xl lg:gap-6 lg:p-8"
  >
    <div class="relative h-[55dvh] lg:h-96 lg:overflow-hidden lg:rounded-card">
      <MapaDaVaga
        :trajeto="vagaAtual.trajeto"
        :ponto="ponto"
        :posicao="origem"
        :rotulo-do-carro="`Você parou aqui · ${formatarHora(vagaAtual.chegada)}`"
        controles
        @localizar="localizar"
      />
      <div class="absolute top-12 left-6 z-10 lg:top-4 lg:left-4">
        <UButton
          icon="i-lucide-chevron-left"
          aria-label="Voltar"
          color="neutral"
          variant="outline"
          class="size-10 justify-center bg-elevated"
          to="/vaga"
        />
      </div>
    </div>
    <div class="relative -mt-6 flex flex-1 flex-col gap-4 rounded-t-[24px] bg-default px-6 pt-3 pb-8 lg:mt-0 lg:rounded-none lg:px-0">
      <span
        class="mx-auto block h-1 w-10 rounded-full bg-accented lg:hidden"
        aria-hidden="true"
      />
      <h1 class="flex flex-wrap items-baseline gap-x-3">
        <span class="text-numero font-extrabold text-highlighted">{{ formatarDistancia(distancia) }}</span>
        <span class="text-interface text-muted">cerca de {{ minutosAPe(distancia) }} min a pé até o carro</span>
      </h1>
      <p class="text-interface text-muted">
        {{ vagaAtual.nomeDaRua }} · perto da {{ areaAtual?.nomeDaReferencia ?? 'ESAMC' }}
      </p>
      <p
        v-if="!posicao"
        class="text-nota text-muted"
      >
        Distância a partir da {{ areaAtual?.nomeDaReferencia ?? 'referência' }}. Ligue a localização para usar sua posição.
      </p>
      <UButton
        to="/vaga?sair=1"
        block
        size="xl"
        icon="i-lucide-log-out"
        trailing-icon="i-lucide-chevron-right"
        class="h-14 text-botao"
      >
        Estou saindo
      </UButton>
      <UButton
        :href="`https://www.google.com/maps/dir/?api=1&destination=${destino[1]},${destino[0]}&travelmode=walking`"
        target="_blank"
        rel="noopener noreferrer"
        block
        size="xl"
        color="neutral"
        variant="outline"
        icon="i-lucide-external-link"
        class="h-13 text-destaque"
      >
        Abrir no app de mapas
      </UButton>
    </div>
  </div>
</template>
