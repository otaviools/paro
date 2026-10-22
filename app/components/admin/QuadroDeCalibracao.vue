<script setup lang="ts">
import type { LinhaDeCalibracao } from '#shared/types/admin'

defineProps<{ linhas: LinhaDeCalibracao[] }>()

const emPercentual = (valor: number) => `${Math.round(valor * 100)}%`

function diferenca(linha: LinhaDeCalibracao): string {
  if (linha.mediaDoCampo === null) return '—'
  const pontos = Math.round((linha.mediaDoCampo - linha.valorDaTabela) * 100)
  return pontos === 0 ? 'igual' : `${pontos > 0 ? '+' : ''}${pontos} p.p.`
}
</script>

<template>
  <UCard :ui="{ body: 'flex flex-col gap-4 p-5 sm:p-6' }">
    <div>
      <h2 class="text-card font-bold text-highlighted">
        Relatos × Campo
      </h2>
      <p class="text-legenda text-muted">
        Ocupação que cada resposta vale na tabela e a ocupação média contada em campo na mesma rua, dia e faixa. Ajuste a tabela em shared/utils/relato.ts quando houver pares suficientes.
      </p>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full border-collapse text-left">
        <caption class="sr-only">
          Comparação entre a tabela de relatos e as contagens de campo
        </caption>
        <thead>
          <tr class="bg-muted">
            <th
              v-for="titulo in ['Resposta', 'Na tabela', 'No campo', 'Diferença', 'Pares']"
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
            :key="`${linha.tipo}-${linha.resposta}`"
          >
            <th
              scope="row"
              class="px-3 py-2 text-interface font-bold text-highlighted"
            >
              {{ linha.rotulo }}
            </th>
            <td class="px-3 py-2 text-interface">
              {{ emPercentual(linha.valorDaTabela) }}
            </td>
            <td class="px-3 py-2 text-interface">
              {{ linha.mediaDoCampo === null ? '—' : emPercentual(linha.mediaDoCampo) }}
            </td>
            <td class="px-3 py-2 text-interface text-muted">
              {{ diferenca(linha) }}
            </td>
            <td class="px-3 py-2 text-interface">
              {{ linha.pares }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </UCard>
</template>
