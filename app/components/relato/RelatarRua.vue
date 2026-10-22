<script setup lang="ts">
import type { RespostaDoRelato } from '#shared/utils/relato'

const props = defineProps<{ ruaId: string, nome: string }>()

const { enviarRelato } = useRelato()
const { conta } = useConta()
const toast = useToast()
const aberto = ref(false)
const enviando = ref(false)
const resposta = ref<RespostaDoRelato>({ estado: null, tempo: null })
const respondeu = computed(() => Boolean(resposta.value.estado || resposta.value.tempo))

async function enviar() {
  enviando.value = true
  const registrado = await enviarRelato(props.ruaId, resposta.value)
  enviando.value = false
  if (!registrado) return
  aberto.value = false
  resposta.value = { estado: null, tempo: null }
  toast.add({
    title: registrado.substituiu ? 'Relato atualizado' : 'Obrigado pelo relato',
    description: conta.data.value.verificado || !conta.data.value.disponivel
      ? `Ele já entra na chance da ${props.nome}.`
      : 'Ele já entra na chance. Verifique seu e-mail em Ajustes para seus relatos pesarem mais.',
    color: 'success',
  })
}
</script>

<template>
  <UModal
    v-model:open="aberto"
    :title="`Relatar a ${nome}`"
    description="Conte como está a rua agora. Um toque basta."
    :ui="{ footer: 'justify-end gap-3' }"
  >
    <UButton
      color="neutral"
      variant="outline"
      size="xl"
      icon="i-lucide-megaphone"
      block
      class="h-13 justify-center text-destaque"
    >
      Relatar esta rua
    </UButton>
    <template #body>
      <FormularioDeRelato v-model="resposta" />
      <p class="mt-4 text-nota text-muted">
        Relato anônimo. Vale 1 por faixa de 30 minutos: um novo substitui o anterior.
      </p>
    </template>
    <template #footer>
      <UButton
        color="neutral"
        variant="outline"
        @click="aberto = false"
      >
        Cancelar
      </UButton>
      <UButton
        icon="i-lucide-send"
        :loading="enviando"
        :disabled="!respondeu"
        @click="enviar"
      >
        Enviar relato
      </UButton>
    </template>
  </UModal>
</template>
