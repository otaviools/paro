<script setup lang="ts">
import { rotuloDoEstado } from '#shared/utils/ocupacao'
import { estadosRelatados, rotuloDoTempo, temposParaAchar, type EstadoRelatado, type RespostaDoRelato, type TempoParaAchar } from '#shared/utils/relato'

withDefaults(defineProps<{ opcional?: boolean }>(), { opcional: false })
const resposta = defineModel<RespostaDoRelato>({ required: true })

function escolherEstado(estado: EstadoRelatado) {
  resposta.value = { ...resposta.value, estado: resposta.value.estado === estado ? null : estado }
}

function escolherTempo(tempo: TempoParaAchar) {
  resposta.value = { ...resposta.value, tempo: resposta.value.tempo === tempo ? null : tempo }
}

const classeDoChip = (escolhido: boolean) => escolhido
  ? 'bg-inverted text-inverted ring-inverted'
  : 'bg-default text-highlighted ring-default hover:bg-muted'
</script>

<template>
  <div class="@container flex flex-col gap-4">
    <fieldset class="flex flex-col gap-2">
      <legend class="mb-2 text-interface font-bold text-highlighted">
        Como estava a rua?<span
          v-if="opcional"
          class="font-normal text-muted"
        > (opcional)</span>
      </legend>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="estado in estadosRelatados"
          :key="estado"
          type="button"
          class="flex min-h-12 items-center justify-center gap-2 rounded-botao px-2 py-2 text-interface leading-tight font-bold ring-1 outline-primary transition focus-visible:outline-2"
          :class="classeDoChip(resposta.estado === estado)"
          :aria-pressed="resposta.estado === estado"
          @click="escolherEstado(estado)"
        >
          <PadraoOcupacao
            :estado="estado"
            decorativo
            class="size-4"
          />
          {{ rotuloDoEstado[estado] }}
        </button>
      </div>
    </fieldset>
    <fieldset class="flex flex-col gap-2">
      <legend class="mb-2 text-interface font-bold text-highlighted">
        Quanto tempo levou para achar vaga?<span
          v-if="opcional"
          class="font-normal text-muted"
        > (opcional)</span>
      </legend>
      <!-- 4 colunas só quando o card comporta "Menos de 2 min" numa linha; senão 2×2. -->
      <div class="grid grid-cols-2 gap-2 @xl:grid-cols-4">
        <button
          v-for="tempo in temposParaAchar"
          :key="tempo"
          type="button"
          class="min-h-12 rounded-botao px-2 py-2 text-interface leading-tight font-bold ring-1 outline-primary transition focus-visible:outline-2"
          :class="classeDoChip(resposta.tempo === tempo)"
          :aria-pressed="resposta.tempo === tempo"
          @click="escolherTempo(tempo)"
        >
          {{ rotuloDoTempo[tempo] }}
        </button>
      </div>
    </fieldset>
  </div>
</template>
