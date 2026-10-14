<script setup lang="ts">
import { minutosLocais } from '#shared/utils/horario'
import type { RotinaNaRegiao, Vaga } from '#shared/types/vaga'
import type { ItemDaLinhaDoTempo, MarcoDaLinhaDoTempo } from '~/utils/graficos'

const props = defineProps<{ vagas: Vaga[], rotina?: RotinaNaRegiao, agoraMarcado?: boolean }>()
const { cores, animar } = useTemaDoGrafico()
const agora = useAgora()

function minutosDepoisDe(inicio: number, data: Date): number {
  const minutos = minutosLocais(data)
  return minutos < inicio ? minutos + 24 * 60 : minutos
}

function minutosDoTexto(horario: string): number {
  const [hora = 0, minuto = 0] = horario.split(':').map(Number)
  return hora * 60 + minuto
}

const itens = computed<ItemDaLinhaDoTempo[]>(() => props.vagas.map((vaga) => {
  const inicio = minutosLocais(new Date(vaga.chegada))
  const fim = minutosDepoisDe(inicio, vaga.saida ? new Date(vaga.saida) : agora.value)
  const previsto = !vaga.saida && vaga.saidaPrevista ? minutosDepoisDe(inicio, new Date(vaga.saidaPrevista)) : null
  return { rotulo: formatarDataCurta(vaga.chegada), inicio, fim, previsto, ativa: !vaga.saida }
}))

const marcos = computed(() => {
  const lista: MarcoDaLinhaDoTempo[] = []
  if (props.rotina?.chegada) lista.push({ minutos: minutosDoTexto(props.rotina.chegada), rotulo: 'chegada média', alinhamento: 'right' })
  if (props.rotina?.saida) lista.push({ minutos: minutosDoTexto(props.rotina.saida), rotulo: 'saída média', alinhamento: 'left' })
  const ativo = itens.value.find(item => item.ativa)
  if (props.agoraMarcado && ativo) lista.push({ minutos: ativo.fim, rotulo: 'agora', destaque: true })
  return lista
})

const opcao = computed(() => opcaoDeLinhaDoTempo(cores.value, animar.value, { itens: itens.value, marcos: marcos.value }))

const descricao = computed(() => itens.value
  .map(item => `${item.rotulo}: ${rotuloDeMinutos(item.inicio)} até ${item.ativa ? 'agora' : rotuloDeMinutos(item.fim)}`)
  .join('. '))
</script>

<template>
  <GraficoBase
    v-if="itens.length"
    :opcao="opcao"
    :altura="itens.length * 36 + (marcos.length ? 52 : 32)"
    :rotulo="`Linha do tempo das vagas. ${descricao}`"
  />
</template>
