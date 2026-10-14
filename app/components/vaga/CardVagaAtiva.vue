<script setup lang="ts">
import type { Vaga } from '#shared/types/vaga'

const props = defineProps<{ vaga: Vaga }>()
defineEmits<{ avisar: [ligado: boolean] }>()
const tempo = useTempoNaVaga(() => props.vaga.chegada)
</script>

<template>
  <UCard :ui="{ body: 'flex flex-col gap-3 p-5 sm:p-5' }">
    <h2 class="etiqueta text-primary">
      Minha vaga
    </h2>
    <p class="flex items-center gap-3 text-percentual font-extrabold text-highlighted">
      <UIcon
        name="i-lucide-timer"
        class="size-8"
      />
      <ClientOnly fallback="—">
        {{ tempo }}
      </ClientOnly>
    </p>
    <p class="text-interface text-muted">
      Estacionado na {{ vaga.nomeDaRua }}
    </p>
    <USeparator />
    <dl>
      <LinhaDeInformacao
        rotulo="Saída prevista"
        :valor="vaga.saidaPrevista ? formatarHoraCompacta(vaga.saidaPrevista) : 'não informada'"
      />
    </dl>
    <USeparator />
    <InterruptorAvisarSaida
      :model-value="vaga.avisarAoSair"
      @update:model-value="$emit('avisar', $event)"
    />
    <AvisoPrivacidade
      texto="Dado anônimo e agregado"
      class="text-nota!"
    />
  </UCard>
</template>
