import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { $fetch, fetch, setup } from '@nuxt/test-utils/e2e'
import type { Area } from '../../shared/types/area'
import type { DetalheRua, PrevisaoRua } from '../../shared/types/previsao'
import type { Vaga } from '../../shared/types/vaga'
import type { AcertoDaPrevisao, Contagem, LinhaDeCalibracao, ResumoDaRua } from '../../shared/types/admin'
import type { ContaDoAparelho } from '../../shared/types/conta'
import type { RelatoRegistrado } from '../../shared/types/relato'

await setup({
  rootDir: fileURLToPath(new URL('../..', import.meta.url)),
  server: true,
  browser: false,
  setupTimeout: 600_000,
  env: { NUXT_DATABASE_URL: 'pglite://memoria', NUXT_SESSION_PASSWORD: 'senha-de-teste-com-mais-de-32-caracteres', NUXT_ADMIN_PASSWORD: 'senha-de-admin-de-teste', NUXT_EMAIL_PEPPER: 'pepper-de-teste-com-mais-de-32-caracteres', NUXT_SMTP_HOST: '', NUXT_SMTP_USER: '', NUXT_SMTP_PASSWORD: '' },
})

async function areaMedida(): Promise<Area> {
  const areas = await $fetch<Area[]>('/api/areas')
  const area = areas.find(item => item.ruasMedidas > 0)
  if (!area) throw new Error('Seed sem área medida')
  return area
}

describe('previsões', () => {
  it('lista as cinco ruas ordenadas por chance, com estado, origem e confiança', async () => {
    const area = await areaMedida()
    const ruas = await $fetch<PrevisaoRua[]>('/api/ruas', { query: { area: area.id, horario: '19:00' } })
    expect(ruas.map(rua => rua.nome)).toEqual([
      'R. Arlindo Teixeira',
      'R. Rivalino Pereira',
      'Av. Belo Horizonte',
      'R. Alexandre Marquez',
      'Av. Vasconcelos Costa',
    ])
    expect(ruas[0]).toMatchObject({ estado: 'livre', chance: { min: 60, max: 70 }, confianca: { origem: 'campo', nivel: 'media', amostra: 4 } })
    expect(ruas.filter(rua => rua.confianca?.origem === 'campo').every(rua => rua.medidoEm)).toBe(true)
  })
})

describe('previsões: pesquisa', () => {
  it('usa a estimativa da pesquisa quando não há contagem de campo', async () => {
    const area = await areaMedida()
    const ruas = await $fetch<PrevisaoRua[]>('/api/ruas', { query: { area: area.id, horario: '19:00' } })
    const alexandre = ruas.find(rua => rua.nome === 'R. Alexandre Marquez')
    expect(alexandre).toMatchObject({
      estado: 'apertado',
      chance: { min: 10, max: 25 },
      medidoEm: null,
      confianca: { origem: 'pesquisa', amostra: 81, margem: 8, nivel: 'media' },
    })
  })

  it('devolve o destino de navegação da rua', async () => {
    const area = await areaMedida()
    const ruas = await $fetch<PrevisaoRua[]>('/api/ruas', { query: { area: area.id } })
    const arlindo = ruas.find(rua => rua.nome === 'R. Arlindo Teixeira')
    const detalhe = await $fetch<DetalheRua>(`/api/ruas/${arlindo?.ruaId}`)
    expect(detalhe.destino).toEqual([-48.2803036, -18.9123663])
  })

  it('recusa área inválida com mensagem clara', async () => {
    const resposta = await fetch('/api/ruas?area=abc')
    expect(resposta.status).toBe(400)
    expect(await resposta.text()).toContain('area')
  })
})

describe('vaga anônima', () => {
  it('registra, edita, encerra e apaga sem dado pessoal', async () => {
    const area = await areaMedida()
    const [rua] = await $fetch<PrevisaoRua[]>('/api/ruas', { query: { area: area.id } })
    const criada = await fetch('/api/vagas', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ruaId: rua?.ruaId, avisarAoSair: true }),
    })
    expect(criada.status).toBe(201)
    const cookie = criada.headers.get('set-cookie')?.split(';')[0] ?? ''
    const vaga = await criada.json() as Vaga
    const comCookie = { headers: { cookie } }

    const editada = await $fetch<Vaga>(`/api/vagas/${vaga.id}`, { method: 'PATCH', body: { saidaPrevista: '2026-10-14T00:30:00.000Z' }, ...comCookie })
    expect(editada.saidaPrevista).toBe('2026-10-14T00:30:00.000Z')

    const encerrada = await $fetch<Vaga>(`/api/vagas/${vaga.id}/saida`, { method: 'POST', ...comCookie })
    expect(encerrada.saida).not.toBeNull()

    const historico = await $fetch<Vaga[]>('/api/vagas/historico', comCookie)
    expect(historico).toHaveLength(1)

    const apagado = await $fetch<{ apagadas: number }>('/api/vagas/historico', { method: 'DELETE', ...comCookie })
    expect(apagado.apagadas).toBe(1)
    expect(await $fetch<Vaga[]>('/api/vagas/historico', comCookie)).toHaveLength(0)
  })

  it('não mostra a vaga de outro aparelho', async () => {
    const resposta = await fetch('/api/vagas/00000000-0000-4000-8000-000000000000')
    expect(resposta.status).toBe(404)
  })
})

const DOMINGO_SEM_DEMONSTRACAO = '2026-01-04'

async function entrarComo(senha: string): Promise<{ status: number, cookie: string }> {
  const resposta = await fetch('/api/admin/entrar', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ senha }),
  })
  return { status: resposta.status, cookie: resposta.headers.get('set-cookie')?.split(';')[0] ?? '' }
}

describe('admin', () => {
  it('recusa quem não entrou e a senha errada', async () => {
    expect((await fetch('/api/admin/resumo')).status).toBe(401)
    expect((await entrarComo('senha-errada')).status).toBe(401)
  })

  it('grava, lê e apaga as contagens de um dia', async () => {
    const { status, cookie } = await entrarComo('senha-de-admin-de-teste')
    expect(status).toBe(200)
    const comCookie = { headers: { cookie } }
    const [rua] = await $fetch<ResumoDaRua[]>('/api/admin/resumo', comCookie)
    const contagens: Contagem[] = [
      { faixa: '19:00', vagasTotais: 30, vagasOcupadas: 27 },
      { faixa: '19:30', vagasTotais: 30, vagasOcupadas: 30 },
    ]
    const salvo = await $fetch<{ gravadas: number }>('/api/admin/contagens', { method: 'PUT', body: { ruaId: rua?.ruaId, data: DOMINGO_SEM_DEMONSTRACAO, contagens }, ...comCookie })
    expect(salvo.gravadas).toBe(2)
    const lidas = await $fetch<Contagem[]>('/api/admin/contagens', { query: { ruaId: rua?.ruaId, data: DOMINGO_SEM_DEMONSTRACAO }, ...comCookie })
    expect(lidas).toEqual(contagens)
    await $fetch('/api/admin/contagens', { method: 'PUT', body: { ruaId: rua?.ruaId, data: DOMINGO_SEM_DEMONSTRACAO, contagens: [] }, ...comCookie })
    expect(await $fetch<Contagem[]>('/api/admin/contagens', { query: { ruaId: rua?.ruaId, data: DOMINGO_SEM_DEMONSTRACAO }, ...comCookie })).toEqual([])
  })
})

describe('admin: validação', () => {
  it('recusa ocupadas acima do total', async () => {
    const { cookie } = await entrarComo('senha-de-admin-de-teste')
    const [rua] = await $fetch<ResumoDaRua[]>('/api/admin/resumo', { headers: { cookie } })
    const resposta = await fetch('/api/admin/contagens', {
      method: 'PUT',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ ruaId: rua?.ruaId, data: DOMINGO_SEM_DEMONSTRACAO, contagens: [{ faixa: '19:00', vagasTotais: 10, vagasOcupadas: 11 }] }),
    })
    expect(resposta.status).toBe(400)
  })
})

describe('admin: capacidade e painéis', () => {
  it('salva a capacidade fixa e mostra acerto e calibração', async () => {
    const { cookie } = await entrarComo('senha-de-admin-de-teste')
    const comCookie = { headers: { cookie } }
    const [rua] = await $fetch<ResumoDaRua[]>('/api/admin/resumo', comCookie)
    await $fetch(`/api/admin/ruas/${rua?.ruaId}`, { method: 'PATCH', body: { capacidade: 32 }, ...comCookie })
    const resumo = await $fetch<ResumoDaRua[]>('/api/admin/resumo', comCookie)
    expect(resumo.find(item => item.ruaId === rua?.ruaId)?.capacidade).toBe(32)
    expect(await $fetch<AcertoDaPrevisao[]>('/api/admin/acerto', comCookie)).toEqual(expect.any(Array))
    const calibracao = await $fetch<LinhaDeCalibracao[]>('/api/admin/calibracao', comCookie)
    expect(calibracao).toHaveLength(7)
    expect(calibracao[0]).toMatchObject({ tipo: 'estado', resposta: 'livre', valorDaTabela: 0.45 })
    expect((await fetch('/api/admin/calibracao')).status).toBe(401)
  })
})

async function postarComo(caminho: string, corpo: unknown, cookie = ''): Promise<{ status: number, cookie: string, dados: unknown }> {
  const resposta = await fetch(caminho, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}) },
    body: JSON.stringify(corpo),
  })
  const novo = resposta.headers.get('set-cookie')?.split(';')[0]
  return { status: resposta.status, cookie: novo || cookie, dados: await resposta.json().catch(() => null) }
}

describe('conta: e-mail opcional', () => {
  it('começa sem e-mail e recusa e-mail inválido', async () => {
    expect(await $fetch<ContaDoAparelho>('/api/conta')).toEqual({ disponivel: true, verificado: false })
    expect((await postarComo('/api/conta/codigo', { email: 'nao-e-email' })).status).toBe(400)
  })

  it('envia código quantas vezes for pedido e recusa código errado sem bloquear', async () => {
    const primeiro = await postarComo('/api/conta/codigo', { email: 'pessoa@exemplo.com' })
    expect(primeiro.status).toBe(202)
    for (let vez = 0; vez < 6; vez += 1) {
      const errado = await postarComo('/api/conta/verificar', { codigo: '000000' }, primeiro.cookie)
      expect(errado.status).toBe(400)
    }
    for (let vez = 0; vez < 4; vez += 1) {
      expect((await postarComo('/api/conta/codigo', { email: 'outro@exemplo.com' }, primeiro.cookie)).status).toBe(202)
    }
  })
})

describe('relatos de usuários', () => {
  it('exige ao menos uma resposta', async () => {
    const area = await areaMedida()
    const [rua] = await $fetch<PrevisaoRua[]>('/api/ruas', { query: { area: area.id } })
    expect((await postarComo('/api/relatos', { ruaId: rua?.ruaId })).status).toBe(400)
  })

  it('entra na chance agora, mostra o relato recente e substitui o anterior da mesma faixa', async () => {
    const area = await areaMedida()
    const alexandre = (await $fetch<PrevisaoRua[]>('/api/ruas', { query: { area: area.id } })).find(rua => rua.nome === 'R. Alexandre Marquez')
    const primeiro = await postarComo('/api/relatos', { ruaId: alexandre?.ruaId, estado: 'livre', tempo: 'ate_2' })
    expect(primeiro.status).toBe(201)
    expect(primeiro.dados).toMatchObject({ peso: 0.5, pertoDaRua: false, substituiu: false })
    const segundo = await postarComo('/api/relatos', { ruaId: alexandre?.ruaId, estado: 'lotado' }, primeiro.cookie)
    expect((segundo.dados as RelatoRegistrado).substituiu).toBe(true)
    const depois = (await $fetch<PrevisaoRua[]>('/api/ruas', { query: { area: area.id } })).find(rua => rua.ruaId === alexandre?.ruaId)
    expect(depois?.relatoRecente).toMatchObject({ estado: 'lotado', relatos: 1 })
    expect(depois?.confianca).toMatchObject({ origem: 'combinada', fontes: { relatos: 1, pesquisa: 81 } })
  })
})
