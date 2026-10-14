<script setup lang="ts">
useSeoMeta({ title: 'Buscar · Parô' })

const rota = useRoute()
const termo = ref(typeof rota.query.q === 'string' ? rota.query.q : '')
const { horario, rotuloDoMomento } = useHorario()
const { data: previsoes } = await usePrevisoes(horario)
const { data: resultado, status } = await useBuscaDeRuas(termo, horario)

const medidoEm = computed(() => previsoes.value.find(previsao => previsao.medidoEm)?.medidoEm)
const maisUsadas = computed(() => previsoes.value.filter(previsao => previsao.temMedicao).slice(0, 3))

watch(termo, (valor) => {
  navigateTo({ query: valor ? { q: valor } : {} }, { replace: true })
})

const semResultado = computed(() => resultado.value && !resultado.value.ruas.length && !resultado.value.lugares.length && !resultado.value.semPrevisao.length)
</script>

<template>
  <div class="flex flex-col gap-6 lg:mx-auto lg:max-w-2xl lg:p-8">
    <CabecalhoDeTarefa
      v-if="termo"
      titulo="Buscar"
    />
    <template v-else>
      <CabecalhoMobile local />
      <h1 class="text-titulo font-bold text-highlighted">
        Para onde você vai?
      </h1>
    </template>

    <UInput
      v-model="termo"
      icon="i-lucide-search"
      placeholder="Rua, prédio ou referência"
      size="xl"
      class="w-full"
      aria-label="Rua, prédio ou referência"
      autofocus
      :ui="{ base: 'h-13 bg-elevated text-corpo', trailing: 'pe-2' }"
    >
      <template
        v-if="termo"
        #trailing
      >
        <UButton
          icon="i-lucide-x"
          aria-label="Limpar busca"
          color="neutral"
          variant="link"
          @click="termo = ''"
        />
      </template>
    </UInput>

    <template v-if="!termo">
      <AbasDeHorario mostrar-dia />
      <section class="flex flex-col gap-3">
        <EtiquetaDeSecao
          texto="Ruas que você mais usa"
          :nota="medidoEm ? `medido às ${formatarHora(medidoEm)}` : undefined"
        />
        <ListaDeRuas
          :previsoes="maisUsadas"
          detalhe="leitura"
        />
        <p class="text-nota text-muted">
          Faixas estimadas para {{ rotuloDoMomento }}. Previsão, não garantia.
        </p>
      </section>
      <UButton
        to="/mapa"
        block
        size="xl"
        icon="i-lucide-map"
        trailing-icon="i-lucide-chevron-right"
        class="h-14 justify-start bg-inverted text-botao text-inverted hover:bg-inverted/90 [&>span:last-child]:ml-auto"
      >
        Ver opções no mapa
      </UButton>
    </template>

    <template v-else-if="resultado">
      <section
        v-if="resultado.ruas.length"
        class="flex flex-col gap-3"
      >
        <EtiquetaDeSecao
          texto="Ruas com previsão"
          :nota="resultado.ruas[0]?.medidoEm ? `medido às ${formatarHora(resultado.ruas[0].medidoEm)}` : undefined"
        />
        <UCard
          v-for="previsao in resultado.ruas"
          :key="previsao.ruaId"
          :ui="{ root: 'rounded-lista', body: 'px-4 py-0 sm:px-4 sm:py-0' }"
        >
          <CardRua
            :previsao="previsao"
            :to="`/ruas/${previsao.ruaId}`"
          >
            <template #nome>
              <NomeComDestaque
                :nome="previsao.nome"
                :termo="termo"
              />
            </template>
          </CardRua>
        </UCard>
      </section>

      <section
        v-if="resultado.lugares.length"
        class="flex flex-col gap-3"
      >
        <EtiquetaDeSecao texto="Lugares" />
        <UCard
          v-for="lugar in resultado.lugares"
          :key="lugar.nome"
          :ui="{ root: 'rounded-lista', body: 'p-0 sm:p-0' }"
        >
          <NuxtLink
            to="/ruas"
            class="flex items-center gap-4 p-4"
          >
            <span class="grid size-9 place-items-center rounded-badge bg-muted"><UIcon
              name="i-lucide-building-2"
              class="size-5"
            /></span>
            <span class="min-w-0 flex-1">
              <span class="block text-corpo font-bold text-highlighted">{{ lugar.nome }}</span>
              <span class="block text-legenda text-muted">{{ lugar.descricao }}</span>
            </span>
            <UIcon
              name="i-lucide-chevron-right"
              class="size-5 text-muted"
            />
          </NuxtLink>
        </UCard>
      </section>

      <section
        v-if="resultado.semPrevisao.length"
        class="flex flex-col gap-3"
      >
        <EtiquetaDeSecao texto="Sem previsão ainda" />
        <UCard
          v-for="previsao in resultado.semPrevisao"
          :key="previsao.ruaId"
          :ui="{ root: 'rounded-lista', body: 'px-4 py-0 sm:px-4 sm:py-0' }"
        >
          <NuxtLink
            :to="`/ruas/${previsao.ruaId}`"
            class="flex items-center gap-4 py-3.5"
          >
            <PadraoOcupacao
              estado="sem_dado"
              class="size-9 shrink-0"
            />
            <span class="min-w-0 flex-1">
              <span class="block text-corpo font-bold text-highlighted"><NomeComDestaque
                :nome="previsao.nome"
                :termo="termo"
              /></span>
              <span class="block text-legenda text-muted">Sem dado · ainda não medimos</span>
            </span>
            <UIcon
              name="i-lucide-chevron-right"
              class="size-5 text-muted"
            />
          </NuxtLink>
        </UCard>
      </section>

      <EstadoVazio
        v-if="semResultado"
        icone="i-lucide-map-pin"
        titulo="Nenhuma rua encontrada"
        texto="Ainda não medimos uma rua com esse nome. Você pode sugerir que o Parô meça."
      >
        <UButton
          :to="{ path: '/sugerir', query: { rua: termo } }"
          icon="i-lucide-plus"
          variant="link"
        >
          Sugerir esta rua para medição
        </UButton>
      </EstadoVazio>
    </template>

    <p
      v-else-if="status === 'pending'"
      class="text-legenda text-muted"
      aria-live="polite"
    >
      Buscando…
    </p>
  </div>
</template>
