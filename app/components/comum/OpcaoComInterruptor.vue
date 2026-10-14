<script setup lang="ts">
defineProps<{ titulo: string, descricao?: string, recomendado?: boolean }>()
const ligado = defineModel<boolean>({ required: true })
const id = useId()
</script>

<template>
  <div class="flex items-center justify-between gap-4 py-4">
    <div class="flex flex-col gap-1">
      <p
        :id="id"
        class="flex flex-wrap items-center gap-2 text-corpo font-bold text-highlighted"
      >
        {{ titulo }}
        <UBadge
          v-if="recomendado"
          label="Recomendado"
          color="neutral"
          variant="soft"
          class="rounded-badge bg-accented"
        />
      </p>
      <p
        v-if="descricao"
        class="text-legenda text-muted"
      >
        {{ descricao }}
      </p>
    </div>
    <USwitch
      v-model="ligado"
      :aria-labelledby="id"
      size="lg"
    />
  </div>
</template>
