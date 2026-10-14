<script setup lang="ts">
const props = defineProps<{ chegada: string, saidaPrevista: string | null, salvando: boolean }>()
const emit = defineEmits<{ salvar: [saida: string | null] }>()
const aberto = defineModel<boolean>('aberto', { required: true })

const opcoes = ['21:00', '21:30', '22:00', '22:30', '23:00']
const escolhida = ref<string | null>(null)
const outro = ref('')
const mostrarOutro = ref(false)

watch(aberto, (abrindo) => {
  if (!abrindo) return
  const atual = props.saidaPrevista ? formatarHora(props.saidaPrevista) : null
  escolhida.value = atual
  mostrarOutro.value = Boolean(atual && !opcoes.includes(atual))
  outro.value = mostrarOutro.value && atual ? atual : ''
})

function horarioParaData(horario: string): string {
  const [hora = 0, minuto = 0] = horario.split(':').map(Number)
  const base = new Date(props.chegada)
  const data = new Date(base)
  data.setHours(hora, minuto, 0, 0)
  if (data < base) data.setDate(data.getDate() + 1)
  return data.toISOString()
}

function salvar() {
  const horario = mostrarOutro.value ? outro.value : escolhida.value
  emit('salvar', horario ? horarioParaData(horario) : null)
}
</script>

<template>
  <UDrawer
    v-model:open="aberto"
    title="Saída prevista"
    description="Ajuda a estimar quando sua vaga vai liberar."
    :ui="{ title: 'text-stat font-bold', description: 'text-interface', body: 'flex flex-col gap-4' }"
  >
    <template #body>
      <div
        class="grid grid-cols-3 gap-3"
        role="radiogroup"
        aria-label="Horário de saída"
      >
        <UButton
          v-for="opcao in opcoes"
          :key="opcao"
          role="radio"
          :aria-checked="!mostrarOutro && escolhida === opcao"
          :color="!mostrarOutro && escolhida === opcao ? 'primary' : 'neutral'"
          :variant="!mostrarOutro && escolhida === opcao ? 'solid' : 'outline'"
          class="h-13 justify-center text-destaque"
          @click="escolhida = opcao; mostrarOutro = false"
        >
          {{ opcao.replace(':', 'h') }}
        </UButton>
        <UButton
          role="radio"
          :aria-checked="mostrarOutro"
          :color="mostrarOutro ? 'primary' : 'neutral'"
          :variant="mostrarOutro ? 'solid' : 'outline'"
          class="h-13 justify-center text-destaque"
          @click="mostrarOutro = true"
        >
          Outro
        </UButton>
      </div>
      <UFormField
        v-if="mostrarOutro"
        label="Outro horário"
      >
        <UInput
          v-model="outro"
          type="time"
          class="w-full"
          size="xl"
        />
      </UFormField>
      <UButton
        block
        size="xl"
        class="h-14 text-botao"
        :loading="salvando"
        @click="salvar"
      >
        Salvar
      </UButton>
      <UButton
        block
        color="neutral"
        variant="ghost"
        @click="aberto = false"
      >
        Cancelar
      </UButton>
    </template>
  </UDrawer>
</template>
