<script setup lang="ts">
definePageMeta({ layout: 'foco' })
useSeoMeta({ title: 'Sugerir rua · Parô' })

const rota = useRoute()
const toast = useToast()
const enviando = ref(false)
const erro = ref('')

const formulario = reactive({
  nomeDaRua: typeof rota.query.rua === 'string' ? rota.query.rua : '',
  periodos: ['noite'] as ('manha' | 'tarde' | 'noite')[],
  motivo: '',
})

const periodos = [
  { valor: 'manha', rotulo: 'Manhã' },
  { valor: 'tarde', rotulo: 'Tarde' },
  { valor: 'noite', rotulo: 'Noite' },
] as const

function alternarPeriodo(periodo: 'manha' | 'tarde' | 'noite', marcado: boolean | 'indeterminate') {
  formulario.periodos = marcado === true ? [...formulario.periodos, periodo] : formulario.periodos.filter(item => item !== periodo)
}

async function enviar() {
  erro.value = formulario.nomeDaRua.trim().length < 3 ? 'Escreva o nome da rua.' : ''
  if (erro.value) return
  enviando.value = true
  try {
    await $fetch('/api/sugestoes', { method: 'POST', body: formulario })
    toast.add({ title: 'Sugestão enviada', description: 'Obrigado. A equipe usa as sugestões para planejar a próxima coleta.', color: 'success' })
    await navigateTo('/')
  }
  catch (falha) {
    erro.value = mensagemDoErro(falha)
  }
  finally {
    enviando.value = false
  }
}
</script>

<template>
  <form
    class="flex flex-col gap-6 lg:mx-auto lg:max-w-xl lg:p-8"
    novalidate
    @submit.prevent="enviar"
  >
    <CabecalhoDeTarefa titulo="Sugerir rua" />
    <p class="text-corpo text-muted">
      Conte qual rua você gostaria que o Parô medisse. A equipe usa as sugestões para planejar a próxima coleta.
    </p>

    <UFormField
      label="Rua"
      name="nomeDaRua"
      :error="erro || undefined"
      required
      :ui="{ label: 'text-interface font-bold' }"
    >
      <UInput
        v-model="formulario.nomeDaRua"
        icon="i-lucide-map-pin"
        size="xl"
        class="w-full"
        :ui="{ base: 'h-13 bg-elevated text-corpo' }"
      />
    </UFormField>

    <fieldset class="flex flex-col gap-3">
      <legend class="mb-3 text-interface font-bold text-highlighted">
        Quando você costuma ir até lá?
      </legend>
      <div class="grid grid-cols-3 gap-3">
        <label
          v-for="periodo in periodos"
          :key="periodo.valor"
          class="flex h-12 cursor-pointer items-center gap-2 rounded-botao border px-4 text-corpo font-medium"
          :class="formulario.periodos.includes(periodo.valor) ? 'border-primary bg-accented' : 'border-accented bg-elevated'"
        >
          <UCheckbox
            :model-value="formulario.periodos.includes(periodo.valor)"
            @update:model-value="alternarPeriodo(periodo.valor, $event)"
          />
          {{ periodo.rotulo }}
        </label>
      </div>
    </fieldset>

    <UFormField
      label="Comentário (opcional)"
      name="motivo"
      :ui="{ label: 'text-interface font-bold' }"
    >
      <UTextarea
        v-model="formulario.motivo"
        :rows="4"
        :maxlength="500"
        placeholder="Ex.: perto da faculdade, sempre lotada à noite."
        class="w-full"
        :ui="{ base: 'bg-elevated text-corpo' }"
      />
    </UFormField>

    <AvisoPrivacidade texto="Não pedimos nome, telefone nem placa." />

    <UButton
      type="submit"
      block
      size="xl"
      class="h-14 text-botao"
      :loading="enviando"
    >
      Enviar sugestão
    </UButton>
  </form>
</template>
