<script setup lang="ts">
withDefaults(defineProps<{ titulo: string, subtitulo?: string, horario?: boolean, busca?: boolean }>(), {
  subtitulo: undefined,
  horario: false,
  busca: false,
})
const { menuAberto, alternarMenu } = useMenuLateral()
</script>

<template>
  <header class="hidden shrink-0 items-center gap-4 border-b border-default px-6 py-5 lg:flex">
    <UTooltip
      arrow
      :text="menuAberto ? 'Recolher menu' : 'Expandir menu'"
      :delay-duration="0"
    >
      <UButton
        :icon="menuAberto ? 'i-lucide-panel-left-close' : 'i-lucide-panel-left-open'"
        color="neutral"
        variant="ghost"
        square
        class="-ml-2 size-10 justify-center text-muted"
        :ui="{ leadingIcon: 'size-5' }"
        :aria-label="menuAberto ? 'Recolher menu' : 'Expandir menu'"
        :aria-expanded="menuAberto"
        @click="alternarMenu"
      />
    </UTooltip>
    <div class="min-w-0 flex-1">
      <h1 class="text-titulo font-bold text-highlighted">
        {{ titulo }}
      </h1>
      <p
        v-if="subtitulo"
        class="text-interface text-muted"
      >
        {{ subtitulo }}
      </p>
    </div>
    <AbasDeHorario
      v-if="horario"
      compacto
    />
    <UButton
      v-if="busca"
      to="/busca"
      icon="i-lucide-search"
      color="neutral"
      variant="soft"
      class="h-10 w-64 bg-(--app-campo) text-interface font-medium text-muted hover:bg-(--app-campo)/80"
    >
      Buscar rua ou lugar
    </UButton>
    <slot />
    <BotaoTema />
  </header>
</template>
