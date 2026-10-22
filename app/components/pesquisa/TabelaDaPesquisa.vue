<script setup lang="ts">
import type { LinhaDaPesquisa } from '#shared/types/pesquisa'

const props = defineProps<{ linhas: LinhaDaPesquisa[] }>()
const busca = ref('')

function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}

const filtradas = computed(() => {
  const termo = normalizar(busca.value.trim())
  if (!termo) return props.linhas
  return props.linhas.filter(linha => normalizar(`${linha.pergunta} ${linha.resposta} ${linha.grupo}`).includes(termo))
})
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col gap-3">
    <UInput
      v-model="busca"
      icon="i-lucide-search"
      placeholder="Buscar pergunta ou resposta"
      aria-label="Buscar pergunta ou resposta"
      class="w-full sm:w-72"
    />
    <div class="-mx-5 min-h-0 flex-1 overflow-auto border-t border-default">
      <table class="w-full min-w-160 text-left text-legenda">
        <thead class="sticky top-0 z-10 bg-default">
          <tr class="border-b border-default text-muted">
            <th class="etiqueta py-3 pr-3 pl-5 font-bold">
              Nº
            </th>
            <th class="etiqueta py-3 pr-3 font-bold">
              Pergunta
            </th>
            <th class="etiqueta py-3 pr-3 font-bold">
              Grupo
            </th>
            <th class="etiqueta py-3 pr-3 font-bold">
              Resposta
            </th>
            <th class="etiqueta py-3 pr-3 text-right font-bold">
              %
            </th>
            <th class="etiqueta py-3 pr-3 text-right font-bold">
              Pessoas
            </th>
            <th class="etiqueta py-3 pr-5 text-right font-bold">
              Base
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-default">
          <tr
            v-for="linha in filtradas"
            :key="`${linha.numero}-${linha.grupo}-${linha.resposta}`"
            class="hover:bg-muted"
          >
            <td class="py-2.5 pr-3 pl-5 font-mono text-muted">
              {{ String(linha.numero).padStart(2, '0') }}
            </td>
            <td class="py-2.5 pr-3 text-highlighted">
              {{ linha.pergunta }}
            </td>
            <td class="py-2.5 pr-3 text-muted">
              {{ linha.grupo }}
            </td>
            <td class="py-2.5 pr-3 font-bold text-highlighted">
              {{ linha.resposta }}
            </td>
            <td class="py-2.5 pr-3 text-right font-mono font-bold text-primary">
              {{ linha.percentual }}%
            </td>
            <td class="py-2.5 pr-3 text-right font-mono text-highlighted">
              ~{{ linha.pessoas }}
            </td>
            <td class="py-2.5 pr-5 text-right font-mono text-muted">
              {{ linha.base }}
            </td>
          </tr>
          <tr v-if="!filtradas.length">
            <td
              colspan="7"
              class="px-5 py-6 text-muted"
            >
              Nada encontrado para “{{ busca }}”.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
