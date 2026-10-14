<script setup lang="ts">
import type { PrevisaoRua } from '#shared/types/previsao'

withDefaults(defineProps<{
  previsoes: PrevisaoRua[]
  detalhe?: 'distancia' | 'leitura'
  links?: boolean
  vazio?: string
}>(), { detalhe: 'distancia', links: true, vazio: 'Nenhuma rua medida nesta área ainda.' })
</script>

<template>
  <UCard :ui="{ root: 'rounded-card', body: 'px-4 py-1 sm:px-4 sm:py-1' }">
    <ul
      v-if="previsoes.length"
      class="divide-y divide-default"
    >
      <li
        v-for="previsao in previsoes"
        :key="previsao.ruaId"
      >
        <CardRua
          :previsao="previsao"
          :detalhe="detalhe"
          :to="links ? `/ruas/${previsao.ruaId}` : undefined"
          :seta="links"
        />
      </li>
    </ul>
    <p
      v-else
      class="py-6 text-center text-legenda text-muted"
    >
      {{ vazio }}
    </p>
  </UCard>
</template>
