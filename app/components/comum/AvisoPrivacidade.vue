<script setup lang="ts">
withDefaults(defineProps<{ texto?: string }>(), {
  texto: "A localização não é compartilhada.",
});
</script>

<template>
  <p class="flex items-start gap-2 text-legenda font-medium text-primary">
    <UIcon name="i-lucide-shield-check" class="mt-0.5 size-4 shrink-0" />
    {{ texto }}
  </p>
</template>
