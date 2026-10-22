<script setup lang="ts">
withDefaults(defineProps<{ mostrarDia?: boolean, compacto?: boolean }>(), { mostrarDia: false, compacto: false })
const { selecionado, abas, hoje } = useHorario()
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <UTabs
      v-model="selecionado"
      :items="abas"
      :content="false"
      color="primary"
      class="min-w-0 flex-1"
      :class="compacto ? 'lg:w-84 lg:flex-none' : ''"
      :ui="{ list: 'h-11 rounded-alerta bg-muted p-1 dark:bg-(--app-campo)', trigger: 'h-9 flex-1 text-interface font-semibold data-[state=active]:font-bold data-[state=active]:text-(--app-abas-indicador-texto)', indicator: 'rounded-botao bg-(--app-abas-indicador)' }"
      aria-label="Horário da previsão"
    />
    <ClientOnly v-if="mostrarDia">
      <p class="text-legenda font-medium text-muted">
        {{ hoje }}
      </p>
    </ClientOnly>
  </div>
</template>
