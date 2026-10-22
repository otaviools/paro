<script setup lang="ts">
// E-mail do código de verificação. Cores, raios e tipografia seguem os tokens da marca
// (marca/tokens/paro.css), escritos como valores fixos porque clientes de e-mail não leem
// variáveis CSS. As logos vão anexadas ao e-mail (cid, ver server/utils/email.ts).
//
// Tema escuro:
// - Apple Mail, Outlook (app e outlook.com) e outros que respeitam o tema: as regras de
//   `estiloEscuro` trocam as cores pelas do app no escuro e a logo pela versão de fundo escuro.
// - Gmail ignora essas regras e inverte as cores sozinho, mas não inverte imagens. Por isso a
//   logo padrão vem num selo creme desenhado na própria imagem: no claro ele some no card e,
//   no Gmail escuro, mantém as letras asfalto legíveis.
defineProps<{ codigo: string, minutos: number }>()

// pagina: fundo da página do app (Figma, Visão Geral light) · card: --paro-creme
// borda: --paro-linha (asfalto a 15%) já misturado ao creme · destaque: --paro-ceu-claro
// texto: --paro-asfalto · textoFraco: --app-texto-fraco (contraste AA sobre o creme)
const cor = {
  pagina: '#FFF6D4',
  card: '#FFF9E3',
  borda: '#E0DBC8',
  destaque: '#D2DEDA',
  texto: '#32312C',
  textoFraco: '#615F59',
}
// Escuro, como no app: pagina e card do Figma (Visão Geral dark), borda creme a 15% sobre o
// card, destaque --paro-ceu-noite, texto --paro-creme e texto fraco --app-texto-fraco (escuro).
const corEscura = {
  pagina: '#2A2925',
  card: '#32312C',
  borda: '#504F47',
  destaque: '#4A5558',
  texto: '#FFF9E3',
  textoFraco: '#C4C2B8',
}
const fonte = 'Manrope, \'Segoe UI\', Arial, sans-serif'
const ano = new Date().getFullYear()

const regrasEscuras = `
  .e-pagina { background-color: ${corEscura.pagina} !important; }
  .e-card { background-color: ${corEscura.card} !important; border-color: ${corEscura.borda} !important; }
  .e-linha { border-color: ${corEscura.borda} !important; }
  .e-destaque { background-color: ${corEscura.destaque} !important; }
  .e-texto { color: ${corEscura.texto} !important; }
  .e-fraco { color: ${corEscura.textoFraco} !important; }
  .logo-claro { display: none !important; }
  .logo-escuro { display: block !important; max-height: none !important; overflow: visible !important; }
`
const prefixar = (prefixo: string) => regrasEscuras.replace(/^\s*\./gm, match => `${match.replace('.', '')}${prefixo} .`)
const estiloEscuro = `
  :root { color-scheme: light dark; supported-color-schemes: light dark; }
  @media (prefers-color-scheme: dark) { ${regrasEscuras} }
  ${prefixar('[data-ogsc]')}
  ${prefixar('[data-ogsb]')}
`
</script>

<template>
  <EHtml lang="pt-BR">
    <EHead>
      <meta
        name="color-scheme"
        content="light dark"
      >
      <meta
        name="supported-color-schemes"
        content="light dark"
      >
      <EStyle>{{ estiloEscuro }}</EStyle>
    </EHead>
    <EPreview>Seu código do Parô é {{ codigo }}</EPreview>
    <EBody :style="{ fontFamily: fonte, color: cor.texto, margin: '0', padding: '0' }">
      <!-- O fundo fica numa camada própria: o EBody repete o estilo numa célula sem a classe, e o Gmail web ignora o <body>. -->
      <ESection
        class="e-pagina"
        :style="{ backgroundColor: cor.pagina, padding: '32px 16px' }"
      >
        <EContainer
          class="e-card"
          :style="{
            maxWidth: '480px',
            backgroundColor: cor.card,
            border: `1px solid ${cor.borda}`,
            borderRadius: '16px',
            padding: '32px',
          }"
        >
          <!-- Logo num selo creme com 8 px de respiro (sem margem negativa, que Gmail e Outlook ignoram). -->
          <EImg
            class="logo-claro"
            src="cid:logo-paro"
            alt="Parô"
            width="136"
            height="80"
            :style="{ display: 'block', width: '136px', height: 'auto' }"
          />
          <div
            class="logo-escuro"
            :style="{ display: 'none', maxHeight: '0', overflow: 'hidden', msoHide: 'all', padding: '8px' }"
          >
            <EImg
              src="cid:logo-paro-escuro"
              alt="Parô"
              width="120"
              height="64"
              :style="{ display: 'block', width: '120px', height: 'auto' }"
            />
          </div>
          <EHr
            class="e-linha"
            :style="{ borderColor: cor.borda, margin: '24px 0' }"
          />

          <EText
            class="e-texto"
            :style="{ fontSize: '16px', lineHeight: '24px', margin: '0 0 16px', color: cor.texto }"
          >
            Olá,
          </EText>
          <EText
            class="e-texto"
            :style="{ fontSize: '16px', lineHeight: '24px', margin: '0 0 16px', color: cor.texto }"
          >
            Seu código de verificação é:
          </EText>

          <ESection
            class="e-destaque"
            :style="{
              backgroundColor: cor.destaque,
              borderRadius: '16px',
              padding: '20px 16px',
              textAlign: 'center',
            }"
          >
            <EText
              class="e-texto"
              :style="{
                fontSize: '40px',
                lineHeight: '48px',
                fontWeight: '800',
                letterSpacing: '8px',
                margin: '0',
                color: cor.texto,
              }"
            >
              {{ codigo }}
            </EText>
          </ESection>

          <EText
            class="e-texto"
            :style="{ fontSize: '16px', lineHeight: '24px', margin: '24px 0 8px', color: cor.texto }"
          >
            Digite este código no app para verificar o seu e-mail. Ele vale por {{ minutos }} minutos.
          </EText>
          <EText
            class="e-texto"
            :style="{ fontSize: '16px', lineHeight: '24px', margin: '0', color: cor.texto }"
          >
            Se você não pediu este código, pode ignorar este e-mail.
          </EText>

          <EHr
            class="e-linha"
            :style="{ borderColor: cor.borda, margin: '24px 0' }"
          />

          <EText
            class="e-fraco"
            :style="{ fontSize: '12px', lineHeight: '18px', color: cor.textoFraco, textAlign: 'center', margin: '0' }"
          >
            O Parô guarda só uma versão embaralhada do seu e-mail, nunca o endereço.
          </EText>
          <EText
            class="e-fraco"
            :style="{ fontSize: '12px', lineHeight: '18px', color: cor.textoFraco, textAlign: 'center', margin: '4px 0 0' }"
          >
            © {{ ano }} Parô · Chance de vaga por rua e horário. Previsão, não garantia.
          </EText>
        </EContainer>
      </ESection>
    </EBody>
  </EHtml>
</template>
