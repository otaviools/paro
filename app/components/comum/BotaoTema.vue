<script setup lang="ts">
const colorMode = useColorMode()
const { alternarTema } = usePreferencias()
const escuro = computed(() => colorMode.value === 'dark')
</script>

<template>
  <ClientOnly>
    <UButton
      :icon="escuro ? 'i-lucide-sun' : 'i-lucide-moon'"
      :aria-label="escuro ? 'Usar tema claro' : 'Usar tema escuro'"
      color="neutral"
      variant="outline"
      class="size-10 justify-center"
      @click="alternarTema"
    />
    <template #fallback>
      <span class="block size-10" />
    </template>
  </ClientOnly>
</template>
