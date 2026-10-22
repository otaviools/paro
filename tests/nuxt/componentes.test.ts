import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import PadraoOcupacao from '~/components/ocupacao/PadraoOcupacao.vue'
import LegendaOcupacao from '~/components/ocupacao/LegendaOcupacao.vue'
import CardRua from '~/components/rua/CardRua.vue'
import GraficoDaNoite from '~/components/rua/GraficoDaNoite.vue'
import type { PrevisaoRua } from '#shared/types/previsao'

const previsao: PrevisaoRua = {
  ruaId: 'rua-1',
  nome: 'Av. Belo Horizonte',
  distanciaM: 150,
  estado: 'apertado',
  chance: { min: 25, max: 35 },
  medidoEm: '2026-10-06T22:00:00.000Z',
  temMedicao: true,
  confianca: { origem: 'campo', nivel: 'media', amostra: 4, margem: 6 },
  relatoRecente: null,
}

describe('PadraoOcupacao', () => {
  it.each([
    ['livre', 'Livre'],
    ['apertado', 'Apertado'],
    ['lotado', 'Lotado'],
    ['sem_dado', 'Sem dado'],
  ] as const)('dá nome acessível ao padrão %s', async (estado, rotulo) => {
    const componente = await mountSuspended(PadraoOcupacao, { props: { estado } })
    expect(componente.attributes('aria-label')).toBe(rotulo)
  })

  it('desenha o tracejado só no sem dado', async () => {
    const semDado = await mountSuspended(PadraoOcupacao, { props: { estado: 'sem_dado' } })
    const livre = await mountSuspended(PadraoOcupacao, { props: { estado: 'livre' } })
    expect(semDado.find('rect').attributes('stroke-dasharray')).toBe('4 3')
    expect(livre.find('rect').attributes('stroke-dasharray')).toBeUndefined()
  })
})

describe('LegendaOcupacao', () => {
  it('mostra os quatro rótulos, nunca só a cor', async () => {
    const legenda = await mountSuspended(LegendaOcupacao)
    expect(legenda.text()).toContain('Livre')
    expect(legenda.text()).toContain('Apertado')
    expect(legenda.text()).toContain('Lotado')
    expect(legenda.text()).toContain('Sem dado')
  })
})

describe('CardRua', () => {
  it('mostra rótulo, faixa de chance e horário da medição', async () => {
    const card = await mountSuspended(CardRua, { props: { previsao } })
    expect(card.text()).toContain('Av. Belo Horizonte')
    expect(card.text()).toContain('Apertado')
    expect(card.text()).toContain('25–35%')
    expect(card.text()).toContain('medido às 19:00')
  })
})

describe('GraficoDaNoite', () => {
  it('destaca o horário atual e avisa que é previsão', async () => {
    const grafico = await mountSuspended(GraficoDaNoite, {
      props: {
        pontos: [
          { faixa: '18:00', rotulo: '18h', chance: 40, agora: false, origem: 'campo' },
          { faixa: '19:00', rotulo: '19h', chance: 30, agora: true, origem: 'campo' },
        ],
      },
    })
    expect(grafico.find('[role="img"]').attributes('aria-label')).toContain('agora: 30%')
    expect(grafico.text()).toContain('Não é garantia')
  })
})
