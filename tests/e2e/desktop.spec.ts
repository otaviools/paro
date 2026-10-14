import { expect, test } from '@playwright/test'
import { abrir, ehCelular, pularBoasVindas } from './apoio'

test.beforeEach(async ({ page }) => {
  test.skip(ehCelular(page), 'Telas de painel só a partir de 1024 px')
  await pularBoasVindas(page)
})

test('painel mostra melhor chance, ruas por perto e resumo da pesquisa', async ({ page }) => {
  await abrir(page, '/')
  await expect(page.getByRole('heading', { name: 'Painel' })).toBeVisible()
  await expect(page.getByText('Melhor chance agora')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Ruas por perto' })).toBeVisible()
  await expect(page.getByText('Da pesquisa · n=99')).toBeVisible()
})

test('ruas em tabela com detalhe ao lado', async ({ page }) => {
  await abrir(page, '/ruas')
  await expect(page.getByRole('table')).toBeVisible()
  await page.getByRole('button', { name: 'Av. Belo Horizonte' }).click()
  await expect(page).toHaveURL(/\/ruas\//)
  await expect(page.getByText('Chance ao longo da noite').last()).toBeVisible()
})

test('trocar o horário atualiza a lista', async ({ page }) => {
  await abrir(page, '/ruas')
  await page.getByRole('tab', { name: '22h00' }).first().click()
  await expect(page.getByRole('table')).toContainText('75–85%')
})

test('pesquisa mostra só percentuais com a base', async ({ page }) => {
  await abrir(page, '/pesquisa')
  await expect(page.getByText('respostas válidas').first()).toBeVisible()
  await expect(page.getByText('n=81')).toBeVisible()
})
