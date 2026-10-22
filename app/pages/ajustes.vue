<script setup lang="ts">
import type { Preferencias, TemaPreferido } from '#shared/types/preferencias'
import type { EstadoDaNotificacao } from '~/utils/notificacaoLocal'

useSeoMeta({ title: 'Ajustes · Parô' })

const { preferencias, salvar, escolherTema } = usePreferencias()
const { areas, areaAtual, escolherArea } = useAreaAtual()
const { apagarHistorico } = useVaga()
const { conta, apagarMeusDados } = useConta()
const { pedirPermissao } = useLocalizacao()
const { apagarPontos } = usePontoDaVaga()
const toast = useToast()
const confirmarApagar = ref(false)
const confirmarApagarDados = ref(false)
const apagando = ref(false)

const corpoDoCard = 'flex flex-col gap-4 p-5 sm:p-5 lg:p-6'
const listaSemBordas = '[&>*:first-child]:pt-0 [&>*:last-child]:pb-0 [&>li:first-child>*]:pt-0 [&>li:last-child>*]:pb-0'
const itemDePrivacidade = 'flex w-full items-center gap-3 py-4 text-left text-corpo font-bold text-highlighted outline-primary focus-visible:outline-2'

const temas = [
  { label: 'Claro', value: 'claro' },
  { label: 'Escuro', value: 'escuro' },
  { label: 'Sistema', value: 'sistema' },
]

const opcoesDeLocal = computed(() =>
  areas.value
    .filter(area => area.ruasMedidas > 0)
    .map(area => ({
      label: `${area.nome}, ${area.cidade} · entorno da ${area.nomeDaReferencia}`,
      value: area.id,
    })),
)

const tema = computed({
  get: () => preferencias.value.tema,
  set: (valor: TemaPreferido) => escolherTema(valor),
})

function ligacao<Chave extends keyof Preferencias>(chave: Chave) {
  return computed({
    get: () => preferencias.value[chave],
    set: (valor: Preferencias[Chave]) =>
      salvar({ [chave]: valor, consentimento: true }),
  })
}

function ligacaoDeLocalizacao(
  chave: 'localizacaoAoLigar' | 'localizacaoContinua',
) {
  return computed({
    get: () => preferencias.value[chave],
    set: async (valor: boolean) => {
      if (valor && !(await pedirPermissao())) return
      await salvar({ [chave]: valor, consentimento: true })
      if (valor && chave === 'localizacaoContinua') await ativarNotificacoes()
    },
  })
}

const notificacao = ref<EstadoDaNotificacao>('sem_suporte')
const dicaDoIphone = ref(false)

onMounted(() => {
  notificacao.value = estadoDaNotificacao()
  dicaDoIphone.value = ehIphoneSemInstalar()
})

async function ativarNotificacoes() {
  notificacao.value = await pedirPermissaoDeNotificacao()
}

const localizacaoAoLigar = ligacaoDeLocalizacao('localizacaoAoLigar')
const localizacaoContinua = ligacaoDeLocalizacao('localizacaoContinua')
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
  if (resultado)
    toast.add({
      title: 'Histórico apagado',
      description: `${resultado.apagadas} ${resultado.apagadas === 1 ? 'vaga apagada' : 'vagas apagadas'} do banco.`,
      color: 'success',
    })
}

async function apagarDados() {
  apagando.value = true
  const apagou = await apagarMeusDados()
  apagando.value = false
  confirmarApagarDados.value = false
  if (!apagou)
    return toast.add({
      title: 'Não foi possível apagar',
      description: 'Confira a conexão e tente de novo.',
      color: 'error',
    })
  apagarPontos()
  toast.add({
    title: 'Seus dados foram apagados',
    description:
      'E-mail, reputação, vagas e preferências saíram do banco. Os relatos ficaram só como contagem anônima.',
    color: 'success',
  })
}
</script>

<template>
  <div>
    <CabecalhoPainel titulo="Ajustes" />
    <!--
      Guia de layout no desktop: 2 colunas (1,3fr e 1fr) e 3 linhas, com 16 px entre os cards
      e 24 px de borda. Linha 1: "Como você ajuda" e "Aparência"; linha 2: "Seus relatos" +
      "Notificações" ao lado de "Privacidade", com as bases alinhadas; linha 3: rodapé.
      Todo card usa o mesmo padding nos quatro lados (20 px no celular, 24 px no desktop).
    -->
    <div
      class="flex flex-col gap-6 lg:grid lg:min-h-0 lg:flex-1 lg:grid-cols-[1.3fr_1fr] lg:grid-rows-[auto_minmax(0,1fr)_auto] lg:gap-4 lg:p-6"
    >
      <CabecalhoDeTarefa
        titulo="Ajustes"
        voltar-para="/vaga"
        class="lg:hidden"
      />

      <UCard
        class="lg:col-start-1 lg:row-start-1"
        :ui="{ body: corpoDoCard }"
      >
        <h2
          id="titulo-ajuda"
          class="etiqueta text-primary"
        >
          Como você ajuda a previsão
        </h2>
        <div
          class="divide-y divide-default"
          :class="listaSemBordas"
          aria-labelledby="titulo-ajuda"
          role="group"
        >
          <OpcaoComInterruptor
            v-model="localizacaoAoLigar"
            titulo="Localização só quando eu ligar"
            descricao="Você ativa na hora de estacionar."
            recomendado
          />
          <OpcaoComInterruptor
            v-model="localizacaoContinua"
            titulo="Localização anônima e contínua"
            descricao="Com o app aberto, percebe quando você estaciona e pergunta se quer registrar a vaga. A posição fica só neste aparelho."
          />
          <div
            v-if="localizacaoContinua && (notificacao === 'default' || dicaDoIphone)"
            class="flex flex-col gap-3 py-4"
          >
            <UButton
              v-if="notificacao === 'default'"
              color="neutral"
              variant="outline"
              icon="i-lucide-bell-ring"
              class="w-fit"
              @click="ativarNotificacoes"
            >
              Ativar notificações de vaga
            </UButton>
            <p
              v-if="dicaDoIphone"
              class="flex items-start gap-2 text-nota text-muted"
            >
              <UIcon
                name="i-lucide-smartphone"
                class="mt-0.5 size-4 shrink-0"
              />
              No iPhone, adicione o Parô à tela inicial (Compartilhar › Adicionar à Tela de Início) para receber o aviso de vaga.
            </p>
          </div>
          <OpcaoComInterruptor
            v-model="registroManual"
            titulo="Registrar horários manualmente"
            descricao="Você informa a chegada e a saída."
          />
        </div>
        <p class="text-nota text-muted">
          Na pesquisa, 55% dos respondentes preferiram compartilhar a
          localização só quando ligassem a opção.
        </p>
      </UCard>

      <div class="flex flex-col gap-6 lg:col-start-1 lg:row-start-2 lg:min-h-0 lg:gap-4">
        <UCard
          v-if="conta.data.value.disponivel"
          :ui="{ body: corpoDoCard }"
        >
          <h2 class="etiqueta text-primary">
            Seus relatos
          </h2>
          <p
            v-if="conta.data.value.verificado"
            class="flex items-center gap-2 text-corpo font-bold text-highlighted"
          >
            <UIcon
              name="i-lucide-circle-check"
              class="size-5 shrink-0 text-primary"
            />
            E-mail verificado neste aparelho. Seus relatos pesam mais.
          </p>
          <template v-else>
            <p class="text-legenda text-muted">
              Verifique o e-mail uma vez neste aparelho. Ele libera a entrada no
              app e faz os seus relatos pesarem mais na chance de vaga.
              Guardamos só uma versão embaralhada dele.
            </p>
            <VerificarEmail />
          </template>
        </UCard>

        <UCard
          class="lg:flex-1"
          :ui="{ body: corpoDoCard }"
        >
          <h2 class="etiqueta text-primary">
            Notificações
          </h2>
          <div :class="listaSemBordas">
            <OpcaoComInterruptor
              v-model="lembrarSaida"
              titulo="Lembrar de registrar a saída"
              descricao="Um lembrete perto do seu horário de saída habitual."
            />
          </div>
        </UCard>
      </div>

      <UCard
        class="lg:col-start-2 lg:row-start-1"
        :ui="{ body: corpoDoCard }"
      >
        <h2 class="etiqueta text-primary">
          Aparência
        </h2>
        <ClientOnly>
          <UTabs
            v-model="tema"
            :items="temas"
            :content="false"
            :ui="{
              list: 'h-11 rounded-alerta bg-muted p-1',
              trigger: 'h-9 flex-1 text-interface font-semibold',
              indicator: 'rounded-botao bg-primary',
            }"
            aria-label="Tema"
          />
        </ClientOnly>
        <h2 class="etiqueta pt-2 text-primary">
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
        class="lg:col-start-2 lg:row-start-2"
        :ui="{ body: corpoDoCard }"
      >
        <h2 class="etiqueta text-primary">
          Privacidade
        </h2>
        <ul
          class="divide-y divide-default"
          :class="listaSemBordas"
        >
          <li>
            <NuxtLink
              to="/termos"
              :class="itemDePrivacidade"
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
              :class="itemDePrivacidade"
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
          <li>
            <button
              type="button"
              :class="itemDePrivacidade"
              @click="confirmarApagarDados = true"
            >
              <UIcon
                name="i-lucide-user-x"
                class="size-5"
              />
              <span class="flex-1">Apagar meus dados</span>
              <UIcon
                name="i-lucide-chevron-right"
                class="size-5 text-muted"
              />
            </button>
          </li>
        </ul>
        <AvisoPrivacidade
          texto="O Parô não pede placa, CPF, nome ou telefone. A localização da vaga fica só com você."
          class="text-nota! font-normal! text-highlighted!"
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
      <p class="text-center text-nota text-muted lg:col-span-2 lg:row-start-3">
        Parô · versão do protótipo ·
        <NuxtLink
          to="/admin"
          class="underline"
        >
          Área de admin
        </NuxtLink>
      </p>
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

    <UModal
      v-model:open="confirmarApagarDados"
      title="Apagar todos os seus dados?"
      description="Sai do banco o e-mail verificado, a reputação, as vagas e as preferências deste aparelho. Os relatos já enviados ficam só como contagem anônima, sem vínculo com você. Não dá para desfazer."
      :ui="{ footer: 'justify-end gap-3' }"
    >
      <template #footer>
        <UButton
          color="neutral"
          variant="outline"
          @click="confirmarApagarDados = false"
        >
          Cancelar
        </UButton>
        <UButton
          color="neutral"
          icon="i-lucide-user-x"
          :loading="apagando"
          @click="apagarDados"
        >
          Apagar meus dados
        </UButton>
      </template>
    </UModal>
  </div>
</template>
