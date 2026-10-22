<script setup lang="ts">
useSeoMeta({ title: 'Termos e privacidade · Parô' })

const secoes = [
  {
    titulo: 'Para que o Parô usa seus dados',
    texto: 'Para estimar a chance de vaga por rua e horário, para lembrar onde você parou, para liberar a entrada no app depois de confirmar o e-mail e para dar mais peso aos seus relatos. Nenhum outro uso, sem propaganda.',
  },
  {
    titulo: 'O que fica guardado',
    texto: 'Um identificador aleatório deste aparelho, suas preferências, as vagas que você registra (rua, chegada, saída prevista e saída) e os seus relatos (rua, horário, como estava a rua e quanto tempo levou). O ponto exato da vaga fica só neste aparelho. Com a localização anônima e contínua ligada e o app aberto, o Parô acompanha a sua posição só neste aparelho para perceber quando você estaciona e perguntar se quer registrar a vaga; essas posições nunca saem do aparelho, e só a rua e o horário vão para o servidor se você tocar em Sim. Quando você relata com a localização ligada, guardamos só se você estava perto da rua (sim ou não), nunca as coordenadas. Para mostrar o seu bairro, o servidor consulta o OpenStreetMap com a posição arredondada (cerca de 100 m) e não guarda nada.',
  },
  {
    titulo: 'E-mail',
    texto: 'Para entrar no app, você verifica o e-mail uma vez em cada aparelho. Guardamos só uma versão embaralhada dele (hash com chave secreta), nunca o endereço. Ela serve para liberar a entrada, limitar um relato por pessoa, calcular a sua reputação, que sobe quando seus relatos batem com as contagens de campo, e mostrar a sua vaga e o seu histórico em qualquer aparelho onde você verificar o mesmo e-mail. O código de verificação vale 10 minutos.',
  },
  {
    titulo: 'Rotas no mapa',
    texto: 'Para desenhar o caminho em Como chegar e em Voltar até o carro, o servidor do Parô consulta um serviço de rotas do OpenStreetMap (OSRM). Ele envia só o ponto de partida arredondado a cerca de 100 m e o destino na rua, sem nenhum identificador seu. A rota calculada fica em cache por até 10 minutos, sem ligação com você ou com o aparelho. O ponto exato da vaga nunca é enviado: o último trecho até o carro é desenhado só neste aparelho.',
  },
  {
    titulo: 'Base legal',
    texto: 'Consentimento, pedido na primeira visita e ao verificar o e-mail. Você pode mudar as opções de localização a qualquer momento em Ajustes. A localização só é lida quando a opção está ligada.',
  },
  {
    titulo: 'Por quanto tempo',
    texto: 'Entre 24 e 48 horas depois de enviado, cada relato perde o vínculo com você e com o aparelho e fica só como contagem anônima. O histórico de vagas é apagado sozinho depois de 90 dias. As medições de campo e os relatos anônimos usados na previsão não têm dono e continuam guardados.',
  },
  {
    titulo: 'Seu controle',
    texto: 'Em Ajustes, Apagar meu histórico exclui do banco as suas vagas de todos os aparelhos com o mesmo e-mail, e Apagar meus dados exclui também o e-mail embaralhado, a reputação e as preferências. Apagar os dados do navegador encerra o vínculo com este aparelho.',
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
    <div class="flex flex-col gap-6 lg:grid lg:min-h-0 lg:flex-1 lg:auto-rows-fr lg:grid-cols-4 lg:gap-4 lg:p-6">
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
