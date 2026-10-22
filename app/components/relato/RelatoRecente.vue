<script setup lang="ts">
import { rotuloDoEstado } from '#shared/utils/ocupacao'
import type { RelatoRecente } from '#shared/types/previsao'

const props = defineProps<{ relato: RelatoRecente }>()

const quando = computed(() => props.relato.minutos < 1 ? 'agora há pouco' : `há ${props.relato.minutos} min`)
const quantos = computed(() => props.relato.relatos > 1 ? ` · ${props.relato.relatos} relatos` : '')
</script>

<template>
  <p class="flex items-center gap-1.5 text-legenda text-highlighted">
    <PadraoOcupacao
      :estado="relato.estado"
      decorativo
      class="size-3.5 shrink-0"
    />
    <span>
      <span class="font-bold">{{ rotuloDoEstado[relato.estado] }}</span> · relatado {{ quando }}{{ quantos }}<span class="text-muted"> · Previsão, não garantia</span>
    </span>
  </p>
</template>
