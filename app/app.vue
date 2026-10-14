<script setup lang="ts">
const colorMode = useColorMode()
const config = useRuntimeConfig()

useHead({
  htmlAttrs: {
    'data-tema': computed(() => (colorMode.value === 'dark' ? 'escuro' : 'claro')),
  },
  link: [{ rel: 'icon', type: 'image/svg+xml', href: config.public.favicon }],
  meta: [{ name: 'theme-color', content: computed(() => (colorMode.value === 'dark' ? '#32312C' : '#FFF9E3')) }],
})
</script>

<template>
  <UApp :toaster="{ position: 'top-center' }">
    <NuxtPwaManifest />
    <!-- Padrões de props para o app inteiro, inclusive tooltips criados pelo Nuxt UI (menu recolhido). -->
    <UTheme :props="{ tooltip: { arrow: true } }">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UTheme>
  </UApp>
</template>
