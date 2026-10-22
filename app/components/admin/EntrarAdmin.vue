<script setup lang="ts">
defineProps<{ configurado: boolean, erro: string | null, entrando: boolean }>()
const emit = defineEmits<{ entrar: [senha: string] }>()
const senha = ref('')
</script>

<template>
  <UCard :ui="{ body: 'flex flex-col gap-4 p-6 sm:p-6' }">
    <div>
      <h2 class="text-card font-bold text-highlighted">
        Entrar como admin
      </h2>
      <p class="text-interface text-muted">
        Para registrar as contagens de vagas feitas em campo.
      </p>
    </div>
    <UAlert
      v-if="!configurado"
      icon="i-lucide-lock"
      color="neutral"
      variant="soft"
      title="Área de admin desligada"
      description="Defina NUXT_ADMIN_PASSWORD no .env, com 12 caracteres ou mais, e reinicie o servidor."
      :ui="{ root: 'rounded-alerta bg-accented', title: 'text-corpo font-bold', description: 'text-interface' }"
    />
    <form
      v-else
      class="flex flex-col gap-4"
      @submit.prevent="emit('entrar', senha)"
    >
      <UFormField
        label="Senha de admin"
        name="senha"
        :error="erro ?? undefined"
        :ui="{ label: 'text-interface font-bold' }"
      >
        <UInput
          v-model="senha"
          type="password"
          autocomplete="current-password"
          size="xl"
          class="w-full"
        />
      </UFormField>
      <UButton
        type="submit"
        size="xl"
        block
        class="h-13 text-destaque"
        :loading="entrando"
      >
        Entrar
      </UButton>
    </form>
  </UCard>
</template>
