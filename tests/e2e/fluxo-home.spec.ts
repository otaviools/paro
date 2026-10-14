import { expect, test } from '@playwright/test'
import { abrir, ehCelular } from './apoio'

test('primeira visita, início, busca, sem dado e sugerir rua', async ({ page }) => {
  test.skip(!ehCelular(page), 'Fluxo Home é do celular')

  await abrir(page, '/')
  await expect(page).toHaveURL(/boas-vindas/)
  await expect(page.getByRole('heading', { name: 'Chegue sabendo.' })).toBeVisible()
  await page.getByRole('button', { name: 'Começar' }).click()

  await expect(page).toHaveURL('/')
  await expect(page.getByText('Previsão, não garantia.').first()).toBeVisible()
  await page.getByRole('link', { name: 'Procurar vaga' }).click()

  await expect(page.getByRole('heading', { name: 'Para onde você vai?' })).toBeVisible()
  await page.getByLabel('Rua, prédio ou referência').fill('Duque')
  await expect(page.getByText('Sem previsão ainda', { exact: false })).toBeVisible()
  await page.getByRole('link', { name: /Duque de Caxias/ }).click()

  await expect(page.getByText('Ainda não medimos esta rua').filter({ visible: true })).toBeVisible()
  await page.getByRole('link', { name: 'Sugerir esta rua para medição' }).click()

  await expect(page.getByRole('heading', { name: 'Sugerir rua' })).toBeVisible()
  await expect(page.getByLabel('Rua')).toHaveValue('R. Duque de Caxias')
  await page.getByRole('button', { name: 'Enviar sugestão' }).click()
  await expect(page).toHaveURL('/')
})
