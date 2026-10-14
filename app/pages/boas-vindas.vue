<script setup lang="ts">
import { COOKIE_DE_BOAS_VINDAS } from '~/middleware/primeira-visita.global'

definePageMeta({ layout: false })
useSeoMeta({ title: 'Boas-vindas · Parô' })

const rota = useRoute()
const { preferencias, salvar } = usePreferencias()
const visitou = useCookie<string | null>(COOKIE_DE_BOAS_VINDAS, {
  maxAge: 60 * 60 * 24 * 365,
  sameSite: 'lax',
})
const salvando = ref(false)

const escolha = reactive({
  localizacaoAoLigar: preferencias.value.localizacaoAoLigar,
  localizacaoContinua: preferencias.value.localizacaoContinua,
})

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

async function agoraNao() {
  visitou.value = 'sim'
  await navigateTo(destino.value)
}
</script>

<template>
  <main
    class="relative mx-auto flex min-h-dvh max-w-md flex-col gap-8 px-6 pt-12 pb-8"
  >
    <Grafismo
      nome="detalhe-1-malha"
      class="h-56 [mask-image:linear-gradient(to_bottom,black,transparent)]"
    />
    <div class="relative flex justify-end">
      <BotaoTema />
    </div>
    <section class="relative flex flex-col items-center gap-3 text-center">
      <LogoParo class="w-40" />
      <h1 class="mt-6 text-titulo font-bold text-highlighted">
        Chegue sabendo.
      </h1>
      <p class="max-w-72 text-corpo text-muted">
        Veja a chance de vaga por rua e horário antes de sair de casa.
      </p>
    </section>

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
          v-model="escolha.localizacaoAoLigar"
          aria-labelledby="opcao-ao-ligar"
          size="lg"
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
            Funciona em segundo plano.
          </p>
        </div>
        <USwitch
          v-model="escolha.localizacaoContinua"
          aria-labelledby="opcao-continua"
          size="lg"
        />
      </div>
    </UCard>

    <p class="text-nota text-muted">
      Ao começar, você concorda em guardar neste aparelho um identificador
      anônimo e os horários das suas vagas, para estimar a chance de vaga. Sem
      cadastro, nome, telefone ou placa.
      <NuxtLink
        to="/termos"
        class="font-semibold text-primary underline"
      >
        Termos e privacidade
      </NuxtLink>
    </p>

    <div class="mt-auto flex flex-col items-center gap-3">
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
        class="text-destaque font-semibold text-muted"
        @click="agoraNao"
      >
        Agora não
      </UButton>
      <p class="text-nota text-muted">
        Você pode mudar isso depois em
        <span class="font-semibold text-primary">Ajustes</span>.
      </p>
    </div>
  </main>
</template>
