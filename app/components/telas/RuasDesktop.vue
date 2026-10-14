<script setup lang="ts">
import type { DetalheRua, PontoDaNoite } from '#shared/types/previsao'
import type { LinhaDaTabela } from '~/components/rua/TabelaDeRuas.vue'

defineProps<{
  linhas: LinhaDaTabela[]
  selecionada: string | undefined
  detalhe: DetalheRua | null
  noite: PontoDaNoite[]
  contraste: { titulo: string, texto: string } | null
  base: number
}>()

const ordem = defineModel<'chance' | 'distancia'>('ordem', { required: true })
defineEmits<{ selecionar: [ruaId: string] }>()

const opcoesDeOrdem = [
  { label: 'Ordenar: maior chance', value: 'chance' },
  { label: 'Ordenar: mais perto', value: 'distancia' },
]
</script>

<template>
  <!-- As duas colunas têm a mesma altura; a tabela e o detalhe rolam por dentro se não couberem. -->
  <div class="hidden min-h-0 flex-1 grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)] gap-4 p-6 lg:grid">
    <UCard :ui="{ root: 'flex min-h-0 flex-col', body: 'flex min-h-0 flex-1 flex-col p-0 sm:p-0' }">
      <div class="flex shrink-0 items-start justify-between gap-4 p-6">
        <div class="flex flex-col gap-2">
          <h2 class="text-card font-bold text-highlighted">
            Ruas medidas
          </h2>
          <LegendaOcupacao />
        </div>
        <USelect
          v-model="ordem"
          :items="opcoesDeOrdem"
          icon="i-lucide-arrow-down-up"
          class="w-56"
          aria-label="Ordenar ruas"
        />
      </div>
      <div class="min-h-0 flex-1 overflow-y-auto">
        <TabelaDeRuas
          :linhas="linhas"
          :selecionada="selecionada"
          @selecionar="$emit('selecionar', $event)"
        />
      </div>
      <div class="flex shrink-0 flex-col gap-4 p-6">
        <UAlert
          v-if="contraste"
          icon="i-lucide-info"
          color="neutral"
          variant="soft"
          :title="contraste.titulo"
          :description="contraste.texto"
          :ui="{ root: 'rounded-alerta bg-accented', title: 'text-corpo font-bold', description: 'text-interface', icon: 'text-primary' }"
        />
        <p class="text-nota text-muted">
          Situação e chance: faixas estimadas a partir de medições de campo. Previsão, não garantia. Citada na pesquisa: % dos {{ base }} respondentes que indicaram onde costumam conseguir vaga; cada pessoa podia marcar mais de uma rua.
        </p>
      </div>
    </UCard>
    <UCard
      v-if="detalhe"
      :ui="{ root: 'flex min-h-0 flex-col', body: 'min-h-0 flex-1 overflow-y-auto p-6 sm:p-6' }"
    >
      <PainelDaRua
        v-if="detalhe.previsao.chance"
        :detalhe="detalhe"
        :noite="noite"
        completo
      />
      <SemDadoDaRua
        v-else
        :previsao="detalhe.previsao"
        :faixa="detalhe.faixa"
        :mais-perto="undefined"
      />
    </UCard>
  </div>
</template>
