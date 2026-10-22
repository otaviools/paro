<script setup lang="ts">
withDefaults(defineProps<{ detalhado?: boolean }>(), { detalhado: true })
const ligado = defineModel<boolean>({ required: true })
const id = useId()
const idDaDescricao = useId()
</script>

<template>
  <div class="flex items-center gap-3">
    <span
      class="grid size-10 shrink-0 place-items-center rounded-alerta bg-accented"
      aria-hidden="true"
    >
      <UIcon
        :name="ligado ? 'i-lucide-bell-ring' : 'i-lucide-bell'"
        class="size-5 text-highlighted"
      />
    </span>
    <div class="flex min-w-0 flex-1 flex-col gap-0.5">
      <p
        :id="id"
        class="text-corpo font-bold text-highlighted"
      >
        Avisar quando eu sair
      </p>
      <p
        :id="idDaDescricao"
        class="max-w-[52ch] text-legenda text-muted"
      >
        {{ detalhado ? 'Sua saída entra na previsão de quem está chegando. Só o horário é compartilhado, sem identificar você.' : 'Só o horário é compartilhado.' }}
      </p>
    </div>
    <USwitch
      v-model="ligado"
      :aria-labelledby="id"
      :aria-describedby="idDaDescricao"
      size="lg"
      class="shrink-0"
    />
  </div>
</template>
