<script setup lang="ts">
defineProps<{ respondido: boolean | null }>()
defineEmits<{ responder: [ajudou: boolean] }>()
</script>

<template>
  <div class="flex items-center justify-between gap-3 rounded-alerta border border-default px-4 py-3">
    <p
      class="text-corpo font-medium text-highlighted"
      aria-live="polite"
    >
      {{ respondido === null ? 'A previsão ajudou hoje?' : 'Obrigado pela resposta.' }}
    </p>
    <div class="flex gap-2">
      <UButton
        icon="i-lucide-thumbs-up"
        aria-label="Sim, ajudou"
        color="neutral"
        :variant="respondido === true ? 'solid' : 'outline'"
        :aria-pressed="respondido === true"
        class="size-10 justify-center"
        @click="$emit('responder', true)"
      />
      <UButton
        icon="i-lucide-thumbs-down"
        aria-label="Não ajudou"
        color="neutral"
        :variant="respondido === false ? 'solid' : 'outline'"
        :aria-pressed="respondido === false"
        class="size-10 justify-center"
        @click="$emit('responder', false)"
      />
    </div>
  </div>
</template>
