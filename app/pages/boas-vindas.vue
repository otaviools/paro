<script setup lang="ts">
import { COOKIE_DE_BOAS_VINDAS } from '~/middleware/primeira-visita.global'

definePageMeta({ layout: false })
useSeoMeta({ title: 'Bem Vindo | Parô' })

const rota = useRoute()
const { preferencias, salvar } = usePreferencias()
const visitou = useCookie<string | null>(COOKIE_DE_BOAS_VINDAS, {
  maxAge: 60 * 60 * 24 * 365,
  sameSite: 'lax',
})
const salvando = ref(false)
const { conta } = useConta()
const { pedirPermissao } = useLocalizacao()
const emailVerificado = computed(() => conta.data.value.verificado)
// Com a verificação ligada no servidor, o e-mail é o passo que conclui a entrada: ao verificar,
// salvamos as escolhas e seguimos. Sem ela, valem os botões Começar e Agora não.
const emailObrigatorio = computed(() => conta.data.value.disponivel)

const escolha = reactive({
  localizacaoAoLigar: preferencias.value.localizacaoAoLigar,
  localizacaoContinua: preferencias.value.localizacaoContinua,
})

async function escolherLocalizacao(
  chave: 'localizacaoAoLigar' | 'localizacaoContinua',
  valor: boolean,
) {
  if (valor && !(await pedirPermissao())) return
  escolha[chave] = valor
  if (valor && chave === 'localizacaoContinua') await pedirPermissaoDeNotificacao()
}

const destino = computed(() =>
  typeof rota.query.de === 'string' && rota.query.de.startsWith('/')
    ? rota.query.de
    : '/',
)

async function comecar() {
  salvando.value = true
  const salvou = await salvar({ ...escolha, consentimento: true })
  salvando.value = false
  if (!salvou) return
  visitou.value = 'sim'
  await navigateTo(destino.value)
}

// Ao acertar o código, a conta passa a verificada e o formulário dá lugar à confirmação. O
// VerificarEmail é desmontado antes de emitir "verificado" (o Vue descarta eventos de
// componentes desmontados), então a entrada segue a partir da própria conta.
watch(emailVerificado, (verificado, antes) => {
  if (verificado && !antes && emailObrigatorio.value) comecar()
})

const pontos = [
  {
    icone: 'i-lucide-map',
    titulo: 'Chance de vaga por rua',
    texto:
      'Faixas estimadas a partir de medições de campo no entorno da ESAMC.',
  },
  {
    icone: 'i-lucide-clock',
    titulo: 'Agora ou mais tarde',
    texto: 'Compare a chance agora e às 19h, 21h e 22h antes de sair.',
  },
  {
    icone: 'i-lucide-shield-check',
    titulo: 'Só o e-mail',
    texto:
      'Sem nome, telefone ou placa. O e-mail fica guardado só embaralhado, nunca o endereço.',
  },
]

async function agoraNao() {
  visitou.value = 'sim'
  await navigateTo(destino.value)
}
</script>

<template>
  <main
    class="relative min-h-dvh bg-(--app-fundo-pagina) lg:grid lg:h-dvh lg:grid-cols-2 lg:overflow-hidden"
  >
    <!--
      Celular: uma coluna só. Desktop: duas colunas na altura da tela, sem rolagem,
      com o painel da marca à esquerda e a escolha de como ajudar a previsão à direita.
    -->
    <aside
      class="relative hidden flex-col justify-between overflow-hidden bg-asfalto-950 p-16 text-(--paro-creme) lg:flex"
    >
      <!-- Fundo mais escuro que o asfalto e radar esmaecido: some de vez perto dos textos. -->
      <img
        src="/marca/grafismos/detalhe-4-radar-fundo-escuro.svg"
        alt=""
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 size-full object-cover opacity-[0.06]"
      >
      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 bg-linear-to-t from-asfalto-950 via-asfalto-950/70 to-asfalto-950/20"
      />
      <img
        src="/marca/logo/logo-paro-fundo-escuro.svg"
        alt="Parô"
        class="relative w-40"
      >
      <div class="relative flex max-w-lg flex-col gap-10">
        <div class="flex flex-col gap-4">
          <p class="text-hero font-extrabold tracking-tight">
            Chegue sabendo.
          </p>
          <p class="text-destaque text-(--app-texto-no-destaque)">
            Veja a chance de vaga por rua e horário antes de sair de casa.
          </p>
        </div>
        <ul class="flex flex-col gap-6">
          <li
            v-for="ponto in pontos"
            :key="ponto.titulo"
            class="flex items-start gap-4"
          >
            <span
              class="grid size-12 shrink-0 place-items-center rounded-alerta bg-(--paro-azul)/15"
            >
              <UIcon
                :name="ponto.icone"
                class="size-5 text-(--paro-azul)"
              />
            </span>
            <span class="flex flex-col gap-1">
              <span class="text-corpo font-bold">{{ ponto.titulo }}</span>
              <span class="text-legenda text-(--app-texto-no-destaque)">{{
                ponto.texto
              }}</span>
            </span>
          </li>
        </ul>
      </div>
      <p class="relative text-nota text-(--app-texto-no-destaque)">
        Menos volta, mais vaga.
      </p>
    </aside>
    <!--
      Divisa em bolhas (bubble-side-divider.svg) girada para a vertical: a borda reta
      encosta no painel e a onda avança sobre a coluna da direita, na cor do painel.
    -->
    <svg
      aria-hidden="true"
      viewBox="0 0 100 1000"
      preserveAspectRatio="none"
      class="pointer-events-none absolute inset-y-0 left-1/2 z-10 hidden h-full w-20 -translate-x-px fill-asfalto-950 lg:block"
    >
      <path
        d="M0 1000V0h52C28 62.5 4 125 4 250c0 250 96 250 96 500 0 125-24 187.5-48 250H0Z"
      />
    </svg>

    <div
      class="relative mx-auto flex min-h-dvh max-w-md flex-col gap-8 px-6 pt-12 pb-8 *:shrink-0 lg:h-full lg:min-h-0 lg:w-full lg:max-w-xl lg:justify-center-safe lg:gap-4 lg:overflow-y-auto lg:pr-12 lg:pl-24 lg:py-8"
    >
      <Grafismo
        nome="detalhe-1-malha"
        class="h-56 [mask-image:linear-gradient(to_bottom,black,transparent)] lg:hidden"
      />
      <div class="relative flex justify-end lg:fixed lg:top-6 lg:right-6">
        <BotaoTema />
      </div>
      <section
        class="relative flex flex-col items-center gap-3 text-center lg:hidden"
      >
        <LogoParo class="w-40" />
        <h1 class="mt-6 text-titulo font-bold text-highlighted">
          Chegue sabendo.
        </h1>
        <p class="max-w-72 text-corpo text-muted">
          Veja a chance de vaga por rua e horário antes de sair de casa.
        </p>
      </section>
      <div class="hidden flex-col gap-2 lg:flex">
        <h1 class="text-titulo font-bold text-highlighted">
          Antes de começar
        </h1>
        <p class="text-corpo text-muted">
          Escolha como você quer ajudar a previsão. Dá para mudar quando quiser.
        </p>
      </div>

      <UCard :ui="{ body: 'flex flex-col gap-4 p-5 sm:p-5' }">
        <h2 class="etiqueta text-primary">
          Como você quer ajudar a previsão?
        </h2>
        <div class="flex items-start justify-between gap-4">
          <div class="flex flex-col gap-1">
            <p
              id="opcao-ao-ligar"
              class="text-corpo font-bold text-highlighted"
            >
              Localização só quando eu ligar
            </p>
            <p class="text-legenda text-muted">
              Você ativa na hora de estacionar.
            </p>
            <UBadge
              label="Recomendado"
              color="neutral"
              variant="soft"
              class="mt-1 w-fit rounded-badge bg-accented"
            />
          </div>
          <USwitch
            :model-value="escolha.localizacaoAoLigar"
            aria-labelledby="opcao-ao-ligar"
            size="lg"
            @update:model-value="escolherLocalizacao('localizacaoAoLigar', $event)"
          />
        </div>
        <USeparator />
        <div class="flex items-start justify-between gap-4">
          <div class="flex flex-col gap-1">
            <p
              id="opcao-continua"
              class="text-corpo font-bold text-highlighted"
            >
              Localização anônima e contínua
            </p>
            <p class="text-legenda text-muted">
              Com o app aberto, pergunta se você estacionou.
            </p>
          </div>
          <USwitch
            :model-value="escolha.localizacaoContinua"
            aria-labelledby="opcao-continua"
            size="lg"
            @update:model-value="escolherLocalizacao('localizacaoContinua', $event)"
          />
        </div>
      </UCard>

      <UCard
        v-if="emailObrigatorio"
        :ui="{ body: 'flex flex-col gap-4 p-5 sm:p-5' }"
      >
        <div class="flex flex-col gap-1">
          <h2 class="etiqueta text-primary">
            Entre com o seu e-mail
          </h2>
          <p class="text-legenda text-muted">
            Verifique o e-mail uma vez neste aparelho para entrar. Ele também
            faz os seus relatos pesarem mais na chance de vaga. Guardamos só uma
            versão embaralhada dele, nunca o endereço, e nunca mandamos
            propaganda.
          </p>
        </div>
        <p
          v-if="emailVerificado"
          class="flex items-center gap-2 text-corpo font-bold text-highlighted"
          role="status"
        >
          <UIcon
            name="i-lucide-circle-check"
            class="size-5 text-primary"
          />
          E-mail verificado. Seus relatos pesam mais.
        </p>
        <VerificarEmail v-else />
      </UCard>

      <p class="text-nota text-muted">
        Ao entrar, você concorda em guardar um identificador anônimo deste
        aparelho, os horários das suas vagas e os seus relatos, para estimar a
        chance de vaga<template v-if="emailObrigatorio">
          , e uma versão
          embaralhada do seu e-mail
        </template>. Sem nome, telefone ou placa.
        <NuxtLink
          to="/termos"
          class="font-semibold text-primary underline"
        >
          Termos e privacidade
        </NuxtLink>
      </p>

      <div
        v-if="!emailObrigatorio"
        class="mt-auto flex flex-col items-center gap-3 lg:mt-0 lg:flex-row-reverse"
      >
        <UButton
          block
          size="xl"
          class="h-14 text-botao"
          :loading="salvando"
          @click="comecar"
        >
          Começar
        </UButton>
        <UButton
          color="neutral"
          variant="ghost"
          class="text-destaque font-semibold whitespace-nowrap text-muted lg:h-14 lg:shrink-0 lg:px-6"
          @click="agoraNao"
        >
          Agora não
        </UButton>
        <p class="text-nota text-muted lg:hidden">
          Você pode mudar isso depois em
          <span class="font-semibold text-primary">Ajustes</span>.
        </p>
      </div>
    </div>
  </main>
</template>
