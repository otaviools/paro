<script setup lang="ts">
const emit = defineEmits<{ verificado: [] }>()

const { pedirCodigo, verificar } = useConta()
const etapa = ref<'email' | 'codigo'>('email')
const email = ref('')
const codigo = ref('')
const erro = ref<string | null>(null)
const ocupado = ref(false)
const reenviado = ref(false)

const somenteNumeros = computed({
  get: () => codigo.value,
  set: (valor: string) => {
    codigo.value = String(valor ?? '').replace(/\D/g, '').slice(0, 6)
  },
})

async function enviarEmail() {
  ocupado.value = true
  erro.value = await pedirCodigo(email.value)
  ocupado.value = false
  if (!erro.value) etapa.value = 'codigo'
}

async function enviarCodigo() {
  ocupado.value = true
  erro.value = await verificar(codigo.value)
  ocupado.value = false
  if (!erro.value) emit('verificado')
}

async function reenviar() {
  ocupado.value = true
  erro.value = await pedirCodigo(email.value)
  ocupado.value = false
  reenviado.value = !erro.value
}

function trocarEmail() {
  etapa.value = 'email'
  codigo.value = ''
  erro.value = null
}
</script>

<template>
  <form
    v-if="etapa === 'email'"
    class="flex flex-col gap-3"
    @submit.prevent="enviarEmail"
  >
    <UFormField
      name="email"
      :error="erro ?? undefined"
    >
      <UInput
        v-model="email"
        type="email"
        aria-label="Seu e-mail"
        autocomplete="email"
        inputmode="email"
        placeholder="voce@exemplo.com"
        size="xl"
        class="w-full"
      />
    </UFormField>
    <UButton
      type="submit"
      size="xl"
      block
      class="h-13 text-destaque"
      :loading="ocupado"
      :disabled="!email"
    >
      Enviar código
    </UButton>
  </form>
  <form
    v-else
    class="flex flex-col gap-3"
    @submit.prevent="enviarCodigo"
  >
    <p
      class="text-legenda text-muted"
      aria-live="polite"
    >
      {{ reenviado ? 'Mandamos outro código.' : 'Mandamos um código de 6 números para o seu e-mail.' }} Ele vale por 10 minutos. Olhe também a caixa de spam.
    </p>
    <UFormField
      label="Código"
      name="codigo"
      :error="erro ?? undefined"
      :ui="{ label: 'text-interface font-bold' }"
    >
      <UInput
        v-model="somenteNumeros"
        autocomplete="one-time-code"
        inputmode="numeric"
        size="xl"
        class="w-full"
      />
    </UFormField>
    <UButton
      type="submit"
      size="xl"
      block
      class="h-13 text-destaque"
      :loading="ocupado"
      :disabled="codigo.length !== 6"
    >
      Verificar
    </UButton>
    <div class="flex flex-wrap justify-center gap-x-4">
      <UButton
        variant="link"
        class="text-interface"
        :disabled="ocupado"
        @click="reenviar"
      >
        Reenviar código
      </UButton>
      <UButton
        variant="link"
        class="text-interface"
        @click="trocarEmail"
      >
        Trocar e-mail
      </UButton>
    </div>
  </form>
</template>
