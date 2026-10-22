<script setup lang="ts">
import type { ResumoDaRua } from '#shared/types/admin'

defineProps<{ ruas: ResumoDaRua[] }>()
defineEmits<{ escolher: [ruaId: string] }>()
</script>

<template>
  <UCard :ui="{ body: 'p-0 sm:p-0' }">
    <div class="p-5">
      <h2 class="text-card font-bold text-highlighted">
        Contagens por rua
      </h2>
      <p class="text-legenda text-muted">
        A chance de vaga de cada rua vem destas contagens. Rua sem contagem aparece como Sem dado.
      </p>
    </div>
    <ul class="divide-y divide-default border-t border-default">
      <li
        v-for="rua in ruas"
        :key="rua.ruaId"
      >
        <button
          type="button"
          class="flex w-full items-center gap-4 px-5 py-3 text-left outline-primary hover:bg-muted/60 focus-visible:outline-2"
          @click="$emit('escolher', rua.ruaId)"
        >
          <span class="min-w-0 flex-1">
            <span class="block text-corpo font-bold text-highlighted">{{ rua.nome }}</span>
            <span class="block text-legenda text-muted">
              {{ rua.contagens ? `${rua.contagens} contagens em ${rua.diasMedidos} ${rua.diasMedidos === 1 ? 'dia' : 'dias'}` : 'Nenhuma contagem ainda' }}{{ rua.capacidade ? ` · ${rua.capacidade} vagas` : ' · sem capacidade' }}
            </span>
          </span>
          <span class="text-right text-nota text-muted">
            {{ rua.ultimaContagem ? `última em ${formatarDataCurta(rua.ultimaContagem)}` : '' }}
          </span>
          <UIcon
            name="i-lucide-chevron-right"
            class="size-5 text-muted"
          />
        </button>
      </li>
    </ul>
  </UCard>
</template>
