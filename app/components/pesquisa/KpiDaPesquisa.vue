<script setup lang="ts">
withDefaults(defineProps<{ valor: string, rotulo: string, guia: string, destaque?: boolean, total?: boolean }>(), { destaque: false, total: false })
</script>

<template>
  <UTooltip
    :text="guia"
    arrow
    :content="{ side: 'bottom' }"
    :delay-duration="150"
    :ui="{ content: 'h-auto max-w-64 py-2 text-legenda whitespace-normal' }"
  >
    <div
      class="flex flex-col gap-1 rounded-alerta px-4 py-3 ring-1 ring-default outline-primary focus-visible:outline-2"
      :class="destaque ? 'superficie-destaque ring-0' : 'bg-elevated'"
      tabindex="0"
      :aria-label="`${rotulo}: ${valor}${total ? ' (total, sem recorte por grupo)' : ''}. ${guia}`"
    >
      <p
        class="flex items-center gap-1.5 text-nota font-medium"
        :class="destaque ? 'text-(--app-texto-no-destaque)' : 'text-muted'"
      >
        <span class="truncate">{{ rotulo }}</span>
        <span
          v-if="total"
          class="shrink-0 rounded-full bg-muted px-1.5 text-etiqueta font-bold"
        >total</span>
      </p>
      <p
        class="text-numero font-extrabold tracking-tight"
        :class="destaque ? '' : 'text-highlighted'"
      >
        {{ valor }}
      </p>
    </div>
  </UTooltip>
</template>
