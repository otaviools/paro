<script setup lang="ts">
import type { PropriedadesDaRua } from '#shared/types/previsao'

defineProps<{ rua: PropriedadesDaRua }>()
defineEmits<{ fechar: [] }>()
</script>

<template>
  <div
    class="relative flex w-64 flex-col gap-3 rounded-card bg-elevated p-4 shadow-lg ring-1 ring-default dark:bg-default dark:ring-0"
    @pointerdown.stop
    @touchstart.stop
    @mousedown.stop
    @wheel.stop
  >
    <UButton
      icon="i-lucide-x"
      aria-label="Fechar"
      color="neutral"
      variant="ghost"
      size="xs"
      class="absolute top-2 right-2"
      @click.stop="$emit('fechar')"
    />
    <p class="pr-6 text-card font-bold text-highlighted">
      {{ rua.nome }}
    </p>
    <div class="flex items-center gap-3">
      <BadgeOcupacao
        :estado="rua.estado"
        class="dark:border-(--paro-creme)/25 dark:bg-primary dark:text-inverted dark:[&_svg]:text-inverted"
      />
      <span
        class="flex shrink-0 items-center gap-1 text-legenda whitespace-nowrap text-muted"
      >
        <UIcon
          name="i-lucide-clock"
          class="size-4 shrink-0"
        />
        {{ rua.medidoEm ? formatarHora(rua.medidoEm) : rua.confianca ? "pesquisa" : "Sem dados" }}
      </span>
    </div>
    <RelatoRecente
      v-if="rua.relatoRecente"
      :relato="rua.relatoRecente"
      class="text-nota!"
    />
    <SeloDeConfianca
      v-if="rua.confianca"
      :confianca="rua.confianca"
      compacto
    />
    <UButton
      :to="`/ruas/${rua.ruaId}`"
      color="neutral"
      variant="soft"
      block
      class="dark:bg-default"
    >
      Ver detalhes
    </UButton>
    <!-- Seta apontando para o rótulo da rua, como nos tooltips do app. -->
    <span
      class="absolute top-full left-1/2 -mt-1.5 size-3 -translate-x-1/2 rotate-45 border-r border-b border-default bg-elevated dark:border-0 dark:bg-default"
      aria-hidden="true"
    />
  </div>
</template>
