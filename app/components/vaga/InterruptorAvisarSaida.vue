<script setup lang="ts">
withDefaults(defineProps<{ detalhado?: boolean }>(), { detalhado: true })
const ligado = defineModel<boolean>({ required: true })
const id = useId()
</script>

<template>
  <div class="flex items-start justify-between gap-4">
    <div class="flex flex-col gap-1">
      <p
        :id="id"
        class="text-corpo font-bold text-highlighted"
      >
        Avisar quando eu sair
      </p>
      <p class="text-legenda text-muted">
        {{ detalhado ? 'Sua saída entra na previsão de quem está chegando. Só o horário é compartilhado, sem identificar você.' : 'Só o horário é compartilhado.' }}
      </p>
    </div>
    <USwitch
      v-model="ligado"
      :aria-labelledby="id"
      size="lg"
    />
  </div>
</template>
