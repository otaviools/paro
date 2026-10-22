<script setup lang="ts">
useSeoMeta({ title: 'Admin · Parô', robots: 'noindex, nofollow' })

const { sessao, entrar, sair } = useSessaoDeAdmin()
await sessao
const resumo = useResumoDasContagens()
const acerto = useAcertoDaPrevisao()
const calibracao = useCalibracao()
const toast = useToast()

const erroAoEntrar = ref<string | null>(null)
const entrando = ref(false)
const ruaId = ref<string>()
const data = ref(hojeEmSaoPaulo())
const linhas = ref<LinhaDaGrade[]>(linhasVazias())
const carregando = ref(false)
const salvando = ref(false)
const capacidade = ref<number | null>(null)
const salvandoCapacidade = ref(false)

const admin = computed(() => sessao.data.value.admin)
const opcoesDeRua = computed(() => resumo.data.value.map(rua => ({ label: rua.nome, value: rua.ruaId })))
const ruaAtual = computed(() => resumo.data.value.find(rua => rua.ruaId === ruaId.value))
const nomeDaRua = computed(() => ruaAtual.value?.nome ?? '')
const temProblema = computed(() => linhas.value.some(linha => problemaDaLinha(linha)))
const preenchidas = computed(() => contagensDasLinhas(linhas.value).length)

watch(admin, async (ehAdmin) => {
  if (!ehAdmin) return
  await Promise.all([resumo.execute(), acerto.execute(), calibracao.execute()])
  ruaId.value ??= resumo.data.value[0]?.ruaId
}, { immediate: true })

watch([ruaId, data], async ([rua, dia]) => {
  if (!rua || !dia) return
  carregando.value = true
  capacidade.value = ruaAtual.value?.capacidade ?? null
  linhas.value = preencherLinhas(await carregarContagens(rua, dia).catch(() => []), capacidade.value)
  carregando.value = false
})

function lerCapacidade(valor: string | number | null | undefined): number | null {
  const numero = Number(valor)
  return valor === '' || valor === null || valor === undefined || !Number.isFinite(numero) ? null : Math.trunc(numero)
}

async function gravarCapacidade() {
  if (!ruaId.value) return
  salvandoCapacidade.value = true
  try {
    await salvarCapacidade(ruaId.value, capacidade.value || null)
    linhas.value = linhas.value.map(linha => linha.vagasOcupadas === null ? { ...linha, vagasTotais: capacidade.value || null } : linha)
    toast.add({ title: 'Capacidade salva', description: `${nomeDaRua.value}: ${capacidade.value ? `cerca de ${capacidade.value} vagas` : 'sem capacidade definida'}.`, color: 'success' })
    await resumo.refresh()
  }
  catch (erro) {
    toast.add({ title: 'Não foi possível salvar', description: mensagemDoErro(erro), color: 'error' })
  }
  finally {
    salvandoCapacidade.value = false
  }
}

async function aoEntrar(senha: string) {
  entrando.value = true
  erroAoEntrar.value = await entrar(senha)
  entrando.value = false
}

async function gravar(contagens = contagensDasLinhas(linhas.value)) {
  if (!ruaId.value) return
  salvando.value = true
  try {
    const { gravadas } = await salvarContagens(ruaId.value, data.value, contagens)
    toast.add({ title: 'Contagens salvas', description: `${gravadas} faixas da ${nomeDaRua.value} em ${formatarDataCurta(`${data.value}T12:00:00-03:00`)}.`, color: 'success' })
    await Promise.all([resumo.refresh(), calibracao.refresh(), refreshNuxtData()])
  }
  catch (erro) {
    toast.add({ title: 'Não foi possível salvar', description: mensagemDoErro(erro), color: 'error' })
  }
  finally {
    salvando.value = false
  }
}

async function limparDia() {
  linhas.value = linhasVazias(capacidade.value)
  await gravar([])
}
</script>

<template>
  <div>
    <CabecalhoPainel
      titulo="Admin"
      subtitulo="Contagens de vagas feitas em campo"
    >
      <UButton
        v-if="admin"
        color="neutral"
        variant="outline"
        icon="i-lucide-log-out"
        class="h-10"
        @click="sair"
      >
        Sair do admin
      </UButton>
    </CabecalhoPainel>

    <div class="flex flex-col gap-6 lg:p-8">
      <CabecalhoDeTarefa
        titulo="Admin"
        voltar-para="/ajustes"
        class="lg:hidden"
      >
        <UButton
          v-if="admin"
          color="neutral"
          variant="ghost"
          icon="i-lucide-log-out"
          aria-label="Sair do admin"
          @click="sair"
        />
      </CabecalhoDeTarefa>

      <EntrarAdmin
        v-if="!admin"
        class="lg:max-w-md"
        :configurado="sessao.data.value.configurado"
        :erro="erroAoEntrar"
        :entrando="entrando"
        @entrar="aoEntrar"
      />

      <div
        v-else
        class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:items-start"
      >
        <ResumoDasContagens
          :ruas="resumo.data.value"
          @escolher="ruaId = $event"
        />

        <UCard :ui="{ body: 'flex flex-col gap-5 p-5 sm:p-6' }">
          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField
              label="Rua"
              :ui="{ label: 'text-interface font-bold' }"
            >
              <USelect
                v-model="ruaId"
                :items="opcoesDeRua"
                placeholder="Escolha a rua"
                class="w-full"
              />
            </UFormField>
            <UFormField
              label="Data da contagem"
              :ui="{ label: 'text-interface font-bold' }"
            >
              <UInput
                v-model="data"
                type="date"
                :max="hojeEmSaoPaulo()"
                class="w-full"
              />
            </UFormField>
          </div>

          <form
            class="flex flex-col gap-2 sm:flex-row sm:items-end"
            @submit.prevent="gravarCapacidade"
          >
            <UFormField
              label="Capacidade fixa da rua"
              hint="vagas contadas"
              class="flex-1"
              :ui="{ label: 'text-interface font-bold' }"
            >
              <UInput
                :model-value="capacidade ?? undefined"
                type="number"
                inputmode="numeric"
                min="1"
                max="500"
                class="w-full"
                @update:model-value="capacidade = lerCapacidade($event)"
              />
            </UFormField>
            <UButton
              type="submit"
              color="neutral"
              variant="outline"
              icon="i-lucide-save"
              :loading="salvandoCapacidade"
              :disabled="!ruaId"
            >
              Salvar capacidade
            </UButton>
          </form>
          <p class="-mt-2 text-nota text-muted">
            Preenche o total das faixas vazias. O app mostra “cerca de N vagas na rua”, nunca “X de N ocupadas”.
          </p>

          <p
            v-if="carregando"
            class="text-legenda text-muted"
            aria-live="polite"
          >
            Carregando contagens…
          </p>
          <GradeDeContagens
            v-else
            v-model="linhas"
          />

          <div class="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <UButton
              color="neutral"
              variant="outline"
              icon="i-lucide-trash-2"
              :disabled="salvando || !ruaId"
              @click="limparDia"
            >
              Apagar contagens deste dia
            </UButton>
            <UButton
              icon="i-lucide-save"
              :loading="salvando"
              :disabled="!ruaId || temProblema"
              @click="gravar()"
            >
              Salvar {{ preenchidas }} {{ preenchidas === 1 ? 'faixa' : 'faixas' }}
            </UButton>
          </div>
          <p class="text-nota text-muted">
            Salvar substitui as contagens desta rua nesta data. A previsão passa a usar os novos números na hora.
          </p>
        </UCard>

        <AcertoDaPrevisao :linhas="acerto.data.value" />
        <QuadroDeCalibracao :linhas="calibracao.data.value" />
      </div>
    </div>
  </div>
</template>
