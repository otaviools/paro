<script setup lang="ts">
useSeoMeta({ title: 'Escolher local · Parô' })

const { areas, areaAtual, escolherArea } = useAreaAtual()
const { preferencias, salvar } = usePreferencias()
const { localizar, buscando } = useLocalizacao()
const filtro = ref('')

const areasFiltradas = computed(() => {
  const termo = filtro.value.trim().toLowerCase()
  return areas.value.filter(area => !termo || `${area.nome} ${area.cidade} ${area.nomeDaReferencia}`.toLowerCase().includes(termo))
})

async function escolher(id: string) {
  escolherArea(id)
  if (preferencias.value.consentimento) await salvar({ areaPadraoId: id })
  await navigateTo('/')
}

async function usarLocalizacao() {
  const posicao = await localizar()
  if (!posicao) return
  const maisPerto = [...areas.value]
    .filter(area => area.ruasMedidas > 0)
    .sort((a, b) => distanciaEmMetros(posicao, a.referencia.coordinates) - distanciaEmMetros(posicao, b.referencia.coordinates))[0]
  if (maisPerto) await escolher(maisPerto.id)
}
</script>

<template>
  <div class="flex flex-col gap-6 lg:mx-auto lg:max-w-xl lg:p-8">
    <CabecalhoDeTarefa titulo="Escolher local" />
    <UInput
      v-model="filtro"
      icon="i-lucide-search"
      placeholder="Bairro ou endereço"
      size="xl"
      class="w-full"
      aria-label="Bairro ou endereço"
      :ui="{ base: 'h-13 bg-elevated text-corpo' }"
    />
    <UButton
      color="neutral"
      variant="soft"
      size="xl"
      icon="i-lucide-locate-fixed"
      class="h-13 text-destaque text-primary underline"
      :loading="buscando"
      @click="usarLocalizacao"
    >
      Usar minha localização
    </UButton>

    <section class="flex flex-col gap-3">
      <EtiquetaDeSecao texto="Áreas com previsão" />
      <UCard :ui="{ body: 'px-4 py-1 sm:px-4 sm:py-1' }">
        <ul class="divide-y divide-default">
          <li
            v-for="area in areasFiltradas"
            :key="area.id"
          >
            <button
              type="button"
              class="flex w-full items-center gap-3 py-4 text-left outline-primary focus-visible:outline-2 disabled:cursor-not-allowed"
              :disabled="area.ruasMedidas === 0"
              :aria-current="area.id === areaAtual?.id ? 'true' : undefined"
              @click="escolher(area.id)"
            >
              <UIcon
                name="i-lucide-map-pin"
                class="size-5 shrink-0"
                :class="area.ruasMedidas ? 'text-primary' : 'text-muted'"
              />
              <span class="min-w-0 flex-1">
                <span
                  class="block text-corpo font-bold"
                  :class="area.ruasMedidas ? 'text-highlighted' : 'text-muted'"
                >
                  {{ area.nome }}<template v-if="area.ruasMedidas"> · entorno da {{ area.nomeDaReferencia }}</template>
                </span>
                <span class="block text-legenda text-muted">
                  {{ area.ruasMedidas ? `${area.ruasMedidas} ruas medidas` : 'ainda sem medição' }}
                </span>
              </span>
              <UIcon
                v-if="area.id === areaAtual?.id"
                name="i-lucide-check"
                class="size-5 text-primary"
              />
              <UBadge
                v-else-if="!area.ruasMedidas"
                label="Em breve"
                color="neutral"
                variant="soft"
                class="rounded-badge"
              />
            </button>
          </li>
        </ul>
      </UCard>
      <p class="text-legenda text-muted">
        Por enquanto, o Parô mede o entorno da ESAMC. Novas áreas entram conforme as medições de campo.
      </p>
    </section>
  </div>
</template>
