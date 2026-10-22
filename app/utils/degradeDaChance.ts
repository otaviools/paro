export type FaixaDoDegrade = 'baixa' | 'media' | 'alta'

const LIMITE_MEDIA = 40
const LIMITE_ALTA = 60

export const degradeDaChance: Record<FaixaDoDegrade, [string, string]> = {
  baixa: ['#D44A4D', '#6E2628'],
  media: ['#D5974F', '#998242'],
  alta: ['#00DC82', '#007646'],
}

export function faixaDoDegrade(percentual: number): FaixaDoDegrade {
  if (percentual >= LIMITE_ALTA) return 'alta'
  if (percentual >= LIMITE_MEDIA) return 'media'
  return 'baixa'
}

export function degradeVertical(percentual: number) {
  const [inicio, fim] = degradeDaChance[faixaDoDegrade(percentual)]
  return { type: 'linear' as const, x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: inicio }, { offset: 1, color: fim }] }
}

export function degradeCss(percentual: number): string {
  const [inicio, fim] = degradeDaChance[faixaDoDegrade(percentual)]
  return `linear-gradient(to bottom, ${inicio}, ${fim})`
}
