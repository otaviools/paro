<script setup lang="ts">
import type { AcertoDaPrevisao } from '#shared/types/admin'

defineProps<{ linhas: AcertoDaPrevisao[] }>()

const rotuloDaOrigem: Record<string, string> = {
  campo: 'Contagem de campo',
  pesquisa: 'Pesquisa',
  combinada: 'Campo, pesquisa e relatos',
  sem_rua: 'Tela inicial',
}

function percentual(linha: AcertoDaPrevisao): string {
  const total = linha.ajudou + linha.naoAjudou
  return total ? `${Math.round((linha.ajudou / total) * 100)}%` : '—'
}
</script>

<template>
  <UCard :ui="{ body: 'flex flex-col gap-4 p-5 sm:p-6' }">
    <div>
      <h2 class="text-card font-bold text-highlighted">
        A previsão ajudou?
      </h2>
      <p class="text-legenda text-muted">
        Respostas de quem registrou a saída, por rua e pela origem da chance mostrada na chegada. Vagas somem depois de 90 dias.
      </p>
    </div>
    <p
      v-if="linhas.length === 0"
      class="text-legenda text-muted"
    >
      Nenhuma resposta ainda.
    </p>
    <div
      v-else
      class="overflow-x-auto"
    >
      <table class="w-full border-collapse text-left">
        <caption class="sr-only">
          Taxa de acerto da previsão por rua e origem
        </caption>
        <thead>
          <tr class="bg-muted">
            <th
              v-for="titulo in ['Rua', 'Origem', 'Ajudou', 'Não ajudou', 'Acerto']"
              :key="titulo"
              scope="col"
              class="etiqueta px-3 py-2 text-muted"
            >
              {{ titulo }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-default">
          <tr
            v-for="linha in linhas"
            :key="`${linha.ruaId}-${linha.origem}`"
          >
            <th
              scope="row"
              class="px-3 py-2 text-interface font-bold text-highlighted"
            >
              {{ linha.nome }}
            </th>
            <td class="px-3 py-2 text-interface text-muted">
              {{ linha.origem ? rotuloDaOrigem[linha.origem] : 'Sem previsão' }}
            </td>
            <td class="px-3 py-2 text-interface">
              {{ linha.ajudou }}
            </td>
            <td class="px-3 py-2 text-interface">
              {{ linha.naoAjudou }}
            </td>
            <td class="px-3 py-2 text-corpo font-bold text-highlighted">
              {{ percentual(linha) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </UCard>
</template>
