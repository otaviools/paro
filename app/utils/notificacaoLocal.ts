export type EstadoDaNotificacao = NotificationPermission | 'sem_suporte'

export function estadoDaNotificacao(): EstadoDaNotificacao {
  if (import.meta.server || !('Notification' in window)) return 'sem_suporte'
  return Notification.permission
}

export async function pedirPermissaoDeNotificacao(): Promise<EstadoDaNotificacao> {
  if (estadoDaNotificacao() === 'sem_suporte') return 'sem_suporte'
  return Notification.requestPermission()
}

export async function mostrarNotificacao(titulo: string, opcoes: NotificationOptions & { url: string }): Promise<void> {
  if (estadoDaNotificacao() !== 'granted') return
  const { url, ...resto } = opcoes
  const registro = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : undefined
  if (registro) return registro.showNotification(titulo, { ...resto, data: { url } })
  const notificacao = new Notification(titulo, resto)
  notificacao.onclick = () => {
    window.focus()
    notificacao.close()
  }
}

export function ehIphoneSemInstalar(): boolean {
  if (import.meta.server) return false
  const iphone = /iPhone|iPad|iPod/.test(navigator.userAgent)
  const instalado = window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true
  return iphone && !instalado
}
