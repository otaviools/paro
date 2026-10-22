<script setup lang="ts">
import type { EstacionamentoDetectado } from '#shared/utils/estacionamento'
import type { RespostaDoRelato } from '#shared/utils/relato'

const { pergunta, silenciar, dispensar } = useDeteccaoDeVaga()
const { registrar } = useVaga()
const { enviarRelato } = useRelato()
const toast = useToast()
const etapa = ref<'pergunta' | 'relato'>('pergunta')
const confirmada = ref<EstacionamentoDetectado | null>(null)
const relato = ref<RespostaDoRelato>({ estado: null, tempo: null })
const ocupado = ref(false)

const aberto = computed({
  get: () => Boolean(pergunta.value) || etapa.value === 'relato',
  set: (valor: boolean) => {
    if (!valor) fechar()
  },
})

const horaDaParada = computed(() => (pergunta.value ? formatarHora(new Date(pergunta.value.desde).toISOString()) : ''))

async function confirmar() {
  const detectado = pergunta.value
  if (!detectado) return
  ocupado.value = true
  const vaga = await registrar({ ruaId: detectado.ruaId, chegada: new Date(detectado.desde).toISOString(), saidaPrevista: null, avisarAoSair: true, ponto: detectado.ponto })
  ocupado.value = false
  if (!vaga) return
  confirmada.value = detectado
  etapa.value = 'relato'
  dispensar()
}

async function outraRua() {
  const detectado = pergunta.value
  dispensar()
  if (detectado) await navigateTo({ path: '/vaga/registrar', query: { lng: detectado.ponto[0], lat: detectado.ponto[1] } })
}

async function enviar() {
  if (confirmada.value) await enviarRelato(confirmada.value.ruaId, relato.value, confirmada.value.ponto)
  fechar()
}

function fechar() {
  if (etapa.value === 'pergunta' && pergunta.value) silenciar()
  if (etapa.value === 'relato') toast.add({ title: 'Vaga registrada', description: `${confirmada.value?.nome ?? ''}, chegada às ${confirmada.value ? formatarHora(new Date(confirmada.value.desde).toISOString()) : ''}.`, color: 'success' })
  etapa.value = 'pergunta'
  confirmada.value = null
  relato.value = { estado: null, tempo: null }
}
</script>

<template>
  <UDrawer
    v-model:open="aberto"
    :title="etapa === 'pergunta' ? `Estacionou na ${pergunta?.nome ?? ''}?` : 'Vaga registrada'"
    :description="etapa === 'pergunta' ? `Você parou aqui às ${horaDaParada}. Um toque registra a vaga.` : 'Se quiser, conte como estava a rua. Ajuda a previsão de quem chega.'"
    :ui="{ overlay: 'z-40', content: 'z-50', container: 'mx-auto w-full max-w-lg gap-4 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]', title: 'text-card font-bold text-highlighted', description: 'text-legenda text-muted' }"
  >
    <template #body>
      <div
        v-if="etapa === 'pergunta'"
        class="flex flex-col gap-3"
      >
        <UButton
          block
          size="xl"
          icon="i-lucide-check"
          class="h-13 text-destaque"
          :loading="ocupado"
          @click="confirmar"
        >
          Sim, estacionei aqui
        </UButton>
        <div class="grid grid-cols-2 gap-3">
          <UButton
            block
            size="xl"
            color="neutral"
            variant="outline"
            class="h-12 justify-center"
            @click="outraRua"
          >
            Outra rua
          </UButton>
          <UButton
            block
            size="xl"
            color="neutral"
            variant="ghost"
            class="h-12 justify-center"
            @click="silenciar"
          >
            Não
          </UButton>
        </div>
        <p class="text-nota text-muted">
          A detecção usa sua localização só neste aparelho. Ao tocar em Não, o Parô não pergunta de novo por 30 minutos.
        </p>
      </div>
      <div
        v-else
        class="flex flex-col gap-4"
      >
        <FormularioDeRelato
          v-model="relato"
          opcional
        />
        <div class="grid grid-cols-2 gap-3">
          <UButton
            block
            size="xl"
            color="neutral"
            variant="outline"
            class="h-12 justify-center"
            @click="fechar"
          >
            Pular
          </UButton>
          <UButton
            block
            size="xl"
            class="h-12 justify-center"
            :disabled="!relato.estado && !relato.tempo"
            @click="enviar"
          >
            Enviar relato
          </UButton>
        </div>
      </div>
    </template>
  </UDrawer>
</template>
