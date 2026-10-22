import type { NavigationMenuItem } from '@nuxt/ui'

export function useItensDeNavegacao() {
  const rota = useRoute()

  const ativo = (prefixo: string) => (prefixo === '/' ? rota.path === '/' : rota.path.startsWith(prefixo))

  const abasDoCelular = computed<NavigationMenuItem[]>(() => [
    { label: 'Início', icon: 'i-lucide-house', to: '/', active: ativo('/') || ativo('/busca') || ativo('/local') || ativo('/sugerir') },
    { label: 'Mapa', icon: 'i-lucide-map', to: '/mapa', active: ativo('/mapa') || ativo('/ruas') },
    { label: 'Minha vaga', icon: 'i-lucide-car', to: '/vaga', active: ativo('/vaga') || ativo('/ajustes') },
  ])

  const itensDoPainel = computed<NavigationMenuItem[]>(() => [
    { label: 'Painel', icon: 'i-lucide-layout-grid', to: '/', active: ativo('/') || ativo('/mapa') || ativo('/busca') },
    { label: 'Ruas', icon: 'i-lucide-list', to: '/ruas', active: ativo('/ruas') },
    { label: 'Minha vaga', icon: 'i-lucide-car', to: '/vaga', active: ativo('/vaga') },
    { label: 'Pesquisa', icon: 'i-lucide-chart-column', to: '/pesquisa', active: ativo('/pesquisa') },
  ])

  const itemDeAjustes = computed<NavigationMenuItem[]>(() => [
    { label: 'Admin', icon: 'i-lucide-shield-user', to: '/admin', active: ativo('/admin') },
    { label: 'Ajustes', icon: 'i-lucide-settings', to: '/ajustes', active: ativo('/ajustes') },
  ])

  return { abasDoCelular, itensDoPainel, itemDeAjustes }
}
