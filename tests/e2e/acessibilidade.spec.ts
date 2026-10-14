import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { pularBoasVindas } from './apoio'

const rotas = ['/boas-vindas', '/', '/local', '/busca', '/sugerir', '/mapa', '/ruas', '/vaga', '/vaga/registrar', '/ajustes', '/pesquisa', '/termos']

for (const tema of ['light', 'dark'] as const) {
  for (const rota of rotas) {
    test(`${rota} sem violações de acessibilidade no tema ${tema === 'light' ? 'claro' : 'escuro'}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: tema })
      await pularBoasVindas(page)
      await page.goto(rota)
      await page.waitForLoadState('networkidle')
      const resultado = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .exclude('.maplibregl-canvas')
        .exclude('.maplibregl-ctrl-attrib')
        .exclude('[aria-label^="Notifications"] > span[aria-hidden]')
        .analyze()
      expect(resultado.violations.map(violacao => `${violacao.id}: ${violacao.nodes.map(no => no.target.join(' ')).join(', ')}`)).toEqual([])
    })
  }
}
