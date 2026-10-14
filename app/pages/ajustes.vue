<script setup lang="ts">
import type { Preferencias, TemaPreferido } from '#shared/types/preferencias'

useSeoMeta({ title: 'Ajustes · Parô' })

const { preferencias, salvar, escolherTema } = usePreferencias()
const { areas, areaAtual, escolherArea } = useAreaAtual()
const { apagarHistorico } = useVaga()
const toast = useToast()
const confirmarApagar = ref(false)
const apagando = ref(false)

const temas = [
  { label: 'Claro', value: 'claro' },
  { label: 'Escuro', value: 'escuro' },
  { label: 'Sistema', value: 'sistema' },
]

const opcoesDeLocal = computed(() => areas.value
  .filter(area => area.ruasMedidas > 0)
  .map(area => ({ label: `${area.nome}, ${area.cidade} · entorno da ${area.nomeDaReferencia}`, value: area.id })))

const tema = computed({
  get: () => preferencias.value.tema,
  set: (valor: TemaPreferido) => escolherTema(valor),
})

function ligacao<Chave extends keyof Preferencias>(chave: Chave) {
  return computed({
    get: () => preferencias.value[chave],
    set: (valor: Preferencias[Chave]) => salvar({ [chave]: valor, consentimento: true }),
  })
}

const localizacaoAoLigar = ligacao('localizacaoAoLigar')
const localizacaoContinua = ligacao('localizacaoContinua')
const registroManual = ligacao('registroManual')
const lembrarSaida = ligacao('lembrarSaida')

const localPadrao = computed({
  get: () => areaAtual.value?.id,
  set: (id: string | undefined) => {
    if (!id) return
    escolherArea(id)
    salvar({ areaPadraoId: id })
  },
})

async function apagar() {
  apagando.value = true
  const resultado = await apagarHistorico()
  apagando.value = false
  confirmarApagar.value = false
  if (resultado) toast.add({ title: 'Histórico apagado', description: `${resultado.apagadas} ${resultado.apagadas === 1 ? 'vaga apagada' : 'vagas apagadas'} do banco.`, color: 'success' })
}
</script>

<template>
  <div>
    <CabecalhoPainel
      titulo="Ajustes"
      subtitulo="Como você ajuda a previsão, aparência e privacidade"
    />
    <div class="flex flex-col gap-6 lg:grid lg:min-h-0 lg:flex-1 lg:grid-cols-[1.3fr_1fr] lg:gap-4 lg:p-6">
      <CabecalhoDeTarefa
        titulo="Ajustes"
        voltar-para="/vaga"
        class="lg:hidden"
      />

      <div class="flex flex-col gap-6 lg:gap-4">
        <section
          class="flex flex-col gap-3"
          aria-labelledby="titulo-ajuda"
        >
          <UCard :ui="{ body: 'flex flex-col px-4 py-1 sm:px-6 sm:py-3' }">
            <h2
              id="titulo-ajuda"
              class="etiqueta pt-3 text-primary"
            >
              Como você ajuda a previsão
            </h2>
            <div class="divide-y divide-default">
              <OpcaoComInterruptor
                v-model="localizacaoAoLigar"
                titulo="Localização só quando eu ligar"
                descricao="Você ativa na hora de estacionar."
                recomendado
              />
              <OpcaoComInterruptor
                v-model="localizacaoContinua"
                titulo="Localização anônima e contínua"
                descricao="Funciona em segundo plano, sem identificar você."
              />
              <OpcaoComInterruptor
                v-model="registroManual"
                titulo="Registrar horários manualmente"
                descricao="Você informa a chegada e a saída."
              />
            </div>
            <p class="pb-3 text-nota text-muted">
              Na pesquisa, 55% dos respondentes preferiram compartilhar a localização só quando ligassem a opção.
            </p>
          </UCard>
        </section>

        <UCard
          class="lg:flex-1"
          :ui="{ body: 'flex flex-col px-4 py-1 sm:px-6 sm:py-3' }"
        >
          <h2 class="etiqueta pt-3 text-primary">
            Notificações
          </h2>
          <OpcaoComInterruptor
            v-model="lembrarSaida"
            titulo="Lembrar de registrar a saída"
            descricao="Um lembrete perto do seu horário de saída habitual."
          />
        </UCard>
      </div>

      <div class="flex flex-col gap-6 lg:gap-4">
        <UCard :ui="{ body: 'flex flex-col gap-4 p-4 sm:p-6' }">
          <h2 class="etiqueta text-primary">
            Aparência
          </h2>
          <ClientOnly>
            <UTabs
              v-model="tema"
              :items="temas"
              :content="false"
              :ui="{ list: 'h-11 rounded-alerta bg-muted p-1', trigger: 'h-9 flex-1 text-interface font-semibold', indicator: 'rounded-botao bg-primary' }"
              aria-label="Tema"
            />
          </ClientOnly>
          <h2 class="etiqueta mt-2 text-primary">
            Local padrão
          </h2>
          <USelect
            v-model="localPadrao"
            :items="opcoesDeLocal"
            icon="i-lucide-map-pin"
            size="xl"
            class="w-full"
            aria-label="Local padrão"
          />
        </UCard>

        <UCard
          id="privacidade"
          class="lg:flex-1"
          :ui="{ body: 'flex flex-col px-4 py-1 sm:px-6 sm:py-3' }"
        >
          <h2 class="etiqueta pt-3 text-primary">
            Privacidade
          </h2>
          <ul class="divide-y divide-default">
            <li>
              <NuxtLink
                to="/termos"
                class="flex items-center gap-3 py-4 text-corpo font-bold text-highlighted"
              >
                <UIcon
                  name="i-lucide-file-text"
                  class="size-5"
                />
                <span class="flex-1">Termos e privacidade</span>
                <UIcon
                  name="i-lucide-chevron-right"
                  class="size-5 text-muted"
                />
              </NuxtLink>
            </li>
            <li>
              <button
                type="button"
                class="flex w-full items-center gap-3 py-4 text-left text-corpo font-bold text-highlighted"
                @click="confirmarApagar = true"
              >
                <UIcon
                  name="i-lucide-trash-2"
                  class="size-5"
                />
                <span class="flex-1">Apagar meu histórico</span>
                <UIcon
                  name="i-lucide-chevron-right"
                  class="size-5 text-muted"
                />
              </button>
            </li>
          </ul>
          <AvisoPrivacidade
            texto="O Parô não pede placa, CPF, nome ou telefone. A localização da vaga fica só com você."
            class="pb-4 text-nota! font-normal! text-highlighted!"
          />
        </UCard>

        <UButton
          to="/pesquisa"
          color="neutral"
          variant="outline"
          block
          icon="i-lucide-chart-column"
          trailing-icon="i-lucide-chevron-right"
          class="h-13 justify-start text-destaque lg:hidden [&>span:last-child]:ml-auto"
        >
          Resultados da pesquisa
        </UButton>
        <p class="text-center text-nota text-muted lg:hidden">
          Parô · versão do protótipo
        </p>
      </div>
    </div>

    <UModal
      v-model:open="confirmarApagar"
      title="Apagar todo o histórico?"
      description="As vagas deste aparelho saem do banco de dados agora. Não dá para desfazer."
      :ui="{ footer: 'justify-end gap-3' }"
    >
      <template #footer>
        <UButton
          color="neutral"
          variant="outline"
          @click="confirmarApagar = false"
        >
          Cancelar
        </UButton>
        <UButton
          color="neutral"
          icon="i-lucide-trash-2"
          :loading="apagando"
          @click="apagar"
        >
          Apagar histórico
        </UButton>
      </template>
    </UModal>
  </div>
</template>
