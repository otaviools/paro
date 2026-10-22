<script setup lang="ts">
withDefaults(defineProps<{ abas?: boolean }>(), { abas: true })
const { abasDoCelular, itensDoPainel, itemDeAjustes } = useItensDeNavegacao()
const { menuAberto } = useMenuLateral()

// Todos os ícones da barra ficam no mesmo eixo, a 36 px da borda (o centro da barra recolhida,
// de 72 px), expandida ou recolhida: corpo com 12 px + link com 14 px + metade do ícone de 20 px.
// Assim os ícones não se mexem ao recolher ou expandir; só os textos somem.
const uiDoMenuLateral = {
  link: 'h-11 px-3.5 rounded-botao text-corpo font-medium text-muted data-active:text-(--app-menu-ativo-texto) data-active:font-bold before:rounded-botao data-active:before:bg-(image:--app-menu-ativo-fundo) data-active:before:bg-(--app-menu-ativo)',
  linkLeadingIcon: 'size-5 text-muted group-data-active:text-(--app-menu-ativo-texto)',
}
</script>

<template>
  <div class="flex min-h-dvh bg-(--app-fundo-pagina)">
    <USidebar
      v-model:open="menuAberto"
      collapsible="icon"
      rail
      :ui="{
        root: '[--sidebar-width:248px] [--sidebar-width-icon:4.5rem]',
        container: 'bg-(--app-fundo-menu)',
        inner: 'divide-y-0',
        header: 'min-h-0 px-3 pt-6 pb-0',
        body: 'gap-8 overflow-x-hidden px-3 py-8',
        footer: 'flex-col items-stretch gap-6 px-3 pt-0 pb-6',
      }"
    >
      <template #header="{ state }">
        <NuxtLink
          to="/"
          class="relative block h-17 w-full shrink-0 overflow-hidden rounded-botao outline-primary focus-visible:outline-2"
          aria-label="Parô, ir para o painel"
        >
          <LogoAnimada :recolhido="state === 'collapsed'" />
        </NuxtLink>
      </template>

      <template #default="{ state }">
        <!-- Altura fixa (44 px) nos dois estados para o menu abaixo não mudar de lugar. -->
        <div
          class="flex h-11 min-w-0 shrink-0 items-center"
          :class="state === 'collapsed' ? 'pl-0.5' : 'px-3.5'"
        >
          <SeletorDeLocal :compacto="state === 'collapsed'" />
        </div>
        <UNavigationMenu
          :items="itensDoPainel"
          orientation="vertical"
          :collapsed="state === 'collapsed'"
          :tooltip="{ arrow: true }"
          :ui="uiDoMenuLateral"
          aria-label="Seções"
        />
      </template>

      <template #footer="{ state }">
        <UNavigationMenu
          :items="itemDeAjustes"
          orientation="vertical"
          :collapsed="state === 'collapsed'"
          :tooltip="{ arrow: true }"
          :ui="uiDoMenuLateral"
          aria-label="Admin e ajustes"
        />
        <!--
          Altura fixa (duas linhas do aviso) nos dois estados, para "Ajustes" não mudar de lugar.
          O texto tem largura fixa (a da barra expandida) e é cortado enquanto a barra anima,
          em vez de quebrar em várias linhas no meio da transição.
        -->
        <div class="h-9 shrink-0 overflow-hidden">
          <UTooltip
            v-if="state === 'collapsed'"
            text="A localização da vaga não é compartilhada."
            arrow
            :content="{ side: 'right' }"
            :delay-duration="0"
          >
            <span
              class="flex pt-0.5 pl-4 text-primary"
              tabindex="0"
              aria-label="A localização da vaga não é compartilhada."
            >
              <UIcon
                name="i-lucide-shield-check"
                class="size-4"
              />
            </span>
          </UTooltip>
          <AvisoPrivacidade
            v-else
            texto="Localização segura"
            class="w-56 px-4 text-nota! font-normal! text-muted!"
          />
        </div>
      </template>
    </USidebar>
    <!--
      No desktop o conteúdo ocupa exatamente a altura da tela e a página não rola:
      a raiz de cada página vira uma coluna flexível, o cabeçalho fica no topo e
      cada página distribui seus cards no espaço que sobra. Se algo não couber,
      rola só dentro da página (ou do card), nunca a janela.
    -->
    <main
      class="min-w-0 flex-1 px-6 pt-12 lg:flex lg:h-dvh lg:flex-col lg:overflow-hidden lg:px-0 lg:pt-0 lg:pb-0 lg:*:flex lg:*:min-h-0 lg:*:w-full lg:*:flex-1 lg:*:flex-col lg:*:overflow-y-auto"
      :class="abas ? 'pb-32' : 'pb-10'"
    >
      <slot />
    </main>
    <nav
      v-if="abas"
      class="fixed inset-x-0 bottom-0 z-20 border-t border-default bg-default pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label="Navegação principal"
    >
      <ul class="flex justify-around px-2 pt-3 pb-4">
        <li
          v-for="item in abasDoCelular"
          :key="item.label"
        >
          <NuxtLink
            :to="item.to"
            class="group flex w-24 flex-col items-center gap-1 outline-primary focus-visible:outline-2"
            :aria-current="item.active ? 'page' : undefined"
          >
            <span
              class="grid h-8 w-16 place-items-center rounded-full transition"
              :class="item.active ? 'bg-accented' : ''"
            >
              <UIcon
                :name="item.icon ?? ''"
                class="size-5"
                :class="item.active ? 'text-highlighted' : 'text-muted'"
              />
            </span>
            <span
              class="text-legenda"
              :class="item.active ? 'font-bold text-highlighted' : 'font-medium text-muted'"
            >{{ item.label }}</span>
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </div>
</template>
