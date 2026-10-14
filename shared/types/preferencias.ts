import { z } from 'zod'

export const esquemaPreferencias = z.object({
  tema: z.enum(['claro', 'escuro', 'sistema']),
  areaPadraoId: z.uuid().nullable(),
  consentimento: z.boolean(),
  localizacaoAoLigar: z.boolean(),
  localizacaoContinua: z.boolean(),
  registroManual: z.boolean(),
  lembrarSaida: z.boolean(),
})

export type Preferencias = z.infer<typeof esquemaPreferencias>

export type TemaPreferido = Preferencias['tema']

export const preferenciasPadrao: Preferencias = {
  tema: 'sistema',
  areaPadraoId: null,
  consentimento: false,
  localizacaoAoLigar: true,
  localizacaoContinua: false,
  registroManual: false,
  lembrarSaida: true,
}
