<script setup lang="ts">
useSeoMeta({ title: 'Termos e privacidade · Parô' })

const secoes = [
  {
    titulo: 'Para que o Parô usa seus dados',
    texto: 'Para estimar a chance de vaga por rua e horário e para lembrar onde você parou. Nenhum outro uso.',
  },
  {
    titulo: 'O que fica guardado',
    texto: 'Um identificador aleatório deste aparelho, suas preferências e, quando você registra uma vaga, a rua, a chegada, a saída prevista e a saída. O ponto exato da vaga fica só neste aparelho. Não pedimos cadastro, nome, e-mail, telefone, CPF ou placa.',
  },
  {
    titulo: 'Base legal',
    texto: 'Consentimento, pedido na primeira visita. Você pode mudar as opções de localização a qualquer momento em Ajustes. A localização só é lida quando a opção está ligada.',
  },
  {
    titulo: 'Por quanto tempo',
    texto: 'O histórico de vagas é apagado sozinho depois de 90 dias. As medições de campo usadas na previsão não têm dono e continuam guardadas.',
  },
  {
    titulo: 'Seu controle',
    texto: 'Em Ajustes, Apagar meu histórico exclui de verdade as suas vagas do banco de dados. Apagar os dados do navegador encerra o vínculo com este aparelho.',
  },
  {
    titulo: 'Pesquisa',
    texto: 'Os resultados da pesquisa aparecem só em percentuais agregados. Nenhuma resposta individual é guardada no app.',
  },
]
</script>

<template>
  <div>
    <CabecalhoPainel
      titulo="Termos e privacidade"
      subtitulo="Como o Parô trata os seus dados"
    />
    <div class="flex flex-col gap-6 lg:grid lg:min-h-0 lg:flex-1 lg:auto-rows-fr lg:grid-cols-3 lg:gap-4 lg:p-6">
      <CabecalhoDeTarefa
        titulo="Termos e privacidade"
        voltar-para="/ajustes"
        class="lg:hidden"
      />
      <UCard
        v-for="secao in secoes"
        :key="secao.titulo"
        :ui="{ root: 'lg:flex lg:min-h-0 lg:flex-col', body: 'flex flex-col gap-2 p-5 sm:p-6 lg:min-h-0 lg:flex-1 lg:overflow-y-auto' }"
      >
        <h2 class="text-card font-bold text-highlighted">
          {{ secao.titulo }}
        </h2>
        <p class="max-w-[70ch] text-corpo text-muted">
          {{ secao.texto }}
        </p>
      </UCard>
    </div>
  </div>
</template>
