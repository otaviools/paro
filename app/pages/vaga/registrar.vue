<script setup lang="ts">
import type { RespostaDoRelato } from '#shared/utils/relato'

definePageMeta({ layout: 'foco' })
useSeoMeta({ title: 'Registrar vaga · Parô' })

const { data: mapa } = await useMapaDaArea(undefined)
const { registrar } = useVaga()
const { preferencias } = usePreferencias()
const { posicao, localizar } = useLocalizacao()
const { enviarRelato } = useRelato()
const agora = useAgora()

const rota = useRoute()
const pontoDaDeteccao = computed<[number, number] | null>(() => {
  const lng = Number(rota.query.lng)
  const lat = Number(rota.query.lat)
  return Number.isFinite(lng) && Number.isFinite(lat) && rota.query.lng && rota.query.lat ? [lng, lat] : null
})
const ruas = computed(() => mapa.value?.ruas.features ?? [])
const centro = computed<[number, number]>(() => (mapa.value?.referencia.coordinates ?? [-48.27969, -18.91238]) as [number, number])
const ponto = ref<[number, number]>(pontoDaDeteccao.value ?? centro.value)
const ruaEscolhida = ref<string>()
const trocandoRua = ref(false)
const saidaPrevista = ref<string>('21:30')
const chegadaManual = ref('')
const avisarAoSair = ref(true)
const salvando = ref(false)
const relato = ref<RespostaDoRelato>({ estado: null, tempo: null })

const ruaMaisProxima = computed(() => [...ruas.value].sort((a, b) => distanciaAteTrajeto(ponto.value, a.geometry) - distanciaAteTrajeto(ponto.value, b.geometry))[0])
const ruaId = computed(() => ruaEscolhida.value ?? ruaMaisProxima.value?.properties.ruaId)
const nomeDaRua = computed(() => ruas.value.find(feature => feature.properties.ruaId === ruaId.value)?.properties.nome ?? '—')
const opcoesDeRua = computed(() => ruas.value.map(feature => ({ label: feature.properties.nome, value: feature.properties.ruaId })))
const NAO_SEI = 'nao-sei'
const opcoesDeSaida = [NAO_SEI, '21:00', '21:30', '22:00', '22:30', '23:00'].map(valor => ({ label: valor === NAO_SEI ? 'Não sei' : valor.replace(':', 'h'), value: valor }))

onMounted(async () => {
  if (pontoDaDeteccao.value) return
  if (!preferencias.value.localizacaoAoLigar && !preferencias.value.localizacaoContinua) return
  const atual = await localizar(true)
  if (atual) ponto.value = atual
})

function moverPonto(novo: [number, number]) {
  ponto.value = novo
  ruaEscolhida.value = undefined
}

function horarioDeHoje(horario: string): string {
  const [hora = 0, minuto = 0] = horario.split(':').map(Number)
  const data = new Date()
  data.setHours(hora, minuto, 0, 0)
  return data.toISOString()
}

async function confirmar() {
  if (!ruaId.value) return
  salvando.value = true
  const vaga = await registrar({
    ruaId: ruaId.value,
    chegada: preferencias.value.registroManual && chegadaManual.value ? horarioDeHoje(chegadaManual.value) : undefined,
    saidaPrevista: saidaPrevista.value === NAO_SEI ? null : horarioDeHoje(saidaPrevista.value),
    avisarAoSair: avisarAoSair.value,
    ponto: ponto.value,
  })
  if (vaga) await enviarRelato(vaga.ruaId, relato.value, posicao.value)
  salvando.value = false
  if (vaga) await navigateTo('/vaga')
}
</script>

<template>
  <div class="flex flex-col gap-5 lg:mx-auto lg:w-full lg:max-w-5xl lg:gap-6 lg:p-6">
    <!--
      Celular: uma coluna. Desktop: duas colunas que cabem na altura da tela, com o mapa
      (onde se arrasta o carro) à esquerda e as informações e o botão de confirmar à direita.
      A raiz da página segue coluna flexível (regra de tela cheia do CascaDoApp); a grade fica
      num bloco interno, que no celular some (contents) e mantém a ordem de uma coluna.
    -->
    <CabecalhoDeTarefa
      titulo="Registrar vaga"
      voltar-para="/vaga"
    />
    <div class="contents lg:grid lg:min-h-0 lg:flex-1 lg:grid-cols-2 lg:gap-6">
      <div class="flex flex-col gap-5 lg:min-h-0">
        <div class="h-56 overflow-hidden rounded-card ring-1 ring-default lg:h-auto lg:min-h-64 lg:flex-1">
          <MapView
            v-if="mapa"
            :centro="ponto"
            :zoom="17"
            rotulo="Mapa para ajustar a posição do carro"
          >
            <MapGeoJSON
              :dados="mapa.ruas"
              :selecionada="ruaId"
            />
            <MapMarker :posicao="centro">
              <span class="block rounded-badge bg-(--app-marcador-referencia) px-2 py-1 text-nota font-bold text-(--app-marcador-referencia-texto)">{{ mapa.nomeDaReferencia }}</span>
            </MapMarker>
            <MapMarker
              v-if="posicao"
              :posicao="posicao"
            >
              <span
                class="block size-5 rounded-full bg-primary ring-2 ring-(--paro-mapa-anel)"
                aria-label="Sua posição"
              />
            </MapMarker>
            <MapMarker
              :posicao="ponto"
              arrastavel
              ancora="bottom"
              @moveu="moverPonto"
            >
              <div class="flex cursor-grab flex-col items-center gap-1 active:cursor-grabbing">
                <span class="grid size-12 place-items-center rounded-full bg-primary text-inverted ring-4 ring-(--paro-mapa-anel)">
                  <UIcon
                    name="i-lucide-car"
                    class="size-6"
                  />
                </span>
                <span class="rounded-badge bg-(--paro-mapa-marcador) px-2 py-1 text-nota font-bold text-highlighted ring-1 ring-default">Sua vaga</span>
              </div>
            </MapMarker>
            <MapControls
              :zoom="false"
              :bussola="false"
              @localizar="localizar().then(atual => atual && moverPonto(atual))"
            />
          </MapView>
        </div>
        <p class="flex items-center gap-2 text-legenda text-muted">
          <UIcon
            name="i-lucide-move"
            class="size-4"
          /> Arraste o carro no mapa para ajustar a posição
        </p>
      </div>

      <div class="flex flex-col gap-5 lg:min-h-0 lg:gap-4 lg:overflow-y-auto">
        <UCard :ui="{ body: 'px-4 py-1 sm:px-4 sm:py-1' }">
          <dl class="divide-y divide-default">
            <LinhaDeInformacao rotulo="Rua">
              <span class="flex items-center gap-3">
                <USelect
                  v-if="trocandoRua"
                  v-model="ruaEscolhida"
                  :items="opcoesDeRua"
                  placeholder="Escolha a rua"
                  class="w-52"
                  aria-label="Rua onde você parou"
                  @update:model-value="trocandoRua = false"
                />
                <template v-else>
                  {{ nomeDaRua }}
                  <UButton
                    variant="link"
                    class="p-0 text-interface font-bold"
                    @click="trocandoRua = true"
                  >Trocar</UButton>
                </template>
              </span>
            </LinhaDeInformacao>
            <LinhaDeInformacao rotulo="Horário">
              <UInput
                v-if="preferencias.registroManual"
                v-model="chegadaManual"
                type="time"
                aria-label="Horário de chegada"
                class="w-32"
              />
              <ClientOnly v-else>
                agora · {{ formatarHora(agora) }}
              </ClientOnly>
            </LinhaDeInformacao>
            <LinhaDeInformacao rotulo="Saída prevista">
              <USelect
                v-model="saidaPrevista"
                :items="opcoesDeSaida"
                variant="none"
                class="w-28 justify-end text-corpo font-bold"
                aria-label="Saída prevista"
              />
            </LinhaDeInformacao>
          </dl>
        </UCard>

        <UCard :ui="{ body: 'p-4 sm:p-4' }">
          <InterruptorAvisarSaida
            v-model="avisarAoSair"
            :detalhado="false"
          />
        </UCard>

        <UCard :ui="{ body: 'p-4 sm:p-4' }">
          <FormularioDeRelato
            v-model="relato"
            opcional
          />
        </UCard>

        <UButton
          block
          size="xl"
          class="h-14 text-botao"
          :loading="salvando"
          :disabled="!ruaId"
          @click="confirmar"
        >
          Confirmar vaga
        </UButton>
        <AvisoPrivacidade />
      </div>
    </div>
  </div>
</template>
