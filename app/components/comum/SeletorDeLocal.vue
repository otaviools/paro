<script setup lang="ts">
withDefaults(defineProps<{ compacto?: boolean }>(), { compacto: false })
const { nomeDoLocal, partesDoLocal } = useAreaAtual()
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
    class="flex w-fit max-w-full min-w-0 items-center gap-2 rounded-botao text-highlighted outline-primary focus-visible:outline-2"
    :aria-label="`Escolher local, atual: ${nomeDoLocal}`"
    :title="nomeDoLocal"
  >
    <UIcon
      name="i-lucide-map-pin"
      class="size-5 shrink-0 text-primary"
    />
    <span class="flex min-w-0 flex-1 flex-col leading-tight">
      <span class="truncate text-destaque font-semibold">{{ partesDoLocal.lugar }}</span>
      <span
        v-if="partesDoLocal.cidade"
        class="truncate text-nota font-medium text-muted"
      >{{ partesDoLocal.cidade }}</span>
    </span>
    <UIcon
      name="i-lucide-chevron-down"
      class="size-4 shrink-0 text-muted"
    />
  </NuxtLink>
</template>
