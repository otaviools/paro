import { expect, test } from '@playwright/test'
import { abrir, pularBoasVindas } from './apoio'

test('registrar vaga, editar a saída, sair e apagar o histórico', async ({ page }) => {
  await pularBoasVindas(page)
  await abrir(page, '/vaga/registrar')
  await expect(page.getByRole('heading', { name: 'Registrar vaga' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Confirmar vaga' })).toBeEnabled({ timeout: 20_000 })
  await page.getByRole('button', { name: 'Confirmar vaga' }).click()

  await expect(page).toHaveURL('/vaga')
  await expect(page.getByText('Ativa').filter({ visible: true }).first()).toBeVisible()
  await page.getByRole('button', { name: 'Editar saída prevista' }).click()
  await page.getByRole('radio', { name: '22h00' }).click()
  await page.getByRole('button', { name: 'Salvar' }).click()
  await expect(page.getByText('22h00').filter({ visible: true }).first()).toBeVisible()

  await page.getByRole('button', { name: 'Estou saindo' }).filter({ visible: true }).first().click()
  await page.getByRole('dialog').getByRole('button', { name: 'Estou saindo' }).click()
  await expect(page.getByRole('heading', { name: /Saída registrada às/ })).toBeVisible()

  await abrir(page, '/ajustes')
  await page.getByRole('button', { name: 'Apagar meu histórico' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Apagar histórico' }).click()
  await expect(page.getByText('Histórico apagado', { exact: true })).toBeVisible()
})
