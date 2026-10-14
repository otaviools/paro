<script setup lang="ts">
withDefaults(defineProps<{ titulo?: string, subtitulo?: string, local?: boolean, ajustes?: boolean, tema?: boolean }>(), {
  titulo: undefined,
  subtitulo: undefined,
  local: false,
  ajustes: true,
  tema: true,
})
</script>

<template>
  <header class="flex items-start justify-between gap-3 lg:hidden">
    <div class="min-w-0 flex-1">
      <SeletorDeLocal v-if="local" />
      <h1
        v-if="titulo"
        class="text-titulo font-bold text-highlighted"
      >
        {{ titulo }}
      </h1>
      <p
        v-if="subtitulo"
        class="text-legenda text-muted"
      >
        {{ subtitulo }}
      </p>
    </div>
    <div class="flex shrink-0 items-center gap-2">
      <slot name="extra" />
      <BotaoTema v-if="tema" />
      <UButton
        v-if="ajustes"
        to="/ajustes"
        icon="i-lucide-settings"
        aria-label="Ajustes"
        color="neutral"
        variant="outline"
        class="size-10 justify-center"
      />
    </div>
  </header>
</template>
