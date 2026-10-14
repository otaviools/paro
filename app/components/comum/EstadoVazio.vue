<script setup lang="ts">
defineProps<{ icone: string, titulo: string, texto: string }>()
</script>

<template>
  <UCard :ui="{ body: 'flex flex-col items-center gap-3 p-6 text-center sm:p-6' }">
    <span class="grid h-20 w-26 place-items-center rounded-alerta border-[1.5px] border-dashed border-(--paro-padrao-traco)">
      <UIcon
        :name="icone"
        class="size-7 text-highlighted"
      />
    </span>
    <p class="text-card font-bold text-highlighted">
      {{ titulo }}
    </p>
    <p class="max-w-72 text-interface text-muted">
      {{ texto }}
    </p>
    <slot />
  </UCard>
</template>
