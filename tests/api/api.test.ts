import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { $fetch, fetch, setup } from '@nuxt/test-utils/e2e'
import type { Area } from '../../shared/types/area'
import type { PrevisaoRua } from '../../shared/types/previsao'
import type { Vaga } from '../../shared/types/vaga'

await setup({
  rootDir: fileURLToPath(new URL('../..', import.meta.url)),
  server: true,
  browser: false,
  env: { NUXT_DATABASE_URL: 'pglite://memoria', NUXT_SESSION_PASSWORD: 'senha-de-teste-com-mais-de-32-caracteres' },
})

async function areaMedida(): Promise<Area> {
  const areas = await $fetch<Area[]>('/api/areas')
  const area = areas.find(item => item.ruasMedidas > 0)
  if (!area) throw new Error('Seed sem área medida')
  return area
}

describe('previsões', () => {
  it('lista as seis ruas ordenadas por chance, com estado e horário da medição', async () => {
    const area = await areaMedida()
    const ruas = await $fetch<PrevisaoRua[]>('/api/ruas', { query: { area: area.id, horario: '19:00' } })
    expect(ruas.map(rua => rua.nome)).toEqual([
      'R. Arlindo Teixeira',
      'R. Rivalino Pereira',
      'Av. Belo Horizonte',
      'Av. Vasconcelos Costa',
      'R. Alexandre Marquez',
      'R. Duque de Caxias',
    ])
    expect(ruas[0]).toMatchObject({ estado: 'livre', chance: { min: 60, max: 70 } })
    expect(ruas.filter(rua => rua.chance).every(rua => rua.medidoEm)).toBe(true)
    expect(ruas.at(-1)).toMatchObject({ estado: 'sem_dado', chance: null, temMedicao: false })
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
