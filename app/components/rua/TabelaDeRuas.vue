<script setup lang="ts">
import { formatarChance, rotuloDoEstado } from '#shared/utils/ocupacao'
import type { PrevisaoRua } from '#shared/types/previsao'

export interface LinhaDaTabela extends PrevisaoRua {
  citacao: number | null
}

defineProps<{ linhas: LinhaDaTabela[], selecionada?: string }>()
defineEmits<{ selecionar: [ruaId: string] }>()
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full border-collapse text-left">
      <caption class="sr-only">
        Ruas medidas com situação, chance, distância e citação na pesquisa
      </caption>
      <thead>
        <tr class="bg-muted">
          <th
            scope="col"
            class="etiqueta px-6 py-3 text-muted"
          >
            Rua
          </th>
          <th
            scope="col"
            class="etiqueta py-3 text-muted"
          >
            Situação agora
          </th>
          <th
            scope="col"
            class="etiqueta py-3 text-muted"
          >
            Chance agora
          </th>
          <th
            scope="col"
            class="etiqueta py-3 text-muted"
          >
            Distância
          </th>
          <th
            scope="col"
            class="etiqueta py-3 pr-6 text-muted"
          >
            Na pesquisa
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-default">
        <tr
          v-for="linha in linhas"
          :key="linha.ruaId"
          class="cursor-pointer transition"
          :class="linha.ruaId === selecionada ? 'bg-(--paro-azul-texto) **:text-(--paro-creme)!' : 'hover:bg-muted/60'"
          @click="$emit('selecionar', linha.ruaId)"
        >
          <th
            scope="row"
            class="px-6 py-4"
          >
            <button
              type="button"
              class="flex items-center gap-3 text-left text-corpo font-bold text-highlighted outline-primary focus-visible:outline-2"
              :aria-pressed="linha.ruaId === selecionada"
              @click.stop="$emit('selecionar', linha.ruaId)"
            >
              <PadraoOcupacao
                :estado="linha.estado"
                decorativo
                class="size-9 shrink-0"
              />
              {{ linha.nome }}
            </button>
          </th>
          <td class="py-4">
            <span class="flex items-center gap-2 text-interface font-medium">
              <PadraoOcupacao
                :estado="linha.estado"
                decorativo
                class="size-3.5"
              />
              {{ rotuloDoEstado[linha.estado] }}
            </span>
          </td>
          <td class="py-4 text-card font-extrabold text-highlighted">
            <NuxtLink
              v-if="!linha.temMedicao && !linha.confianca"
              :to="{ path: '/sugerir', query: { rua: linha.nome } }"
              class="text-interface font-bold text-primary"
              @click.stop
            >
              Sugerir medição
            </NuxtLink>
            <template v-else>
              {{ formatarChance(linha.chance) }}
              <SeloDeConfianca
                v-if="linha.confianca"
                :confianca="linha.confianca"
                compacto
                class="mt-0.5 block text-nota! font-normal"
              />
            </template>
          </td>
          <td class="py-4 text-interface text-muted">
            {{ linha.temMedicao || linha.confianca ? `${linha.distanciaM} m` : 'fora da área' }}
          </td>
          <td class="py-4 pr-6">
            <span
              v-if="linha.citacao !== null"
              class="flex items-center gap-3"
            >
              <span class="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                <span
                  class="block h-full rounded-full"
                  :style="{ width: `${Math.min(100, linha.citacao * 2)}%`, backgroundImage: degradeCss(linha.citacao) }"
                />
              </span>
              <span class="text-interface font-bold text-highlighted">{{ linha.citacao }}%</span>
            </span>
            <span
              v-else
              class="text-muted"
            >—</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
