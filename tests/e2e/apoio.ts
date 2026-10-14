import type { Page } from '@playwright/test'

export async function pularBoasVindas(pagina: Page): Promise<void> {
  await pagina.context().addCookies([{ name: 'paro-boas-vindas', value: 'sim', url: 'http://localhost:3100' }])
}

export function ehCelular(pagina: Page): boolean {
  return (pagina.viewportSize()?.width ?? 0) < 1024
}

export async function abrir(pagina: Page, rota: string): Promise<void> {
  await pagina.goto(rota)
  await pagina.waitForFunction(() => {
    const raiz = document.querySelector('#__nuxt') as (Element & { __vue_app__?: { $nuxt?: { isHydrating?: boolean } } }) | null
    return raiz?.__vue_app__?.$nuxt?.isHydrating === false
  })
}
