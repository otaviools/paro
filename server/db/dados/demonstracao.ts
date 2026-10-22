export const VAGAS_DE_DEMONSTRACAO = 40

export const chancesDeDemonstracao: Record<string, (number | null)[]> = {
  'R. Arlindo Teixeira': [0.75, 0.7, 0.65, 0.65, 0.7, 0.8],
  'R. Rivalino Pereira': [0.55, 0.45, 0.35, 0.4, 0.55, 0.7],
  'Av. Belo Horizonte': [0.55, 0.4, 0.3, 0.35, 0.5, 0.7],
  'Av. Vasconcelos Costa': [0.2, 0.1, 0.025, 0.025, 0.1, 0.3],
  'R. Alexandre Marquez': [0.6, 0.5, null, null, null, null],
}
