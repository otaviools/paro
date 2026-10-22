<script setup lang="ts">
import { rotulosCurtosDaRotina } from '#shared/utils/pesquisa'
import type { Pergunta } from '#shared/types/pesquisa'

const props = defineProps<{ pergunta: Pergunta, titulo?: string, nota?: string }>()
const opcoes = computed(() => props.pergunta.grupos[0]?.opcoes ?? [])
</script>

<template>
  <UCard :ui="{ root: 'flex h-80 min-h-0 flex-col lg:h-auto', body: 'flex min-h-0 flex-1 flex-col gap-3 p-4 sm:p-4' }">
    <header class="flex items-center gap-2">
      <h2 class="min-w-0 flex-1 truncate text-interface font-bold text-highlighted">
        {{ titulo ?? pergunta.titulo }}
      </h2>
      <UPopover
        mode="hover"
        arrow
        :content="{ side: 'top', align: 'end' }"
      >
        <UButton
          color="neutral"
          variant="ghost"
          size="xs"
          square
          icon="i-lucide-info"
          class="text-muted"
          :aria-label="`Sobre: ${pergunta.titulo}`"
        />
        <template #content>
          <div class="flex max-w-72 flex-col gap-2 p-3 text-legenda text-highlighted">
            <p class="font-bold">
              {{ pergunta.titulo }}
            </p>
            <p>{{ pergunta.resumo }}</p>
            <p
              v-if="nota"
              class="text-muted"
            >
              {{ nota }}
            </p>
          </div>
        </template>
      </UPopover>
    </header>
    <div class="flex min-h-0 flex-1 flex-col">
      <GraficoBarras
        v-if="pergunta.tipo === 'barras'"
        :opcoes="opcoes"
        :destaque="pergunta.destaque"
      />
      <GraficoColunas
        v-else-if="pergunta.tipo === 'colunas'"
        :opcoes="opcoes"
        :destaque="pergunta.destaque"
      />
      <GraficoRosca
        v-else-if="pergunta.tipo === 'rosca'"
        :opcoes="opcoes"
        :destaque="pergunta.destaque"
      />
      <GraficoEmpilhado
        v-else-if="pergunta.tipo === 'empilhado'"
        :grupos="pergunta.grupos"
      />
      <GraficoRadial
        v-else-if="pergunta.tipo === 'numeros'"
        :opcoes="opcoes"
        :rotulos-curtos="rotulosCurtosDaRotina"
      />
    </div>
  </UCard>
</template>
