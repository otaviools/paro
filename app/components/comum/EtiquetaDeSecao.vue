<script setup lang="ts">
defineProps<{ texto: string, nota?: string }>()
</script>

<template>
  <div class="flex items-baseline justify-between gap-3">
    <h2 class="etiqueta text-primary">
      {{ texto }}
    </h2>
    <p
      v-if="nota || $slots.default"
      class="text-nota text-muted"
    >
      <slot>{{ nota }}</slot>
    </p>
  </div>
</template>
