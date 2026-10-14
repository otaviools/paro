<script setup lang="ts">
withDefaults(defineProps<{ nome?: 'detalhe-1-malha' | 'detalhe-2-isolinhas' | 'detalhe-3-acento' | 'detalhe-4-radar' | 'detalhe-5-baias' }>(), {
  nome: 'detalhe-1-malha',
})
</script>

<template>
  <div
    aria-hidden="true"
    class="pointer-events-none absolute inset-0 overflow-hidden opacity-10"
  >
    <img
      :src="`/marca/grafismos/${nome}-fundo-claro.svg`"
      alt=""
      class="size-full object-cover dark:hidden"
    >
    <img
      :src="`/marca/grafismos/${nome}-fundo-escuro.svg`"
      alt=""
      class="hidden size-full object-cover dark:block"
    >
  </div>
</template>
