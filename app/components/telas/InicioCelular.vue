<script setup lang="ts">
import type { PrevisaoRua } from '#shared/types/previsao'
import type { Vaga } from '#shared/types/vaga'

defineProps<{
  melhor: PrevisaoRua | undefined
  vaga: Vaga | null
  saudacao: string
  referencia: string
  feedback: boolean | null
}>()

defineEmits<{
  feedback: [ajudou: boolean]
  avisar: [ligado: boolean]
  sair: []
}>()
const alertaVisivel = ref(true)
</script>

<template>
  <div class="flex flex-col gap-6 lg:hidden">
    <CabecalhoMobile local />

    <template v-if="vaga">
      <UAlert
        v-if="alertaVisivel"
        color="neutral"
        variant="soft"
        icon="i-lucide-square-parking"
        :title="`Você estacionou às ${formatarHora(vaga.chegada)}`"
        :description="`${vaga.nomeDaRua}, perto da ${referencia}`"
        close
        :ui="{
          root: 'rounded-alerta bg-accented',
          title: 'text-corpo font-bold',
          description: 'text-legenda',
        }"
        @update:open="alertaVisivel = $event"
      />
      <CardVagaAtiva
        :vaga="vaga"
        @avisar="$emit('avisar', $event)"
      />
      <UButton
        block
        size="xl"
        icon="i-lucide-log-out"
        trailing-icon="i-lucide-chevron-right"
        class="h-14 text-botao"
        @click="$emit('sair')"
      >
        Estou saindo
      </UButton>
      <UButton
        to="/vaga"
        block
        size="xl"
        color="neutral"
        variant="outline"
        icon="i-lucide-map"
        class="h-13 text-destaque"
      >
        Ver minha vaga no mapa
      </UButton>
    </template>

    <template v-else>
      <div>
        <h1 class="text-titulo font-bold text-highlighted">
          <ClientOnly>
            <span class="text-primary">{{ saudacao }}</span>, Caça-vaga
          </ClientOnly>
        </h1>
      </div>
      <CardMelhorChance
        v-if="melhor"
        :previsao="melhor"
        :etiqueta="`Entorno da ${referencia} · agora`"
      >
        <template #link>
          <ULink
            to="/mapa"
            class="flex items-center gap-1 text-legenda font-bold text-(--paro-azul)"
          >
            Ver no mapa <UIcon
              name="i-lucide-arrow-right"
              class="size-4"
            />
          </ULink>
        </template>
      </CardMelhorChance>
      <EstadoVazio
        v-else
        icone="i-lucide-clock"
        titulo="Sem previsão para agora"
        texto="Ainda não medimos as ruas neste horário. Veja a noite inteira no mapa."
      />
      <UButton
        to="/busca"
        block
        size="xl"
        icon="i-lucide-search"
        trailing-icon="i-lucide-chevron-right"
        class="h-14 justify-start text-botao [&>span:last-child]:ml-auto"
      >
        Procurar vaga
      </UButton>
      <div class="grid grid-cols-2 gap-3">
        <UButton
          to="/vaga/registrar"
          size="xl"
          color="neutral"
          variant="soft"
          icon="i-lucide-square-parking"
          class="h-14 text-destaque"
        >
          Estacionei
        </UButton>
        <UButton
          to="/vaga"
          size="xl"
          color="neutral"
          variant="soft"
          icon="i-lucide-log-out"
          class="h-14 text-destaque"
        >
          Estou saindo
        </UButton>
      </div>
      <FeedbackPrevisao
        class="mt-6"
        :respondido="feedback"
        @responder="$emit('feedback', $event)"
      />
    </template>
  </div>
</template>
