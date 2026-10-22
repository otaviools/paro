self.addEventListener('notificationclick', (evento) => {
  evento.notification.close()
  const url = evento.notification.data?.url ?? '/'
  evento.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((janelas) => {
    const aberta = janelas.find(janela => 'focus' in janela)
    return aberta ? aberta.focus() : self.clients.openWindow(url)
  }))
})
