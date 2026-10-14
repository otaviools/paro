<script setup lang="ts">
defineProps<{ rotulo: string, valor?: string }>()
</script>

<template>
  <div class="flex min-h-14 items-center justify-between gap-3 py-3">
    <dt class="text-interface text-muted">
      {{ rotulo }}
    </dt>
    <dd class="text-right text-corpo font-bold text-highlighted">
      <slot>{{ valor }}</slot>
    </dd>
  </div>
</template>
