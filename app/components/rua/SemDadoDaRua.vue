<script setup lang="ts">
import type { PrevisaoRua } from '#shared/types/previsao'

defineProps<{ previsao: PrevisaoRua, faixa: string, maisPerto: PrevisaoRua | undefined }>()
</script>

<template>
  <div class="flex flex-col gap-5">
    <div>
      <h1 class="text-titulo font-bold text-highlighted">
        {{ previsao.nome }}
      </h1>
      <ULink
        to="/busca"
        class="flex items-center gap-1 text-legenda font-bold text-primary"
      >
        <UIcon
          name="i-lucide-search"
          class="size-4"
        /> Buscar outra rua
      </ULink>
    </div>
    <EstadoVazio
      icone="i-lucide-map-pin"
      titulo="Ainda não medimos esta rua"
      :texto="`Sem medição para ${faixa.replace(':', 'h')}, então não dá para estimar a chance de vaga aqui. Veja ruas próximas com previsão.`"
    >
      <UButton
        to="/ruas"
        block
        size="xl"
        class="mt-2 h-13 text-destaque"
      >
        Ver ruas medidas por perto
      </UButton>
      <UButton
        :to="{ path: '/sugerir', query: { rua: previsao.nome } }"
        icon="i-lucide-plus"
        variant="link"
        class="text-interface"
      >
        Sugerir esta rua para medição
      </UButton>
    </EstadoVazio>
    <section
      v-if="maisPerto"
      class="flex flex-col gap-3"
    >
      <EtiquetaDeSecao
        texto="Mais perto, com previsão"
        :nota="maisPerto.medidoEm ? `medido às ${formatarHora(maisPerto.medidoEm)}` : undefined"
      />
      <UCard :ui="{ root: 'rounded-lista', body: 'px-4 py-0 sm:px-4 sm:py-0' }">
        <CardRua
          :previsao="maisPerto"
          :to="`/ruas/${maisPerto.ruaId}`"
        />
      </UCard>
    </section>
  </div>
</template>
