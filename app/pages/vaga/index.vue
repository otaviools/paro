<script setup lang="ts">
useSeoMeta({ title: 'Parô | Minha vaga' })

const rota = useRoute()
const { painel, vagaAtual, editar, sair, lerPonto } = useVaga()
await painel
const { data: historico } = await useHistorico()
const { data: pesquisa } = await usePesquisa()
const { areaAtual } = useAreaAtual()

const drawerAberto = ref(false)
const salvandoSaida = ref(false)
const saindo = ref(false)
const confirmarSaida = ref(rota.query.sair === '1' && Boolean(vagaAtual.value))
const ponto = ref<[number, number] | null>(null)
const telaGrande = useTelaGrande()

onMounted(() => {
  if (vagaAtual.value) ponto.value = lerPonto(vagaAtual.value.id)
})

const rotina = computed(() => painel.data.value.rotina)
const referencia = computed(() => areaAtual.value?.nomeDaReferencia ?? 'ESAMC')
const picoDaPesquisa = computed(() => pesquisa.value?.indicadores[0])

async function salvarSaida(saidaPrevista: string | null) {
  if (!vagaAtual.value) return
  salvandoSaida.value = true
  const salvo = await editar(vagaAtual.value.id, { saidaPrevista })
  salvandoSaida.value = false
  if (salvo) drawerAberto.value = false
}

async function avisar(ligado: boolean) {
  if (vagaAtual.value)
    await editar(vagaAtual.value.id, { avisarAoSair: ligado })
}

async function registrarSaida() {
  if (!vagaAtual.value) return
  saindo.value = true
  const vaga = await sair(vagaAtual.value.id)
  saindo.value = false
  if (vaga) await navigateTo(`/vaga/saida?id=${vaga.id}`)
}
</script>

<template>
  <div>
    <CabecalhoPainel titulo="Minha vaga" />
    <div
      class="flex flex-col gap-6 lg:grid lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-4 lg:p-6"
    >
      <CabecalhoMobile
        titulo="Minha vaga"
        :subtitulo="
          vagaAtual ? undefined : 'Onde você parou e sua rotina na região'
        "
        :tema="false"
      >
        <template
          v-if="vagaAtual"
          #extra
        >
          <UBadge
            color="neutral"
            variant="soft"
            class="rounded-full bg-accented"
          >
            <span class="size-2 rounded-full bg-primary" /> Ativa
          </UBadge>
        </template>
      </CabecalhoMobile>

      <UCard
        v-if="vagaAtual"
        :ui="{
          root: 'max-lg:contents lg:flex lg:min-h-0 lg:flex-col',
          body: 'flex flex-col gap-5 max-lg:contents lg:min-h-0 lg:flex-1 lg:gap-4 lg:overflow-y-auto lg:p-6',
        }"
      >
        <div class="hidden shrink-0 items-start justify-between lg:flex">
          <div>
            <h2 class="text-stat font-bold text-highlighted">
              {{ vagaAtual.nomeDaRua }}
            </h2>
          </div>
          <UBadge
            color="neutral"
            variant="soft"
            class="rounded-full bg-accented"
          >
            <span class="size-2 rounded-full bg-primary" /> Ativa
          </UBadge>
        </div>
        <div
          class="h-44 overflow-hidden rounded-card ring-1 ring-default lg:h-auto lg:min-h-48 lg:flex-1"
        >
          <MapaDaVaga
            :trajeto="vagaAtual.trajeto"
            :ponto="ponto"
            :rotulo-do-carro="`Você parou aqui · ${formatarHora(vagaAtual.chegada)}`"
            :rota="false"
          />
        </div>
        <div class="lg:hidden">
          <h2 class="text-stat font-bold text-highlighted">
            {{ vagaAtual.nomeDaRua }}
          </h2>
          <p class="text-legenda text-muted">
            perto da {{ referencia }}
          </p>
        </div>
        <StatsDaVaga
          :vaga="vagaAtual"
          @editar-saida="drawerAberto = true"
        />
        <section class="flex flex-col gap-2">
          <EtiquetaDeSecao texto="Linha do tempo de hoje" />
          <LinhaDoTempoDeVagas
            :vagas="[vagaAtual]"
            agora-marcado
          />
        </section>
        <UCard
          :ui="{
            root: 'lg:rounded-alerta lg:bg-muted lg:ring-0',
            body: 'p-4 sm:p-4',
          }"
        >
          <InterruptorAvisarSaida
            :model-value="vagaAtual.avisarAoSair"
            @update:model-value="avisar"
          />
        </UCard>
        <USeparator class="hidden lg:block" />
        <div class="flex flex-col gap-3 lg:grid lg:grid-cols-2">
          <UButton
            block
            size="xl"
            icon="i-lucide-log-out"
            trailing-icon="i-lucide-chevron-right"
            class="h-14 text-botao lg:h-12 lg:text-destaque"
            :loading="saindo"
            @click="confirmarSaida = true"
          >
            Estou saindo
          </UButton>
          <UButton
            to="/vaga/rota"
            block
            size="xl"
            color="neutral"
            variant="outline"
            icon="i-lucide-navigation"
            class="h-13 text-destaque lg:h-12"
          >
            Voltar até o carro
          </UButton>
        </div>
        <AvisoPrivacidade />
      </UCard>

      <template v-else>
        <EstadoVazio
          icone="i-lucide-car"
          titulo="Nenhuma vaga registrada agora"
          texto="Registre ao estacionar para lembrar onde parou e ajudar a previsão de quem chega."
        >
          <UButton
            to="/vaga/registrar"
            block
            size="xl"
            icon="i-lucide-square-parking"
            class="mt-2 h-13 text-destaque"
          >
            Estacionei agora
          </UButton>
        </EstadoVazio>
      </template>

      <div class="flex flex-col gap-6 lg:min-h-0 lg:gap-4">
        <UCard
          :ui="{
            root: 'max-lg:contents lg:shrink-0',
            body: 'flex flex-col gap-3 max-lg:contents lg:p-5',
          }"
        >
          <EtiquetaDeSecao
            texto="Sua rotina na região"
            nota="média das últimas 4 semanas"
          />
          <RotinaNaRegiao
            :rotina="rotina"
            :caixas="!telaGrande"
          />
          <UAlert
            v-if="picoDaPesquisa && rotina.chegada"
            icon="i-lucide-info"
            color="neutral"
            variant="soft"
            class="hidden lg:flex"
            :description="`A pesquisa mostra que ${picoDaPesquisa.valor} dos respondentes ${picoDaPesquisa.rotulo}, quando as vagas ficam mais disputadas.`"
            :ui="{
              root: 'rounded-alerta bg-accented',
              description: 'text-legenda text-highlighted',
              icon: 'text-primary',
            }"
          />
        </UCard>

        <UCard
          :ui="{
            root: 'max-lg:contents lg:flex lg:min-h-0 lg:flex-1 lg:flex-col',
            body: 'flex flex-col gap-3 max-lg:contents lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:p-5',
          }"
        >
          <EtiquetaDeSecao
            texto="Histórico"
            class="lg:hidden"
          />
          <h2 class="hidden text-card font-bold text-highlighted lg:block">
            Histórico
          </h2>
          <UCard
            v-if="historico.length"
            :ui="{
              root: 'lg:ring-0 lg:bg-transparent',
              body: 'flex flex-col gap-2 p-4 sm:p-4 lg:p-0',
            }"
          >
            <p class="text-nota text-muted">
              Chegada e saída das últimas vagas
            </p>
            <LinhaDoTempoDeVagas
              :vagas="historico.slice(0, 7)"
              :rotina="rotina"
            />
          </UCard>
          <UCard
            :ui="{
              root: 'lg:ring-0 lg:bg-transparent',
              body: 'px-4 py-1 sm:px-4 sm:py-1 lg:p-0',
            }"
          >
            <ul
              v-if="historico.length"
              class="divide-y divide-default"
            >
              <li
                v-for="vaga in historico.slice(0, 5)"
                :key="vaga.id"
              >
                <ItemHistorico
                  :vaga="vaga"
                  :compacto="telaGrande"
                />
              </li>
            </ul>
            <p
              v-else
              class="py-4 text-legenda text-muted"
            >
              Suas vagas encerradas aparecem aqui por 90 dias.
            </p>
          </UCard>
          <template v-if="telaGrande">
            <p class="text-nota text-muted">
              Seu histórico serve para lembrar onde você parou e ajustar a
              previsão. Você pode apagá-lo quando quiser.
            </p>
            <UButton
              to="/ajustes#privacidade"
              block
              color="neutral"
              variant="outline"
              icon="i-lucide-trash-2"
              class="h-11"
            >
              Apagar meu histórico
            </UButton>
          </template>
        </UCard>
      </div>
    </div>

    <DrawerSaidaPrevista
      v-if="vagaAtual"
      v-model:aberto="drawerAberto"
      :chegada="vagaAtual.chegada"
      :saida-prevista="vagaAtual.saidaPrevista"
      :salvando="salvandoSaida"
      @salvar="salvarSaida"
    />

    <UModal
      v-model:open="confirmarSaida"
      title="Registrar saída agora?"
      description="Vamos encerrar esta vaga e guardar só o horário de saída."
      :ui="{ footer: 'justify-end gap-3' }"
    >
      <template #footer>
        <UButton
          color="neutral"
          variant="outline"
          @click="confirmarSaida = false"
        >
          Ainda não
        </UButton>
        <UButton
          icon="i-lucide-log-out"
          :loading="saindo"
          :disabled="!vagaAtual"
          @click="registrarSaida"
        >
          Estou saindo
        </UButton>
      </template>
    </UModal>
  </div>
</template>
