<script setup lang="ts">
withDefaults(defineProps<{ compacto?: boolean }>(), { compacto: false })
const { nomeDoLocal } = useAreaAtual()
</script>

<template>
  <UTooltip
    v-if="compacto"
    :text="`Local: ${nomeDoLocal}`"
    arrow
    :content="{ side: 'right' }"
    :delay-duration="0"
  >
    <UButton
      to="/local"
      icon="i-lucide-map-pin"
      color="neutral"
      variant="ghost"
      square
      class="size-11 justify-center"
      :ui="{ leadingIcon: 'size-5 text-primary' }"
      :aria-label="`Escolher local, atual: ${nomeDoLocal}`"
    />
  </UTooltip>
  <NuxtLink
    v-else
    to="/local"
    class="flex items-center gap-2 rounded-botao py-2 text-destaque font-semibold text-highlighted outline-primary focus-visible:outline-2"
    aria-label="Escolher local"
  >
    <UIcon
      name="i-lucide-map-pin"
      class="size-5 shrink-0 text-primary"
    />
    <span class="truncate">{{ nomeDoLocal }}</span>
    <UIcon
      name="i-lucide-chevron-down"
      class="size-4 shrink-0 text-muted"
    />
  </NuxtLink>
</template>
