<script setup lang="ts">
import type { Vaga } from '#shared/types/vaga'

const props = defineProps<{ vaga: Vaga }>()
defineEmits<{ editarSaida: [] }>()

const tempo = useTempoNaVaga(() => props.vaga.chegada)
</script>

<template>
  <dl class="grid grid-cols-3 gap-3">
    <div class="flex flex-col gap-1 rounded-alerta bg-muted p-4">
      <dd class="text-stat font-extrabold text-highlighted">
        {{ formatarHora(vaga.chegada) }}
      </dd>
      <dt class="text-nota text-muted">
        desde
      </dt>
    </div>
    <div class="flex flex-col gap-1 rounded-alerta bg-muted p-4">
      <dd class="text-stat font-extrabold text-highlighted">
        <ClientOnly fallback="—">
          {{ tempo }}
        </ClientOnly>
      </dd>
      <dt class="text-nota text-muted">
        tempo aqui
      </dt>
    </div>
    <button
      type="button"
      class="relative flex flex-col gap-1 rounded-alerta bg-muted p-4 text-left outline-primary focus-visible:outline-2"
      aria-label="Editar saída prevista"
      @click="$emit('editarSaida')"
    >
      <UIcon
        name="i-lucide-pencil"
        class="absolute top-3 right-3 size-4 text-primary"
      />
      <span class="text-stat font-extrabold text-highlighted">{{ vaga.saidaPrevista ? formatarHoraCompacta(vaga.saidaPrevista) : '—' }}</span>
      <span class="text-nota text-muted">saída prevista</span>
    </button>
  </dl>
</template>
