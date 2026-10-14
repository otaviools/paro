<script setup lang="ts">
defineProps<{ titulo: string, guia: string, meta?: string }>()
</script>

<template>
  <UCard :ui="{ root: 'flex min-h-80 flex-col lg:min-h-0', body: 'flex min-h-0 flex-1 flex-col gap-4 p-5 sm:p-5' }">
    <header class="flex flex-wrap items-center gap-x-3 gap-y-2">
      <h2 class="text-destaque font-bold text-highlighted">
        {{ titulo }}
      </h2>
      <UPopover
        mode="hover"
        arrow
        :content="{ side: 'top', align: 'start' }"
      >
        <UButton
          color="neutral"
          variant="ghost"
          size="xs"
          square
          icon="i-lucide-info"
          class="-ml-2 text-muted"
          :aria-label="`Como ler: ${titulo}`"
        />
        <template #content>
          <p class="max-w-72 p-3 text-legenda text-highlighted">
            {{ guia }}
          </p>
        </template>
      </UPopover>
      <div class="flex max-w-full items-center gap-3 overflow-x-auto [scrollbar-width:none] sm:ml-auto">
        <slot name="acoes" />
        <span
          v-if="meta"
          class="text-nota text-muted"
        >{{ meta }}</span>
      </div>
    </header>
    <div class="flex min-h-0 flex-1 flex-col">
      <slot />
    </div>
  </UCard>
</template>
