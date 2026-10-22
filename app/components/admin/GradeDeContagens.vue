<script setup lang="ts">
import { classificarOcupacao } from '#shared/utils/ocupacao'
import type { LinhaDaGrade } from '~/composables/useAdmin'

const linhas = defineModel<LinhaDaGrade[]>({ required: true })

function paraNumero(valor: string | number | null | undefined): number | null {
  if (valor === '' || valor === null || valor === undefined) return null
  const numero = Number(valor)
  return Number.isFinite(numero) ? Math.trunc(numero) : null
}

function estadoDaLinha(linha: LinhaDaGrade) {
  if (problemaDaLinha(linha) || linha.vagasTotais === null || linha.vagasOcupadas === null) return null
  return classificarOcupacao(taxaDeOcupacao(linha.vagasTotais, linha.vagasOcupadas))
}

function usarMesmoTotal() {
  const total = linhas.value.find(linha => linha.vagasTotais !== null)?.vagasTotais ?? null
  if (total === null) return
  linhas.value = linhas.value.map(linha => ({ ...linha, vagasTotais: linha.vagasTotais ?? total }))
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <p class="text-legenda text-muted">
        Deixe em branco as faixas que não foram contadas.
      </p>
      <UButton
        color="neutral"
        variant="outline"
        icon="i-lucide-copy"
        size="sm"
        @click="usarMesmoTotal"
      >
        Repetir o total nas faixas vazias
      </UButton>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full border-collapse text-left">
        <caption class="sr-only">
          Contagem de vagas por faixa de 30 minutos
        </caption>
        <thead>
          <tr class="bg-muted">
            <th
              scope="col"
              class="etiqueta px-3 py-2 text-muted"
            >
              Faixa
            </th>
            <th
              scope="col"
              class="etiqueta px-3 py-2 text-muted"
            >
              Vagas totais
            </th>
            <th
              scope="col"
              class="etiqueta px-3 py-2 text-muted"
            >
              Ocupadas
            </th>
            <th
              scope="col"
              class="etiqueta px-3 py-2 text-muted"
            >
              Situação
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-default">
          <tr
            v-for="linha in linhas"
            :key="linha.faixa"
          >
            <th
              scope="row"
              class="px-3 py-2 text-corpo font-bold text-highlighted"
            >
              {{ linha.faixa.replace(':', 'h') }}
            </th>
            <td class="px-3 py-2">
              <UInput
                :model-value="linha.vagasTotais ?? undefined"
                type="number"
                inputmode="numeric"
                min="1"
                max="500"
                class="w-24"
                :aria-label="`Vagas totais às ${linha.faixa}`"
                @update:model-value="linha.vagasTotais = paraNumero($event)"
              />
            </td>
            <td class="px-3 py-2">
              <UInput
                :model-value="linha.vagasOcupadas ?? undefined"
                type="number"
                inputmode="numeric"
                min="0"
                max="500"
                class="w-24"
                :aria-label="`Vagas ocupadas às ${linha.faixa}`"
                @update:model-value="linha.vagasOcupadas = paraNumero($event)"
              />
            </td>
            <td class="px-3 py-2">
              <p
                v-if="problemaDaLinha(linha)"
                class="text-legenda font-bold text-highlighted"
                role="alert"
              >
                {{ problemaDaLinha(linha) }}
              </p>
              <BadgeOcupacao
                v-else-if="estadoDaLinha(linha)"
                :estado="estadoDaLinha(linha) ?? 'sem_dado'"
              />
              <span
                v-else
                class="text-legenda text-muted"
              >—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
