// Estado do menu lateral do desktop, compartilhado entre o USidebar e o botão do cabeçalho.
// No celular o USidebar força `false` ao trocar de tela; esse valor não pode
// sobrescrever a escolha feita no desktop.
export function useMenuLateral() {
  const salvo = useCookie<boolean>('menu-lateral-aberto', { default: () => true, maxAge: 60 * 60 * 24 * 365 })
  const estado = useState('menu-lateral-aberto', () => salvo.value)

  const menuAberto = computed({
    get: () => estado.value,
    set: (valor: boolean) => {
      if (!import.meta.client || !window.matchMedia('(min-width: 1024px)').matches) return
      estado.value = valor
      salvo.value = valor
    },
  })

  function alternarMenu() {
    menuAberto.value = !menuAberto.value
  }

  return { menuAberto, alternarMenu }
}
